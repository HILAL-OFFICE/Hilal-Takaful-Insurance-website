const { supabaseAdmin } = require('../config/supabase');

/**
 * Verify Supabase JWT token from Authorization header
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];

    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase admin client not initialized on server' });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired authentication session' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication Error:', err);
    res.status(500).json({ error: 'Internal server authentication error' });
  }
};

module.exports = requireAuth;

