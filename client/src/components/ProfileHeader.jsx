import './ProfileHeader.css';

function Stat({ label, value }) {
  return (
    <div className="profile-stat">
      <span className="profile-stat__value mono">{value?.toLocaleString() ?? '—'}</span>
      <span className="profile-stat__label">{label}</span>
    </div>
  );
}

export default function ProfileHeader({ data }) {
  if (!data) return null;

  const joinYear = data.createdAt_gh
    ? new Date(data.createdAt_gh).getFullYear()
    : null;

  return (
    <div className="profile-header card animate-fadeUp">
      <div className="profile-header__main">
        <div className="profile-header__avatar-wrap">
          <img
            src={data.avatarUrl}
            alt={data.name}
            className="profile-header__avatar"
          />
          <div className="profile-header__avatar-ring" />
        </div>

        <div className="profile-header__info">
          <h1 className="profile-header__name">{data.name || data.username}</h1>
          <a
            href={`https://github.com/${data.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="profile-header__username mono"
          >
            @{data.username}
          </a>

          {data.bio && <p className="profile-header__bio">{data.bio}</p>}

          <div className="profile-header__tags">
            {data.company && (
              <span className="profile-tag">
                🏢 {data.company}
              </span>
            )}
            {data.location && (
              <span className="profile-tag">
                📍 {data.location}
              </span>
            )}
            {data.blog && (
              <a
                href={data.blog.startsWith('http') ? data.blog : `https://${data.blog}`}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-tag profile-tag--link"
              >
                🔗 {data.blog}
              </a>
            )}
            {joinYear && (
              <span className="profile-tag">
                📅 Joined {joinYear}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="profile-header__stats">
        <Stat label="Followers" value={data.followers} />
        <Stat label="Following" value={data.following} />
        <Stat label="Public Repos" value={data.publicRepos} />
        <Stat label="Public Gists" value={data.publicGists} />
      </div>
    </div>
  );
}
