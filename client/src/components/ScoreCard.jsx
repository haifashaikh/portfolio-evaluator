import './ScoreCard.css';

const SCORE_LABELS = {
  activity: 'Activity',
  codeQuality: 'Code Quality',
  diversity: 'Diversity',
  community: 'Community',
  hiringReady: 'Hiring Ready',
};

const SCORE_ICONS = {
  activity: '⚡',
  codeQuality: '🔬',
  diversity: '🌐',
  community: '🌟',
  hiringReady: '💼',
};

const SCORE_WEIGHTS = {
  activity: 25,
  codeQuality: 20,
  diversity: 20,
  community: 20,
  hiringReady: 15,
};

function getScoreColor(score) {
  if (score >= 75) return 'var(--green)';
  if (score >= 50) return 'var(--yellow)';
  return 'var(--red)';
}

function getScoreLabel(score) {
  if (score >= 85) return 'Exceptional';
  if (score >= 70) return 'Strong';
  if (score >= 55) return 'Solid';
  if (score >= 40) return 'Developing';
  return 'Early Stage';
}

function CircularRing({ score, size = 160, stroke = 12 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="circular-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-3)"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="ring-progress"
        />
      </svg>
      <div className="ring-inner">
        <span className="ring-score" style={{ color }}>{score}</span>
        <span className="ring-label">{getScoreLabel(score)}</span>
      </div>
    </div>
  );
}

function CategoryBar({ name, score, weight }) {
  const color = getScoreColor(score);
  return (
    <div className="category-bar">
      <div className="category-bar__header">
        <span className="category-bar__icon">{SCORE_ICONS[name]}</span>
        <span className="category-bar__label">{SCORE_LABELS[name]}</span>
        <span className="category-bar__weight mono">{weight}%</span>
        <span className="category-bar__score mono" style={{ color }}>{score}</span>
      </div>
      <div className="category-bar__track">
        <div
          className="category-bar__fill"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function ScoreCard({ scores, activityDetails }) {
  if (!scores) return null;

  return (
    <div className="scorecard card animate-fadeUp">
      <div className="scorecard__header">
        <h2 className="scorecard__title">Score Card</h2>
        <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent-2)' }}>
          Overall
        </span>
      </div>

      <div className="scorecard__main">
        <CircularRing score={scores.overall} />

        <div className="scorecard__stats">
          {activityDetails && (
            <>
              <div className="stat-chip">
                <span className="stat-chip__value mono">{activityDetails.commitsLast90Days}</span>
                <span className="stat-chip__label">Commits / 90d</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip__value mono">{activityDetails.longestStreak}</span>
                <span className="stat-chip__label">Longest Streak</span>
              </div>
              <div className="stat-chip">
                <span className="stat-chip__value mono">{activityDetails.activeDaysLast90}</span>
                <span className="stat-chip__label">Active Days</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="scorecard__categories">
        {Object.keys(SCORE_LABELS).map((key) => (
          <CategoryBar
            key={key}
            name={key}
            score={scores[key] ?? 0}
            weight={SCORE_WEIGHTS[key]}
          />
        ))}
      </div>
    </div>
  );
}
