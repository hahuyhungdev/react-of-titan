import type { Announcement } from "../../types/announcement.types";
import styles from "../../styles.module.scss";

interface AnnouncementItemProps {
  announcement: Announcement;
}

export function AnnouncementItem({ announcement }: AnnouncementItemProps) {
  return (
    <div className={styles["announcement-item"]}>
      <p className={styles["announcement-content"]}>{announcement.content}</p>
      <span className={styles["announcement-date"]}>{announcement.date}</span>
    </div>
  );
}
