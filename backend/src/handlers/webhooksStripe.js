const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { query } = require("../config/db");

/**
 * POST /api/webhooks/stripe
 * Raw body required (express.raw) — mounted in src/index.js BEFORE express.json()
 * Idempotent: INSERT audit_log with UNIQUE stripe_event_id first; duplicate → early return
 * Then UPDATE that same row with action/meta inside each case (no double-insert)
 */
module.exports = async function stripeWebhookHandler(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[stripe_webhook] signature failed:", err?.message || err);
    return res.status(400).json({ error: "Invalid signature" });
  }

  // Idempotency gate: one row per event.id. Duplicate = already processed.
  try {
    await query(
      "INSERT INTO audit_log (stripe_event_id, action, meta) VALUES ($1,$2,$3)",
      [event.id, "RECEIVED_WEBHOOK", { type: event.type }]
    );
  } catch (err) {
    if (err?.code === "23505") {
      return res.json({ received: true }); // already processed
    }
    console.error("[stripe_webhook] audit insert failed:", err?.message || err);
    return res.status(500).json({ error: "Webhook audit insert failed" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId =
          session?.metadata?.userId || session?.client_reference_id || null;
        const subscriptionId = session?.subscription || null;
        const customerId = session?.customer || null;

        if (!userId) break;

        // Capture current tier for audit truth
        const prev = await query("SELECT tier FROM users WHERE id=$1", [userId]);
        const oldTier = prev.rows[0]?.tier ?? "unknown";

        // INTERNAL tier = 'premium' (matches requireTier('premium') guards)
        await query(
          `UPDATE users
             SET tier='premium',
                 stripe_customer_id = COALESCE(stripe_customer_id, $1),
                 stripe_subscription_id = COALESCE(stripe_subscription_id, $2),
                 subscription_status='active'
           WHERE id=$3`,
          [customerId, subscriptionId, userId]
        );

        // UPDATE the audit row (not a second INSERT)
        await query(
          `UPDATE audit_log
             SET action='TIER_UPGRADE',
                 target_user_id=$1,
                 meta = jsonb_build_object(
                   'from', $2,
                   'to', 'premium',
                   'stripe_event', $3,
                   'customer_id', $4,
                   'subscription_id', $5
                 )
           WHERE stripe_event_id=$6`,
          [userId, oldTier, event.type, customerId, subscriptionId, event.id]
        );

        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const subId = sub?.id || null;
        const customerId = sub?.customer || null;

        if (!subId && !customerId) break;

        // Race condition armor: match on subscription_id OR customer_id
        const u = await query(
          `SELECT id FROM users
            WHERE stripe_subscription_id=$1
               OR stripe_customer_id=$2
            LIMIT 1`,
          [subId, customerId]
        );
        if (!u.rows.length) break;

        const userId = u.rows[0].id;

        await query(
          `UPDATE users
             SET subscription_status=$1,
                 subscription_ends_at = CASE
                   WHEN $2 IS NULL THEN subscription_ends_at
                   ELSE to_timestamp($2)
                 END
           WHERE id=$3`,
          [sub.status || null, sub.current_period_end || null, userId]
        );

        // UPDATE the audit row (not a second INSERT)
        await query(
          `UPDATE audit_log
             SET action='SUBSCRIPTION_UPDATED',
                 target_user_id=$1,
                 meta = jsonb_build_object(
                   'stripe_event', $2,
                   'subscription_id', $3,
                   'customer_id', $4,
                   'status', $5,
                   'current_period_end', $6
                 )
           WHERE stripe_event_id=$7`,
          [
            userId,
            event.type,
            subId,
            customerId,
            sub.status || null,
            sub.current_period_end || null,
            event.id,
          ]
        );

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const subId = sub?.id || null;
        const customerId = sub?.customer || null;

        if (!subId && !customerId) break;

        const u = await query(
          `SELECT id FROM users
            WHERE stripe_subscription_id=$1
               OR stripe_customer_id=$2
            LIMIT 1`,
          [subId, customerId]
        );
        if (!u.rows.length) break;

        const userId = u.rows[0].id;

        // DO NOT auto-downgrade tier — keep access until period end
        await query(
          `UPDATE users
             SET subscription_status='canceled'
           WHERE id=$1`,
          [userId]
        );

        await query(
          `UPDATE audit_log
             SET action='SUBSCRIPTION_CANCELED',
                 target_user_id=$1,
                 meta = jsonb_build_object(
                   'stripe_event', $2,
                   'subscription_id', $3,
                   'customer_id', $4,
                   'note', 'Tier not downgraded automatically'
                 )
           WHERE stripe_event_id=$5`,
          [userId, event.type, subId, customerId, event.id]
        );

        break;
      }

      default: {
        await query(
          `UPDATE audit_log
             SET action='IGNORED',
                 meta = jsonb_build_object('stripe_event', $1)
           WHERE stripe_event_id=$2`,
          [event.type, event.id]
        );
        break;
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("[stripe_webhook] processing error:", err?.message || err);
    // Idempotency row exists; return 200 to prevent retry storms
    return res.json({ received: true });
  }
};
