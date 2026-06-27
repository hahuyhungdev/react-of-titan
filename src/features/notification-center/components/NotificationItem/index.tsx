import type { Notification } from "../../types/notification.types";

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <li
      className={`notification-item notification-item-${notification.type} ${
        notification.read ? "read" : "unread"
      }`}
    >
      <div className="notification-item-header">
        <span className="notification-item-title">{notification.title}</span>
        <span className="notification-item-time">
          {new Date(notification.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <p className="notification-item-message">{notification.message}</p>
    </li>
  );
}

export default NotificationItem;
