import './RepoList.css';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function LangDot({ color }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: color || '#8b949e',
        flexShrink: 0,
      }}
    />
  );
}

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#2b7489', Python: '#3572A5',
  Java: '#b07219', 'C++': '#f34b7d', C: '#555555', 'C#': '#178600',
  Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95',
  Swift: '#ffac45', Kotlin: '#A97BFF', Dart: '#00B4AB', HTML: '#e34c26',
  CSS: '#563d7c', Shell: '#89e051', Vue: '#41b883', Svelte: '#ff3e00',
};

export default function RepoList({ repos = [] }) {
  if (!repos.length) return null;

  return (
    <div className="repolist card animate-fadeUp delay-3">
      <h2 className="repolist__title">Top Repositories</h2>
      <div className="repolist__grid">
        {repos.map((repo) => (
          <a
            key={repo.name}
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="repo-card"
          >
            <div className="repo-card__top">
              <span className="repo-card__icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </span>
              <span className="repo-card__name mono">{repo.name}</span>
            </div>

            {repo.description && (
              <p className="repo-card__desc">{repo.description}</p>
            )}

            {repo.topics?.length > 0 && (
              <div className="repo-card__topics">
                {repo.topics.slice(0, 3).map((t) => (
                  <span key={t} className="repo-card__topic">{t}</span>
                ))}
              </div>
            )}

            <div className="repo-card__meta">
              {repo.language && (
                <span className="repo-card__lang">
                  <LangDot color={LANG_COLORS[repo.language]} />
                  {repo.language}
                </span>
              )}
              <span className="repo-card__stat">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {repo.stars}
              </span>
              <span className="repo-card__stat">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>
                </svg>
                {repo.forks}
              </span>
              <span className="repo-card__updated">{timeAgo(repo.updatedAt)}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
