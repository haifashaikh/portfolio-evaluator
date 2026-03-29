const Report = require('../models/Report');

/**
 * Cache middleware — checks MongoDB before hitting GitHub API.
 * Attaches `req.cachedReport` if a fresh cache exists.
 */
const checkCache = async (req, res, next) => {
  const username = req.params.username?.toLowerCase();
  if (!username) return next();

  try {
    const cached = await Report.findOne({ username });
    if (cached && cached.expiresAt > new Date()) {
      req.cachedReport = cached;
    }
  } catch {
    // Cache check failure should not block the request
  }

  next();
};

module.exports = { checkCache };
