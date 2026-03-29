/**
 * scoringService.js
 * All scoring logic is centralised here.
 * Weights: Activity 25% | Code Quality 20% | Diversity 20% | Community 20% | Hiring Ready 15%
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

const clamp = (val, min = 0, max = 100) => Math.min(max, Math.max(min, val));
const logScale = (val, base = 10) => (val > 0 ? Math.log(val + 1) / Math.log(base) : 0);

// ── 1. Activity Score (25 pts weight → normalised to 0-100) ──────────────────
/**
 * @param {number} commitsLast90  commits pushed in the last 90 days
 * @param {number} longestStreak  consecutive active days
 * @param {number} activeDays     distinct days with at least one push (last 90)
 */
const computeActivityScore = (commitsLast90, longestStreak, activeDays) => {
  // Commits component: max 200 commits = full 60 pts
  const commitPts = clamp((commitsLast90 / 200) * 60, 0, 60);

  // Streak component: max 30-day streak = full 25 pts
  const streakPts = clamp((longestStreak / 30) * 25, 0, 25);

  // Active days component: max 45 active days out of 90 = full 15 pts
  const activePts = clamp((activeDays / 45) * 15, 0, 15);

  return Math.round(clamp(commitPts + streakPts + activePts));
};

// ── 2. Code Quality Score (20 pts weight → normalised to 0-100) ──────────────
/**
 * @param {Array}  repos  raw repo objects from GitHub API
 * @param {Set}    reposWithTests  set of repo names that have a tests folder
 */
const computeCodeQualityScore = (repos, reposWithTests = new Set()) => {
  if (!repos.length) return 0;

  const ownRepos = repos.filter((r) => !r.fork);
  if (!ownRepos.length) return 0;

  let totalPts = 0;
  const maxPtsPerRepo = 5; // README(2) + license(1) + topics(1) + tests(1)

  for (const repo of ownRepos) {
    let pts = 0;
    if (repo.has_wiki !== undefined) {
      // README proxy: GitHub API doesn't directly expose README; we use description as a signal
    }
    // README: treat presence of description as partial signal (+1), actual README check later
    if (repo.description && repo.description.trim().length > 10) pts += 1;
    // Full README bonus (if we fetched contents and confirmed README exists)
    if (repo.has_issues !== false && repo.size > 0) pts += 1; // size > 0 means non-empty repo
    // License
    if (repo.license && repo.license.key !== 'other') pts += 1;
    // Topics
    if (repo.topics && repo.topics.length > 0) pts += 1;
    // Tests folder
    if (reposWithTests.has(repo.name)) pts += 1;

    totalPts += pts;
  }

  const maxPossible = ownRepos.length * maxPtsPerRepo;
  return Math.round(clamp((totalPts / maxPossible) * 100));
};

// ── 3. Diversity Score (20 pts weight → normalised to 0-100) ─────────────────
/**
 * @param {Array}  repos  raw repo objects
 */
const computeDiversityScore = (repos) => {
  const ownRepos = repos.filter((r) => !r.fork);

  // Unique languages
  const languages = new Set(ownRepos.map((r) => r.language).filter(Boolean));
  const langPts = clamp(languages.size * 8, 0, 50); // 8 pts per language, max 50

  // Topic/category diversity
  const allTopics = new Set();
  for (const r of ownRepos) {
    (r.topics || []).forEach((t) => allTopics.add(t));
  }
  const topicPts = clamp(allTopics.size * 3, 0, 30); // 3 pts per topic, max 30

  // Repo count bonus (shows breadth of output)
  const repoPts = clamp(ownRepos.length * 1.5, 0, 20); // 1.5 pts per repo, max 20

  return Math.round(clamp(langPts + topicPts + repoPts));
};

// ── 4. Community Impact Score (20 pts weight → normalised to 0-100) ──────────
/**
 * @param {Array}   repos      raw repo objects
 * @param {number}  followers  user follower count
 */
const computeCommunityScore = (repos, followers) => {
  const ownRepos = repos.filter((r) => !r.fork);

  const totalStars = ownRepos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks = ownRepos.reduce((s, r) => s + r.forks_count, 0);

  // Log scale prevents one mega-popular repo from dominating
  const starPts = clamp(logScale(totalStars, 2) * 12, 0, 50);
  const forkPts = clamp(logScale(totalForks, 2) * 8, 0, 30);

  // Followers bonus
  let followerPts = 0;
  if (followers >= 500) followerPts = 20;
  else if (followers >= 100) followerPts = 15;
  else if (followers >= 50) followerPts = 10;
  else if (followers >= 10) followerPts = 5;

  return Math.round(clamp(starPts + forkPts + followerPts));
};

// ── 5. Hiring Readiness Score (15 pts weight → normalised to 0-100) ──────────
/**
 * @param {Object} profile  GitHub user profile object
 * @param {Array}  repos    raw repo objects (to check for pinned-like signals)
 */
const computeHiringReadyScore = (profile, repos) => {
  let pts = 0;

  // Bio filled (25 pts)
  if (profile.bio && profile.bio.trim().length > 5) pts += 25;

  // Website / blog set (25 pts)
  if (profile.blog && profile.blog.trim().length > 0) pts += 25;

  // Email public (25 pts)
  if (profile.email && profile.email.trim().length > 0) pts += 25;

  // Has repos with descriptions (proxy for "pinned & polished") (15 pts)
  const describedRepos = repos.filter(
    (r) => r.description && r.description.trim().length > 10
  );
  if (describedRepos.length >= 3) pts += 15;

  // Twitter / social presence (10 pts bonus)
  if (profile.twitter_username) pts += 10;

  return Math.round(clamp(pts));
};

// ── Overall Weighted Score ────────────────────────────────────────────────────
const WEIGHTS = {
  activity: 0.25,
  codeQuality: 0.20,
  diversity: 0.20,
  community: 0.20,
  hiringReady: 0.15,
};

const computeOverallScore = (scores) => {
  const overall =
    scores.activity * WEIGHTS.activity +
    scores.codeQuality * WEIGHTS.codeQuality +
    scores.diversity * WEIGHTS.diversity +
    scores.community * WEIGHTS.community +
    scores.hiringReady * WEIGHTS.hiringReady;

  return Math.round(clamp(overall));
};

// ── Main entry point ──────────────────────────────────────────────────────────
/**
 * Compute all scores and return a scores object
 */
const computeAllScores = ({
  profile,
  repos,
  commitsLast90,
  longestStreak,
  activeDays,
  reposWithTests,
}) => {
  const activity = computeActivityScore(commitsLast90, longestStreak, activeDays);
  const codeQuality = computeCodeQualityScore(repos, reposWithTests);
  const diversity = computeDiversityScore(repos);
  const community = computeCommunityScore(repos, profile.followers);
  const hiringReady = computeHiringReadyScore(profile, repos);

  const scores = { activity, codeQuality, diversity, community, hiringReady };
  scores.overall = computeOverallScore(scores);

  return scores;
};

module.exports = {
  computeAllScores,
  computeActivityScore,
  computeCodeQualityScore,
  computeDiversityScore,
  computeCommunityScore,
  computeHiringReadyScore,
  computeOverallScore,
};
