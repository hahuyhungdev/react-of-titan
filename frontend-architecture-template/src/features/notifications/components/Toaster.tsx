import { CloseIcon } from "@/shared/components/icons/CloseIcon";
import { dismiss, useNotifications } from "../model/notifications.store";
import "./toaster.css";

/** Mount MỘT LẦN ở tầng app. */
export function Toaster() {
  const notifications = useNotifications();

  return (
    <div role="status" aria-live="polite" className="ds-toaster">
      {notifications.map((n) => (
        <div key={n.id} data-type={n.type} className="ds-toaster__toast">
          {n.message}
          <button
            onClick={() => dismiss(n.id)}
            aria-label="Đóng"
            className="ds-toaster__close"
          >
            <CloseIcon />
          </button>
        </div>
      ))}
    </div>
  );
}
