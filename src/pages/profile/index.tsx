import { ProfileSection } from "@/features/profile";

export function ProfilePage() {
  return (
    <div className="page profile-page">
      <h1>Profile</h1>
      <p className="page-description">Your public profile and activity summary.</p>
      <ProfileSection />
    </div>
  );
}

export default ProfilePage;
