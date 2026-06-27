export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  website: string;
  joinedAt: string;
  stats: ProfileStats;
}

export interface ProfileStats {
  projects: number;
  contributions: number;
  followers: number;
  following: number;
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
}
