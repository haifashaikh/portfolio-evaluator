const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: 'portfolio-evaluator/1.0.0',
});

// Language color map for UI display
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Scala: '#c22d40',
  R: '#198CE7',
  MATLAB: '#e16737',
  Lua: '#000080',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
};

/**
 * Fetch user profile data
 */
const getUserProfile = async (username) => {
  const { data } = await octokit.users.getByUsername({ username });
  return data;
};

/**
 * Fetch all public repos (up to 100)
 */
const getUserRepos = async (username) => {
  const { data } = await octokit.repos.listForUser({
    username,
    per_page: 100,
    sort: 'updated',
    type: 'owner',
  });
  return data;
};

/**
 * Fetch recent public events (last 300 events max)
 */
const getUserEvents = async (username) => {
  try {
    const { data } = await octokit.activity.listPublicEventsForUser({
      username,
      per_page: 100,
    });
    return data;
  } catch {
    return [];
  }
};

/**
 * Check if a repo has a tests folder by looking at root contents
 */
const repoHasTestFolder = async (owner, repo) => {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path: '' });
    if (!Array.isArray(data)) return false;
    const names = data.map((f) => f.name.toLowerCase());
    return (
      names.includes('tests') ||
      names.includes('test') ||
      names.includes('__tests__') ||
      names.includes('spec') ||
      names.includes('specs')
    );
  } catch {
    return false;
  }
};

/**
 * Build a contribution heatmap from push events
 * Returns: { 'YYYY-MM-DD': commitCount }
 */
const buildHeatmapFromEvents = (events) => {
  const heatmap = {};
  const pushEvents = events.filter((e) => e.type === 'PushEvent');

  for (const event of pushEvents) {
    const date = event.created_at.split('T')[0];
    const commits = event.payload?.commits?.length || 1;
    heatmap[date] = (heatmap[date] || 0) + commits;
  }

  return heatmap;
};

/**
 * Calculate commits in the last N days from events
 */
const getCommitsInLastNDays = (events, days = 90) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const pushEvents = events.filter(
    (e) => e.type === 'PushEvent' && new Date(e.created_at) >= cutoff
  );

  return pushEvents.reduce(
    (sum, e) => sum + (e.payload?.commits?.length || 1),
    0
  );
};

/**
 * Calculate longest active streak (consecutive days with pushes)
 */
const getLongestStreak = (heatmap) => {
  if (!Object.keys(heatmap).length) return 0;

  const dates = Object.keys(heatmap).sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr - prev) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
};

/**
 * Aggregate language distribution across all repos
 */
const aggregateLanguages = (repos) => {
  const langCount = {};
  for (const repo of repos) {
    if (repo.language) {
      langCount[repo.language] = (langCount[repo.language] || 0) + 1;
    }
  }

  const total = Object.values(langCount).reduce((s, v) => s + v, 0) || 1;

  return Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({
      name,
      percent: Math.round((count / total) * 100),
      color: LANGUAGE_COLORS[name] || '#8b949e',
    }));
};

/**
 * Get top repos sorted by stars
 */
const getTopRepos = (repos, limit = 6) => {
  return repos
    .filter((r) => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, limit)
    .map((r) => ({
      name: r.name,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language || 'Unknown',
      description: r.description || '',
      url: r.html_url,
      topics: r.topics || [],
      updatedAt: r.updated_at,
    }));
};

module.exports = {
  getUserProfile,
  getUserRepos,
  getUserEvents,
  repoHasTestFolder,
  buildHeatmapFromEvents,
  getCommitsInLastNDays,
  getLongestStreak,
  aggregateLanguages,
  getTopRepos,
};
