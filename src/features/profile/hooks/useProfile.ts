import { useState, useEffect } from "react";
import type { UserProfile } from "../types/profile.types";

const MOCK_PROFILE: UserProfile = {
  id: "usr_01",
  name: "Titan Developer",
  email: "titan@reactoftitan.dev",
  avatar: "",
  bio: "Full-stack engineer passionate about scalable React architectures, clean code, and open source. Building the future one component at a time.",
  location: "Ho Chi Minh City, Vietnam",
  website: "https://reactoftitan.dev",
  joinedAt: "2024-03-15T00:00:00Z",
  stats: {
    projects: 24,
    contributions: 1_847,
    followers: 312,
    following: 89,
  },
};

/**
 * Profile feature hook.
 * TODO: Replace mock with profileApi.getProfile() once backend is ready.
 */
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (!cancelled) setProfile(MOCK_PROFILE);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  return { profile, isLoading, error };
}
