import { AnnouncementItem } from "./components/AnnouncementItem";
import { useAnnouncements } from "./hooks/useAnnouncements";

export function AnnouncementList() {
  const { announcements, isLoading, error } = useAnnouncements();

  if (isLoading) return <div className="page-loading">Loading announcements…</div>;
  if (error) {
    return (
      <div className="page-error" role="alert">
        {error}
      </div>
    );
  }

  return (
    <section className="announcement-banner-section" aria-label="Announcements">
      <div className="announcement-list">
        {announcements.map((announcement) => (
          <AnnouncementItem key={announcement.id} announcement={announcement} />
        ))}
      </div>
    </section>
  );
}

export default AnnouncementList;
