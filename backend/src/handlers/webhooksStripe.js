const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/db');

async function auditInsertGate(event) {
  try {
    await pool.query(
      'INSERT INTO audit_log (stripe_event_id, action, meta) VALUES ($1, $2, $3::jsonb)',
      [event.id, event.type, JSON.stringify({ received_at: new Date().toISOString() })]
    );
    return { inserted: true };
  } catch (e) {
    if (e && e.code === '23505') {
      return { inserted: false, idempotent: true };
    }
    throw e;
  }
}

async function auditUpdate(eventId, patch) {
  const sets = [];
  const vals = [eventId];
  let i = 2;

  if (patch.action) {
    sets.push(`action = $${i++}`);
    vals.push(patch.action);
  }
  if (patch.target_user_id) {
    sets.push(`target_user_id = $${i++}::uuid`);
    vals.push(patch.target_user_id);
  }
  if (patch.meta) {
    sets.push(`meta = COALESCE(meta,'{}'::jsonb) || $${i++}::jsonb`);
    vals.push(JSON.stringify(patch.meta));
  }

  if (sets.length > 0) {
    await pool.query(
      `UPDATE audit_log SET ${sets.join(', ')} WHERE stripe_event_id = $1`,
      vals
    );
  }
}

async function findUserByStripe(subId, customerId) {
  let r = await pool.query('SELECT id, tier FROM users WHERE stripe_subscription_id = $1 LIMIT 1', [subId]);
  if (r.rows.length === 0 && customerId) {
    r = await pool.query('SELECT id, tier FROM users WHERE stripe_customer_id = $1 LIMIT 1', [customerId]);
  }
  return r.rows[0] || null;
}

async function handleCheckoutCompleted(event) {
  const session = event.data.object;
  const customerId = session.customer || null;
  const subscriptionId = session.subscription || null;
  const userId = session.metadata && session.metadata.userId;
  const isLeadCheckout = session.metadata && session.metadata.lead_checkout === 'true';

  if (userId && !isLeadCheckout) {
    const userResult = await pool.query('SELECT id, tier FROM users WHERE id = $1 LIMIT 1', [userId]);
    const oldTier = userResult.rows.length > 0 ? userResult.rows[0].tier : 'unknown';

    await pool.query(
      "UPDATE users SET tier = 'inner_circle', stripe_customer_id = COALESCE(stripe_customer_id, $1), stripe_subscription_id = COALESCE(stripe_subscription_id, $2), subscription_status = 'active' WHERE id = $3",
      [customerId, subscriptionId, userId]
    );

    await auditUpdate(event.id, {
      action: 'checkout.session.completed',
      target_user_id: userId,
      meta: { flow: 'authed', old_tier: oldTier, new_tier: 'inner_circle', customerId, subscriptionId }
    });

    console.log('[STRIPE] upgraded user=' + userId + ' -> inner_circle');
    return;
  }

  if (isLeadCheckout) {
    const customer = await stripe.customers.retrieve(customerId);
    const email = customer && customer.email;

    if (email) {
      await pool.query('UPDATE leads SET converted_at = NOW() WHERE email = $1', [email]);
      await auditUpdate(event.id, {
        action: 'lead.checkout.completed',
        meta: { flow: 'lead', old_tier: 'lead', new_tier: 'inner_circle', customerId, subscriptionId, email }
      });
      console.log('[STRIPE] lead converted email=' + email);
    } else {
      await auditUpdate(event.id, {
        action: 'lead.checkout.completed',
        meta: { flow: 'lead', error: 'no_customer_email', customerId, subscriptionId }
      });
    }
  }
}

async function handleSubscriptionUpdated(event) {
  const sub = event.data.object;
  const subId = sub.id || null;
  const customerId = sub.customer || null;
  const status = sub.status || null;
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;

  const user = await findUserByStripe(subId, customerId);
  if (!user) {
    await auditUpdate(event.id, {
      action: 'customer.subscription.updated',
      meta: { subId, customerId, status, note: 'no_user_match' }
    });
    return;
  }

  await pool.query(
    'UPDATE users SET subscription_status = $1, subscription_ends_at = $2, stripe_subscription_id = COALESCE(stripe_subscription_id, $3) WHERE id = $4',
    [status, periodEnd, subId, user.id]
  );

  await auditUpdate(event.id, {
    action: 'customer.subscription.updated',
    target_user_id: user.id,
    meta: { old_tier: user.tier, subId, customerId, status }
  });
}

async function handleSubscriptionDeleted(event) {
  const sub = event.data.object;
  const subId = sub.id || null;
  const customerId = sub.customer || null;
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;

  const user = await findUserByStripe(subId, customerId);
  if (!user) {
    await auditUpdate(event.id, {
      action: 'customer.subscription.deleted',
      meta: { subId, customerId, note: 'no_user_match' }
    });
    return;
  }

  await pool.query(
    'UPDATE users SET subscription_status = $1, subscription_ends_at = $2 WHERE id = $3',
    ['canceled', periodEnd, user.id]
  );

  await auditUpdate(event.id, {
    action: 'customer.subscription.deleted',
    target_user_id: user.id,
    meta: { old_tier: user.tier, new_tier: 'canceled_pending', subId, customerId, endsAt: periodEnd }
  });

  console.log('[STRIPE] subscription canceled user=' + user.id);
}

const stripeWebhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[STRIPE] signature failed:', err.message);
    return res.status(400).json({ error: 'SIGNATURE_INVALID' });
  }

  try {
    const gate = await auditInsertGate(event);
    if (gate.idempotent) {
      console.log('IDEMPOTENT_SKIP:', event.id, event.type);
      return res.status(200).json({ received: true, idempotent: true });
    }
  } catch (e) {
    console.error('[STRIPE] audit gate failed:', e);
    return res.status(500).json({ error: 'AUDIT_GATE_FAILED' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;
      default:
        await auditUpdate(event.id, { meta: { unhandled: true, type: event.type } });
        return res.status(200).json({ received: true, unhandled: event.type });
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[STRIPE] processing failed:', err);
    try {
      await auditUpdate(event.id, { meta: { processing_error: String(err && err.message || err) } });
    } catch (_) {}
    return res.status(500).json({ error: 'PROCESSING_FAILED' });
  }
};

module.exports = stripeWebhookHandler;
