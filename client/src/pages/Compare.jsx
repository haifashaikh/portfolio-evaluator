import { useState } from 'react';
import { Link } from 'react-router-dom';
import { compareProfiles } from '../utils/api.js';
import RadarChart from '../components/RadarChart.jsx';
import './Compare.css';

const SCORE_KEYS = [
  { key: 'overall', label: 'Overall', icon: '🏆' },
  { key: 'activity', label: 'Activity', icon: '⚡' },
  { key: 'codeQuality', label: 'Code Quality', icon: '🔬' },
  { key: 'diversity', label: 'Diversity', icon: '🌐' },
  { key: 'community', label: 'Community', icon: '🌟' },
  { key: 'hiringReady', label: 'Hiring Ready', icon: '💼' },
];

function getScoreColor(score) {
  if (score >= 75) return 'var(--green)';
  if (score >= 50) return 'var(--yellow)';
  return 'var(--red)';
}

function ProfileMini({ data }) {
  if (!data) return null;
  return (
    <div className="compare-profile">
      <img src={data.avatarUrl} alt={data.name} className="compare-profile__avatar" />
      <div>
        <div className="compare-profile__name">{data.name || data.username}</div>
        <a
          href={`https://github.com/${data.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="compare-profile__handle mono"
        >
          @{data.username}
        </a>
      </div>
    </div>
  );
}

function ScoreRow({ label, icon, s1, s2 }) {
  const winner = s1 > s2 ? 1 : s2 > s1 ? 2 : 0;
  return (
    <div className="score-row">
      <div className={`score-row__val ${winner === 1 ? 'score-row__val--winner' : ''}`}>
        <span style={{ color: getScoreColor(s1) }} className="mono">{s1}</span>
        {winner === 1 && <span className="score-row__crown">👑</span>}
      </div>

      <div className="score-row__label">
        <span>{icon}</span>
        <span>{label}</span>
      </div>

      <div className={`score-row__val score-row__val--right ${winner === 2 ? 'score-row__val--winner' : ''}`}>
        {winner === 2 && <span className="score-row__crown">👑</span>}
        <span style={{ color: getScoreColor(s2) }} className="mono">{s2}</span>
      </div>
    </div>
  );
}

export default function Compare() {
  const [u1, setU1] = useState('');
  const [u2, setU2] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    if (!u1.trim() || !u2.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await compareProfiles(u1.trim(), u2.trim());
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to compare profiles.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compare-page">
      <nav className="compare-nav">
        <Link to="/" className="compare-nav__logo mono">
          DevScore<span style={{ color: 'var(--accent)' }}>.</span>
        </Link>
        <span className="compare-nav__title">Compare Mode</span>
      </nav>

      <div className="compare-content">
        {/* Input row */}
        <div className="compare-inputs card animate-fadeUp">
          <div className="compare-inputs__row">
            <div className="compare-input-group">
              <label className="compare-input-group__label mono">User 1</label>
              <input
                className="compare-input"
                type="text"
                placeholder="github-username"
                value={u1}
                onChange={(e) => setU1(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
              />
            </div>

            <span className="compare-vs mono">VS</span>

            <div className="compare-input-group">
              <label className="compare-input-group__label mono">User 2</label>
              <input
                className="compare-input"
                type="text"
                placeholder="github-username"
                value={u2}
                onChange={(e) => setU2(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
              />
            </div>
          </div>

          <button
            className="compare-btn"
            onClick={handleCompare}
            disabled={loading || !u1.trim() || !u2.trim()}
          >
            {loading ? (
              <>
                <span className="compare-btn__spinner" />
                Comparing…
              </>
            ) : (
              'Compare Profiles →'
            )}
          </button>
        </div>

        {error && (
          <div className="compare-error">{error}</div>
        )}

        {result && (
          <div className="compare-results animate-fadeUp">
            {/* Profile headers */}
            <div className="compare-profiles card">
              <ProfileMini data={result.user1} />
              <span className="compare-profiles__vs mono">VS</span>
              <ProfileMini data={result.user2} />
            </div>

            {/* Radar chart overlay */}
            <div className="compare-radar">
              <RadarChart
                scores={result.user1.scores}
                compareScores={result.user2.scores}
                username={result.user1.username}
                compareUsername={result.user2.username}
              />
            </div>

            {/* Score breakdown */}
            <div className="compare-scores card">
              <div className="compare-scores__header">
                <span className="compare-scores__name">{result.user1.username}</span>
                <span className="compare-scores__title">Category Breakdown</span>
                <span className="compare-scores__name">{result.user2.username}</span>
              </div>
              <div className="compare-scores__rows">
                {SCORE_KEYS.map(({ key, label, icon }) => (
                  <ScoreRow
                    key={key}
                    label={label}
                    icon={icon}
                    s1={result.user1.scores[key]}
                    s2={result.user2.scores[key]}
                  />
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="compare-links">
              <Link to={`/report/${result.user1.username}`} className="compare-link-btn">
                View full report for @{result.user1.username} →
              </Link>
              <Link to={`/report/${result.user2.username}`} className="compare-link-btn">
                View full report for @{result.user2.username} →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
