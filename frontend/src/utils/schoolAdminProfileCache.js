const KEY = "erp_school_admin_profile_v1";

export function readSchoolAdminProfileCache() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSchoolAdminProfileCache(profile) {
  const payload = {
    avatarUrl: profile.avatarUrl || "",
    name: profile.name || "",
    designation: profile.designation || "",
    email: profile.email || "",
  };
  localStorage.setItem(KEY, JSON.stringify(payload));
  return payload;
}
