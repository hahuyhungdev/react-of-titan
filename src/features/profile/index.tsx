import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileStatsCard } from "./components/ProfileStatsCard";
import { useProfile } from "./hooks/useProfile";

/**
 * Compound component — composes profile internals.
 * Page renders this single component.
 */
export function ProfileSection() {
  const { profile, isLoading, error } = useProfile();

  if (isLoading) return <div className="page-loading">Loading profile…</div>;
  if (error)
    return (
      <div className="page-error" role="alert">
        {error}
      </div>
    );

  if (!profile) return null;

  return (
    <section className="profile-section" aria-label="User profile">
      <ProfileHeader
        name={profile.name}
        email={profile.email}
        avatar={profile.avatar}
        bio={profile.bio}
        location={profile.location}
        website={profile.website}
        joinedAt={profile.joinedAt}
      />
      <ProfileStatsCard stats={profile.stats} />
    </section>
  );
}

export default ProfileSection;
