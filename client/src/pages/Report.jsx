import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProfile } from '../utils/api.js';
import ProfileHeader from '../components/ProfileHeader.jsx';
import ScoreCard from '../components/ScoreCard.jsx';
import RadarChart from '../components/RadarChart.jsx';
import HeatMap from '../components/HeatMap.jsx';
import RepoList from '../components/RepoList.jsx';
import LanguageChart from '../components/LanguageChart.jsx';
import ShareButton from '../components/ShareButton.jsx';
import SearchBar from '../components/SearchBar.jsx';
import './Report.css';

function LoadingScreen({ username }) {
  return (
    <div className="report-loading">
      <div className="report-loading__spinner" />
      <p className="report-loading__text">
        Analysing <span className="mono">@{username}</span>…
      </p>
      <p className="report-loading__sub">Fetching GitHub data & computing scores</p>
    </div>
  );
}

function ErrorScreen({ message, username }) {
  return (
    <div className="report-error">
      <div className="report-error__icon">⚠️</div>
      <h2 className="report-error__title">Something went wrong</h2>
      <p className="report-error__msg">{message}</p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
        <Link to="/" className="report-error__btn">← Back to Search</Link>
        {username && (
          <button
            className="report-error__btn report-error__btn--retry"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

export default function Report() {
  const { username } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);
    setReport(null);

    fetchProfile(username)
      .then(({ data, source }) => {
        setReport(data);
        setSource(source);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.error ||
          err.message ||
          'Failed to fetch profile. Please try again.'
        );
      })
      .finally(() => setLoading(false));
  }, [username]);

  // Update document title
  useEffect(() => {
    if (report) {
      document.title = `${report.name || report.username} · DevScore`;
    } else {
      document.title = `Loading @${username} · DevScore`;
    }
    return () => { document.title = 'DevScore — GitHub Portfolio Evaluator'; };
  }, [report, username]);

  return (
    <div className="report-page">
      {/* Top bar */}
      <nav className="report-nav">
        <Link to="/" className="report-nav__logo mono">
          DevScore<span className="report-nav__dot">.</span>
        </Link>
        <div className="report-nav__search">
          <SearchBar initialValue={username} compact />
        </div>
        <Link to="/compare" className="report-nav__compare">Compare ⇄</Link>
      </nav>

      {loading && <LoadingScreen username={username} />}
      {error && !loading && <ErrorScreen message={error} username={username} />}

      {report && !loading && (
        <div className="report-content">
          {/* Cache badge */}
          {source === 'cache' && (
            <div className="report-cache-badge animate-fadeIn">
              ⚡ Loaded from cache — report refreshes every 24 hours
            </div>
          )}

          {/* Profile header spans full width */}
          <ProfileHeader data={report} />

          {/* Share row */}
          <div className="card animate-fadeUp delay-1 report-share">
            <div className="report-share__label">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Shareable Report
            </div>
            <ShareButton url={report.shareUrl} username={report.username} />
          </div>

          {/* Main 2-col grid */}
          <div className="report-grid">
            <div className="report-grid__left">
              <ScoreCard scores={report.scores} activityDetails={report.activityDetails} />
              <RadarChart scores={report.scores} username={report.username} />
            </div>

            <div className="report-grid__right">
              <LanguageChart languages={report.languages} />
              <HeatMap heatmapData={report.heatmapData} />
            </div>
          </div>

          {/* Repos full width */}
          <RepoList repos={report.topRepos} />
        </div>
      )}
    </div>
  );
}
