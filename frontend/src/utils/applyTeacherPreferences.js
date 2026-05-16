const PREFS_KEY = "teacher_prefs_v1";

export function applyTeacherPreferences(prefs = {}) {
  const root = document.documentElement;
  if (prefs.darkMode) root.classList.add("dark");
  else root.classList.remove("dark");

  const fontMap = { small: "14px", medium: "16px", large: "18px" };
  root.style.fontSize = fontMap[prefs.fontSize] || fontMap.medium;

  if (prefs.compactMode) root.dataset.density = "compact";
  else delete root.dataset.density;

  if (prefs.animationsEnabled === false) root.dataset.motion = "reduce";
  else delete root.dataset.motion;

  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function readTeacherPreferencesCache() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
