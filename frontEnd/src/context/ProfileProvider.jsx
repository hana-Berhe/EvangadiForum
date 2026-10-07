import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { ProfileContext } from "./ProfileContext";
import { getUserProfile } from "../api/profile.api";

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [storedProfile, setStoredProfile] = useState({
    userId: null,
    profile: null,
  });

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    getUserProfile(user.id)
      .then((result) => {
        const loaded = result?.data ?? result;
        if (!cancelled && Number(loaded?.id) === Number(user.id)) {
          setStoredProfile({ userId: user.id, profile: loaded });
        }
      })
      .catch(() => {
        // Keep showing initials if the profile can't be loaded.
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Only expose a profile that belongs to the current user.
  const profile =
    user?.id && Number(storedProfile.userId) === Number(user.id)
      ? storedProfile.profile
      : null;

  const setProfile = useCallback(
    (nextProfile) => {
      setStoredProfile({ userId: user?.id, profile: nextProfile });
    },
    [user],
  );

  const value = { profile, setProfile };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
