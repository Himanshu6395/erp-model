export const roles = {
  SUPER_ADMIN: "SUPER_ADMIN",
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
};

export const roleHomePath = {
  [roles.SUPER_ADMIN]: "/super-admin",
  [roles.SCHOOL_ADMIN]: "/admin",
  [roles.STUDENT]: "/student",
  [roles.TEACHER]: "/teacher",
};

export const getRoleHome = (role) => roleHomePath[role] || "/login";
