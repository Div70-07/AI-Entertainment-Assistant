import api from "./api";

const PROFILE_CACHE_KEY = "active_profile";
const USER_KEY = "auth_user";

export async function getMyProfile() {
  const response = await api.get("/profile/me");
  return response.data;
}

export function getCachedProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    const cachedProfile = raw ? JSON.parse(raw) : null;
    const authUserRaw = localStorage.getItem(USER_KEY);
    const authUser = authUserRaw ? JSON.parse(authUserRaw) : null;

    if (
      cachedProfile?._id &&
      authUser?.id &&
      String(cachedProfile.owner) === String(authUser.id)
    ) {
      return cachedProfile;
    }

    localStorage.removeItem(PROFILE_CACHE_KEY);
    return null;
  } catch {
    localStorage.removeItem(PROFILE_CACHE_KEY);
    return null;
  }
}

export function cacheProfile(profile) {
  if (!profile?._id) {
    return;
  }

  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
}

export function clearCachedProfile() {
  localStorage.removeItem(PROFILE_CACHE_KEY);
}

export async function resolveProfile() {
  const cachedProfile = getCachedProfile();

  if (cachedProfile?._id) {
    return cachedProfile;
  }

  const profile = await getMyProfile();

  if (profile?._id) {
    cacheProfile(profile);
  }

  return profile || null;
}
