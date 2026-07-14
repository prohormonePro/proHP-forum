const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticate } = require('../middleware/auth');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const router = express.Router();

const PRICE_ID = process.env.STRIPE_INNER_CIRCLE_PRICE_ID
  || process.env.STRIPE_PREMIUM_PRICE_ID
  || process.env.STRIPE_ELITE_PRICE_ID;

const publicMembershipState = (row) => {
  const status = String(row?.subscription_status || '').toLowerCase();
  const hasSubscription = Boolean(row?.stripe_subscription_id);
  const canceled = status === 'canceled';

  return {
    status: canceled ? 'canceled' : (hasSubscription ? 'active' : 'unavailable'),
    can_cancel: hasSubscription && !canceled,
  };
};

// Read only the signed-in user's local membership state. This never creates a
// provider session or performs a provider request.
router.get('/membership', authenticate, async (req, res) => {
  res.set('Cache-Control', 'no-store');

  try {
    const result = await pool.query(
      `SELECT stripe_subscription_id, subscription_status
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Membership unavailable' });
    }

    return res.json({ membership: publicMembershipState(result.rows[0]) });
  } catch (error) {
    console.error('[membership/status]', error?.code || 'failed');
    return res.status(500).json({ error: 'Membership unavailable' });
  }
});

// Immediately cancel only the subscription already bound to the authenticated
// account. Identity and subscription identifiers are never accepted from the
// browser.
router.post('/cancel-membership', authenticate, async (req, res) => {
  res.set('Cache-Control', 'no-store');

  if (req.body && Object.keys(req.body).length > 0) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  let client;
  try {
    client = await pool.getClient();
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [String(req.user.id)]);

    const result = await client.query(
      `SELECT id, stripe_customer_id, stripe_subscription_id, subscription_status
       FROM users
       WHERE id = $1
       FOR UPDATE`,
      [req.user.id]
    );

    const user = result.rows[0];
    if (!user || !user.stripe_customer_id || !user.stripe_subscription_id) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Membership cannot be canceled' });
    }

    const current = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
    const currentCustomerId = typeof current.customer === 'string'
      ? current.customer
      : current.customer?.id;

    if (!currentCustomerId || currentCustomerId !== user.stripe_customer_id) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Membership cannot be canceled' });
    }

    let canceled = current;
    if (current.status !== 'canceled') {
      if (current.status === 'incomplete_expired') {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'Membership cannot be canceled' });
      }
      canceled = await stripe.subscriptions.cancel(user.stripe_subscription_id);
    }

    if (canceled.status !== 'canceled') {
      throw new Error('CANCELLATION_NOT_CONFIRMED');
    }

    const updatedUser = await client.query(
      `UPDATE users
       SET subscription_status = 'canceled',
           subscription_ends_at = NOW(),
           tier = CASE WHEN tier = 'inner_circle' THEN 'free' ELSE tier END
       WHERE id = $1
       RETURNING tier`,
      [user.id]
    );
    await client.query(
      `INSERT INTO audit_log (actor_user_id, target_user_id, action, meta)
       VALUES ($1, $1, 'membership.canceled_by_member', $2::jsonb)`,
      [user.id, JSON.stringify({ source: 'profile_settings', result: 'canceled' })]
    );
    await client.query('COMMIT');

    return res.json({
      membership: { status: 'canceled', can_cancel: false },
      tier: updatedUser.rows[0].tier,
    });
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (_) {}
    }
    console.error('[membership/cancel]', error?.code || error?.type || 'failed');
    return res.status(502).json({ error: 'Membership could not be canceled. Please try again.' });
  } finally {
    if (client) client.release();
  }
});

router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    if (!PRICE_ID) {
      console.error('No Stripe price ID configured');
      return res.status(500).json({ error: 'Payment not configured' });
    }

    const userId = req.user.id;
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    if (user.tier === 'inner_circle') {
      return res.status(409).json({ error: 'Already upgraded to Inner Circle' });
    }

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: String(userId) }
      });
      customerId = customer.id;
      await pool.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, userId]);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/welcome?upgraded=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}${req.body.return_path || '/join'}`,
      metadata: { userId: String(userId) },
      client_reference_id: String(userId),
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.post('/create-lead-checkout', async (req, res) => {
  try {
    if (!PRICE_ID) {
      return res.status(500).json({ error: 'Payment not configured' });
    }

    let leadEmail = null;

    const leadToken = req.cookies && req.cookies.prohp_lead_access;
    if (leadToken) {
      try {
        const decoded = jwt.verify(leadToken, process.env.JWT_SECRET);
        if (decoded.lead) {
          const leadResult = await pool.query(
            'SELECT email FROM leads WHERE email = $1',
            [decoded.email]
          );
          if (leadResult.rows.length > 0) {
            leadEmail = leadResult.rows[0].email;
          }
        }
      } catch (jwtErr) {
        console.log('Invalid lead token:', jwtErr.message);
      }
    }

    if (!leadEmail && req.body && req.body.email) {
      leadEmail = req.body.email;
    }

    if (!leadEmail) {
      // Clear stale lead cookie server-side (httpOnly cannot be cleared from JS)
      res.clearCookie('prohp_lead_access', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
      });
      return res.status(400).json({ error: 'Email required for checkout', action: 'recapture' });
    }

    const customer = await stripe.customers.create({
      email: leadEmail,
      metadata: { lead_checkout: 'true' }
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/claim-account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}${req.body.return_path || '/compounds'}`,
      metadata: { lead_checkout: 'true' },
      client_reference_id: customer.id,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Lead checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
});


// Consultation checkout
router.post('/create-consultation-checkout', async (req, res) => {
  try {
    // Try to get user from auth token (optional)
    let user = null;
    let isIC = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.sub || decoded.id]);
        if (userResult.rows.length > 0) {
          user = userResult.rows[0];
          isIC = user.tier === 'inner_circle' || user.tier === 'admin';
        }
      } catch (e) { /* token invalid/expired, proceed as free */ }
    }
    // Also check request body tier hint
    if (!isIC && req.body && req.body.tier === 'inner_circle') {
      isIC = false; // Don't trust client claim without valid token
    }
    const priceId = isIC
      ? (process.env.STRIPE_CONSULTATION_IC_PRICE_ID || process.env.STRIPE_CONSULTATION_PRICE_ID)
      : process.env.STRIPE_CONSULTATION_PRICE_ID;

    if (!priceId) {
      console.error('No consultation price ID configured');
      return res.status(500).json({ error: 'Consultation checkout not configured' });
    }

    const session = await stripe.checkout.sessions.create({
      ...(user ? { customer_email: user.email } : {}),
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: process.env.FRONTEND_URL + '/?consultation=success',
      cancel_url: process.env.FRONTEND_URL + '/consultation',
      metadata: { user_id: user ? user.id : 'anonymous', type: 'consultation', tier: isIC ? 'inner_circle' : 'free' },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Consultation checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

module.exports = router;
