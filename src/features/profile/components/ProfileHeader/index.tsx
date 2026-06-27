interface ProfileHeaderProps {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  joinedAt: string;
}

/**
 * Profile header — avatar, name, bio, and metadata.
 * Internal component; not exported from the feature index.
 */
export function ProfileHeader({
  name,
  email,
  avatar,
  bio,
  location,
  website,
  joinedAt,
}: ProfileHeaderProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formattedDate = new Date(joinedAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="profile-header">
      <div className="profile-avatar" aria-label={`${name}'s avatar`}>
        {avatar ? (
          <img src={avatar} alt={`${name}'s avatar`} className="profile-avatar-img" />
        ) : (
          <span className="profile-avatar-initials">{initials}</span>
        )}
      </div>

      <div className="profile-identity">
        <h2 className="profile-name">{name}</h2>
        <span className="profile-email">{email}</span>
      </div>

      {bio && <p className="profile-bio">{bio}</p>}

      <div className="profile-meta">
        {location && (
          <span className="profile-meta-item">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {location}
          </span>
        )}
        {website && (
          <span className="profile-meta-item">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <a href={website} target="_blank" rel="noopener noreferrer">
              {website.replace(/^https?:\/\//, "")}
            </a>
          </span>
        )}
        <span className="profile-meta-item">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Joined {formattedDate}
        </span>
      </div>
    </div>
  );
}
