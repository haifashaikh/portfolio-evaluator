const express = require('express');
const router = express.Router();
const {
  getProfile,
  getCachedProfile,
  compareProfiles,
  healthCheck,
} = require('../controllers/profileController');

// Health check
router.get('/health', healthCheck);

// Compare two profiles
router.get('/compare', compareProfiles);

// Get (or generate) a profile report
router.get('/profile/:username', getProfile);

// Get only cached profile (no GitHub call)
router.get('/profile/:username/cached', getCachedProfile);

module.exports = router;
