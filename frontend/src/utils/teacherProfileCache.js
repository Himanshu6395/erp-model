const KEY = "erp_teacher_profile_v1";

export function readTeacherProfileCache() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeTeacherProfileCache(profile) {
  if (!profile) {
    localStorage.removeItem(KEY);
    return;
  }
  localStorage.setItem(KEY, JSON.stringify(profile));
}

export function clearTeacherProfileCache() {
  localStorage.removeItem(KEY);
  localStorage.removeItem("teacher_prefs_v1");
  localStorage.removeItem("teacher_profile_draft_v1");
}
