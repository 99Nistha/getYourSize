/**
 * Saved profile — stores measurements (never photos) in localStorage.
 * Full implementation comes in build step 6.
 */
const KEY = 'gys_profile';

export function saveProfile(measurements) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ measurements, savedAt: Date.now() }));
  } catch (_) {}
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function deleteProfile() {
  try { localStorage.removeItem(KEY); } catch (_) {}
}
