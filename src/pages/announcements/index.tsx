import { AnnouncementList } from "@/features/announcement-banner";

export function AnnouncementsPage() {
  return (
    <div className="page announcements-page">
      <h1>Announcements</h1>
      <AnnouncementList />
    </div>
  );
}

export default AnnouncementsPage;
