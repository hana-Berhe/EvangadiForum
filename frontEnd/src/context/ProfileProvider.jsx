import { useCallback, useState } from "react";
import { useAuth } from "./AuthContext";
import { ProfileContext } from "./ProfileContext";

function cacheKey(userId) {
  return `profile:${userId}`;
}

function readCachedProfile(userId) {
  try {
    const profile = JSON.parse(localStorage.getItem(cacheKey(userId)));
    return Number(profile?.id) === Number(userId) ? profile : null;
  } catch {
    return null;
  }
}

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [storedProfile, setStoredProfile] = useState(() => ({
    userId: user?.id,
    profile: user?.id ? readCachedProfile(user.id) : null,
  }));
  const profile =
    Number(storedProfile.userId) === Number(user?.id)
      ? storedProfile.profile
      : user?.id
        ? readCachedProfile(user.id)
        : null;

  const setProfile = useCallback(
    (nextProfile) => {
      setStoredProfile({ userId: user?.id, profile: nextProfile });
      if (user?.id && Number(nextProfile?.id) === Number(user.id)) {
        localStorage.setItem(cacheKey(user.id), JSON.stringify(nextProfile));
      }
    },
    [user],
  );

  const value = { profile, setProfile };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
