import { NotificationList } from "@/features/notification-center";

export function NotificationsPage() {
  return (
    <div className="page notifications-page">
      <h1>Notifications</h1>
      <p className="page-description">Manage and view your notifications.</p>
      <NotificationList />
    </div>
  );
}

export default NotificationsPage;
