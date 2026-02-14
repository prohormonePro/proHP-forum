const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

// ── Tier hierarchy (higher index = higher access) ──
const TIER_LEVELS = { lab_rat: 0, premium: 1, elite: 2, admin: 3 };

/**
 * authenticate — Verify JWT and attach user to req
 * Sets req.user = { id, email, username, tier, is_founding, is_banned }
 */
async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch current user state (tier might have changed since token issued)
    const result = await query(
      'SELECT id, email, username, tier, is_founding, is_banned FROM users WHERE id = $1',
      [payload.sub]
    );

    if (!result.rows[0]) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    if (user.is_banned) {
      return res.status(403).json({ error: 'Account suspended' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * requireTier — Middleware factory for tier-gated routes
 * Usage: router.get('/lab', authenticate, requireTier('premium'), handler)
 */
function requireTier(minimumTier) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userLevel = TIER_LEVELS[req.user.tier] ?? 0;
    const requiredLevel = TIER_LEVELS[minimumTier] ?? 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: `This content requires ${minimumTier} tier or above`,
        code: 'TIER_REQUIRED',
        required_tier: minimumTier,
        current_tier: req.user.tier,
      });
    }

    next();
  };
}

/**
 * requireAdmin — Shorthand for admin-only routes
 */
const requireAdmin = requireTier('admin');

/**
 * optionalAuth — Attach user if token present, continue if not
 * Useful for routes that behave differently for logged-in users
 */
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query(
      'SELECT id, email, username, tier, is_founding, is_banned FROM users WHERE id = $1',
      [payload.sub]
    );
    req.user = result.rows[0] || null;
  } catch {
    req.user = null;
  }

  next();
}

module.exports = { authenticate, requireTier, requireAdmin, optionalAuth, TIER_LEVELS };
