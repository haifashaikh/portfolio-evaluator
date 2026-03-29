const Report = require('../models/Report');
const {
  getUserProfile,
  getUserRepos,
  getUserEvents,
  repoHasTestFolder,
  buildHeatmapFromEvents,
  getCommitsInLastNDays,
  getLongestStreak,
  aggregateLanguages,
  getTopRepos,
} = require('../services/githubService');
const { computeAllScores } = require('../services/scoringService');

// ── Helpers ──────────────────────────────────────────────────────────────────

const buildShareUrl = (username, req) => {
  const base = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;
  return `${base}/report/${username}`;
};

const getActiveDaysLast90 = (events) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const days = new Set(
    events
      .filter((e) => e.type === 'PushEvent' && new Date(e.created_at) >= cutoff)
      .map((e) => e.created_at.split('T')[0])
  );
  return days.size;
};

// ── Build a fresh report from GitHub API ─────────────────────────────────────
const buildReport = async (username, req) => {
  const [profile, repos, events] = await Promise.all([
    getUserProfile(username),
    getUserRepos(username),
    getUserEvents(username),
  ]);

  // Check a sample of repos for test folders (limit to top 10 to avoid rate limits)
  const topRepoNames = repos
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10)
    .map((r) => r.name);

  const testChecks = await Promise.allSettled(
    topRepoNames.map((name) => repoHasTestFolder(username, name))
  );

  const reposWithTests = new Set(
    topRepoNames.filter((_, i) => testChecks[i].value === true)
  );

  const heatmap = buildHeatmapFromEvents(events);
  const commitsLast90 = getCommitsInLastNDays(events, 90);
  const longestStreak = getLongestStreak(heatmap);
  const activeDays = getActiveDaysLast90(events);

  const scores = computeAllScores({
    profile,
    repos,
    commitsLast90,
    longestStreak,
    activeDays,
    reposWithTests,
  });

  const topRepos = getTopRepos(repos, 6);
  const languages = aggregateLanguages(repos);

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs

  const reportData = {
    username: profile.login,
    avatarUrl: profile.avatar_url,
    name: profile.name || profile.login,
    bio: profile.bio || '',
    company: profile.company || '',
    location: profile.location || '',
    blog: profile.blog || '',
    email: profile.email || '',
    twitterUsername: profile.twitter_username || '',
    followers: profile.followers,
    following: profile.following,
    publicRepos: profile.public_repos,
    publicGists: profile.public_gists,
    createdAt_gh: profile.created_at,
    scores,
    topRepos,
    languages,
    heatmapData: heatmap,
    activityDetails: {
      commitsLast90Days: commitsLast90,
      longestStreak,
      activeDaysLast90: activeDays,
      totalEventsLast90: events.filter((e) => {
        const d = new Date(e.created_at);
        return d >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      }).length,
    },
    shareUrl: buildShareUrl(profile.login, req),
    cachedAt: new Date(),
    expiresAt,
  };

  return reportData;
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/profile/:username
 * Fetch from cache or GitHub, store in MongoDB, return report
 */
exports.getProfile = async (req, res) => {
  const { username } = req.params;

  try {
    // Check cache first
    const cached = await Report.findOne({ username: username.toLowerCase() });
    if (cached && cached.expiresAt > new Date()) {
      return res.json({ source: 'cache', data: cached });
    }

    // Build fresh report from GitHub
    const reportData = await buildReport(username, req);

    // Upsert into MongoDB
    const report = await Report.findOneAndUpdate(
      { username: username.toLowerCase() },
      reportData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ source: 'github', data: report });
  } catch (err) {
    if (err.status === 404) {
      return res
        .status(404)
        .json({ error: `GitHub user "${username}" not found.` });
    }
    if (err.status === 403) {
      return res
        .status(429)
        .json({ error: 'GitHub API rate limit exceeded. Please try again later.' });
    }
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

/**
 * GET /api/profile/:username/cached
 * Return cached report only (no GitHub call)
 */
exports.getCachedProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const cached = await Report.findOne({ username: username.toLowerCase() });
    if (!cached || cached.expiresAt <= new Date()) {
      return res.status(404).json({ error: 'No fresh cache found for this user.' });
    }
    return res.json({ source: 'cache', data: cached });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/compare?u1=:u1&u2=:u2
 * Compare two GitHub profiles
 */
exports.compareProfiles = async (req, res) => {
  const { u1, u2 } = req.query;
  if (!u1 || !u2) {
    return res.status(400).json({ error: 'Both u1 and u2 query params are required.' });
  }

  try {
    const [r1, r2] = await Promise.all([
      Report.findOne({ username: u1.toLowerCase() }),
      Report.findOne({ username: u2.toLowerCase() }),
    ]);

    const fetchIfMissing = async (cached, username) => {
      if (cached && cached.expiresAt > new Date()) return cached;
      const reportData = await buildReport(username, req);
      return Report.findOneAndUpdate(
        { username: username.toLowerCase() },
        reportData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    };

    const [report1, report2] = await Promise.all([
      fetchIfMissing(r1, u1),
      fetchIfMissing(r2, u2),
    ]);

    return res.json({ user1: report1, user2: report2 });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: 'One or both GitHub users not found.' });
    }
    return res.status(500).json({ error: err.message });
  }
};

/**
 * GET /api/health
 */
exports.healthCheck = (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};
