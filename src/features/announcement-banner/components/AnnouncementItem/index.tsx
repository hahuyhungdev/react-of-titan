import type { Announcement } from "../../types/announcement.types";

interface AnnouncementItemProps {
  announcement: Announcement;
}

export function AnnouncementItem({ announcement }: AnnouncementItemProps) {
  return (
    <div
      className="announcement-item"
      style={{
        padding: "var(--space-md)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface-raised)",
        marginBottom: "var(--space-sm)",
      }}
    >
      <p style={{ margin: 0, fontWeight: 500 }}>{announcement.content}</p>
      <span
        style={{
          display: "block",
          marginTop: "var(--space-xs)",
          fontSize: "var(--text-xs)",
          color: "var(--color-text-muted)",
        }}
      >
        {announcement.date}
      </span>
    </div>
  );
}
