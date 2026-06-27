import { NotificationItem } from "./components/NotificationItem";
import { useNotifications } from "./hooks/useNotifications";

export function NotificationList() {
  const { notifications, isLoading } = useNotifications();

  if (isLoading) {
    return <div className="notifications-loading">Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return <div className="notifications-empty">No notifications.</div>;
  }

  return (
    <div className="notification-list" aria-label="Notifications center">
      <h2 className="notification-list-title">Notifications</h2>
      <ul className="notification-items">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </ul>
    </div>
  );
}

export default NotificationList;
