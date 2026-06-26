import { formatDate } from "@/shared/utils/format";
import type { Activity } from "../types/activity.types";

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return <p className="activity-empty">No recent activity.</p>;
  }

  return (
    <ul className="activity-feed" role="list">
      {activities.map((item) => (
        <li key={item.id} className={`activity-item activity-${item.type}`}>
          <span className="activity-message">{item.message}</span>
          <time className="activity-time" dateTime={item.timestamp}>
            {formatDate(item.timestamp)}
          </time>
        </li>
      ))}
    </ul>
  );
}
