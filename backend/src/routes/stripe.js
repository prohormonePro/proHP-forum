const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { query } = require("../config/db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

/**
 * POST /api/stripe/create-checkout-session
 * Auth required. Creates Stripe Checkout Session for $19/mo subscription.
 * Internal tier = 'premium' (UI name = "Brother in Arms")
 */
router.post("/create-checkout-session", authenticate, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const u = await query(
      "SELECT id, email, tier, stripe_customer_id FROM users WHERE id=$1",
      [userId]
    );
    if (!u.rows.length) return res.status(404).json({ error: "User not found" });

    const user = u.rows[0];

    // Already at paid tier or higher — no double-upgrade
    if (user.tier === "premium" || user.tier === "elite" || user.tier === "admin") {
      return res.status(409).json({ error: "Already upgraded" });
    }

    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: { userId: String(userId) },
      });

      customerId = customer.id;

      await query("UPDATE users SET stripe_customer_id=$1 WHERE id=$2", [
        customerId,
        userId,
      ]);
    }

    const frontendBase =
      process.env.FRONTEND_URL || "https://forum.prohormonepro.com";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID, quantity: 1 }],
      metadata: { userId: String(userId) },
      client_reference_id: String(userId),
      success_url: `${frontendBase}/?upgraded=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendBase}/`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("[stripe] create-checkout-session error:", err);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
});

module.exports = router;
