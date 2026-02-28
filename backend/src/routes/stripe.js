const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticate } = require('../middleware/auth');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const router = express.Router();

const PRICE_ID = process.env.STRIPE_INNER_CIRCLE_PRICE_ID
  || process.env.STRIPE_PREMIUM_PRICE_ID
  || process.env.STRIPE_ELITE_PRICE_ID;

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
      cancel_url: `${process.env.FRONTEND_URL}/join`,
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
      return res.status(400).json({ error: 'Email required for checkout' });
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
      cancel_url: `${process.env.FRONTEND_URL}/compounds`,
      metadata: { lead_checkout: 'true' },
      client_reference_id: customer.id,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Lead checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

module.exports = router;
