import { Button } from "@/shared/components/ui/Button";

export function SettingsPage() {
  return (
    <div className="page settings-page">
      <h1>Settings</h1>
      <p className="page-description">Manage your account and application preferences.</p>

      <section className="settings-section">
        <h2>Profile</h2>
        <p>Profile settings will go here.</p>
      </section>

      <section className="settings-section">
        <h2>Notifications</h2>
        <p>Notification preferences will go here.</p>
      </section>

      <Button variant="secondary">Save changes</Button>
    </div>
  );
}
