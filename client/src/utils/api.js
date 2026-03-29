import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

/**
 * Fetch (or generate) a profile report for a GitHub username.
 */
export const fetchProfile = async (username) => {
  const { data } = await api.get(`/profile/${username}`);
  return data;
};

/**
 * Fetch cached-only profile. Returns null if not cached.
 */
export const fetchCachedProfile = async (username) => {
  try {
    const { data } = await api.get(`/profile/${username}/cached`);
    return data;
  } catch {
    return null;
  }
};

/**
 * Compare two GitHub profiles.
 */
export const compareProfiles = async (u1, u2) => {
  const { data } = await api.get(`/compare?u1=${u1}&u2=${u2}`);
  return data;
};

/**
 * Server health check.
 */
export const healthCheck = async () => {
  const { data } = await api.get('/health');
  return data;
};

export default api;
