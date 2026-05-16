const AVATAR_KEY = "erp_super_admin_avatar_v1";
const PROFILE_KEY = "erp_super_admin_profile_meta_v1";

export function readSuperAdminAvatar() {
  try {
    return localStorage.getItem(AVATAR_KEY) || "";
  } catch {
    return "";
  }
}

export function writeSuperAdminAvatar(url) {
  try {
    if (url) localStorage.setItem(AVATAR_KEY, url);
    else localStorage.removeItem(AVATAR_KEY);
  } catch {
    /* ignore */
  }
}

export function readSuperAdminProfileMeta() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSuperAdminProfileMeta(meta) {
  try {
    if (meta) localStorage.setItem(PROFILE_KEY, JSON.stringify(meta));
    else localStorage.removeItem(PROFILE_KEY);
  } catch {
    /* ignore */
  }
}

export function syncSuperAdminProfileCache({ avatarUrl, name, designation, email }) {
  writeSuperAdminAvatar(avatarUrl || "");
  writeSuperAdminProfileMeta({ name, designation, email });
}
