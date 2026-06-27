import type { ProfileStats as ProfileStatsType } from "../../types/profile.types";

interface ProfileStatsCardProps {
  stats: ProfileStatsType;
}

const STAT_ITEMS: { key: keyof ProfileStatsType; label: string }[] = [
  { key: "projects", label: "Projects" },
  { key: "contributions", label: "Contributions" },
  { key: "followers", label: "Followers" },
  { key: "following", label: "Following" },
];

/**
 * Stat counters grid — projects, contributions, followers, following.
 * Internal component; not exported from the feature index.
 */
export function ProfileStatsCard({ stats }: ProfileStatsCardProps) {
  return (
    <div className="profile-stats-grid" aria-label="Profile statistics">
      {STAT_ITEMS.map(({ key, label }) => (
        <div key={key} className="profile-stat-item">
          <span className="profile-stat-value">{stats[key].toLocaleString()}</span>
          <span className="profile-stat-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
