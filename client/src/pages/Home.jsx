import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import './Home.css';

const EXAMPLE_USERS = ['torvalds', 'gaearon', 'sindresorhus', 'yyx990803', 'tj'];

const FEATURES = [
  { icon: '⚡', title: 'Activity Score', desc: 'Commits, streaks, and push frequency over the last 90 days.' },
  { icon: '🔬', title: 'Code Quality', desc: 'READMEs, licenses, topics, and test coverage signals.' },
  { icon: '🌐', title: 'Diversity', desc: 'Language variety and breadth of project categories.' },
  { icon: '🌟', title: 'Community Impact', desc: 'Stars, forks, and followers via a logarithmic scale.' },
  { icon: '💼', title: 'Hiring Readiness', desc: 'Bio, website, email, and public profile completeness.' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* Nav */}
      <nav className="home-nav">
        <span className="home-nav__logo mono">DevScore<span className="home-nav__dot">.</span></span>
        <a className="home-nav__compare" href="/compare">Compare →</a>
      </nav>

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero__bg-grid" aria-hidden />

        <div className="home-hero__pill animate-fadeUp">
          <span className="home-hero__pill-dot" />
          Free · No login required · Powered by GitHub API
        </div>

        <h1 className="home-hero__heading animate-fadeUp delay-1">
          Score any<br />
          <span className="home-hero__heading-accent">GitHub profile</span><br />
          in seconds
        </h1>

        <p className="home-hero__sub animate-fadeUp delay-2">
          Enter a GitHub username and get a detailed scorecard covering activity,
          code quality, diversity, community impact, and hiring readiness.
          Every report gets a unique shareable URL.
        </p>

        <div className="home-hero__search animate-fadeUp delay-3">
          <SearchBar />
        </div>

        <div className="home-hero__examples animate-fadeUp delay-4">
          <span className="home-hero__examples-label">Try:</span>
          {EXAMPLE_USERS.map((u) => (
            <button
              key={u}
              className="home-hero__example-btn mono"
              onClick={() => navigate(`/report/${u}`)}
            >
              {u}
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="home-features">
        <h2 className="home-features__heading">What we measure</h2>
        <div className="home-features__grid">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`feature-card animate-fadeUp delay-${i + 1}`}
            >
              <span className="feature-card__icon">{f.icon}</span>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <span className="mono">DevScore</span>
        <span>·</span>
        <span>Built with GitHub REST API · No AI · No login</span>
        <span>·</span>
        <a href="/compare">Compare Mode</a>
      </footer>
    </div>
  );
}
