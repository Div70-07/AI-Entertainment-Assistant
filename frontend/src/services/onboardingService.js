const ONBOARDING_KEY_PREFIX = "onboarding_intents_v1";

const buildKey = (userId) => `${ONBOARDING_KEY_PREFIX}:${userId}`;

export function hasCompletedOnboarding(userId) {
  if (!userId) {
    return false;
  }

  return localStorage.getItem(buildKey(userId)) === "done";
}

export function markOnboardingComplete(userId) {
  if (!userId) {
    return;
  }

  localStorage.setItem(buildKey(userId), "done");
}
