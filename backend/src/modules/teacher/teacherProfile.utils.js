const PROFILE_TRACKED_FIELDS = [
  "name",
  "email",
  "phone",
  "gender",
  "dateOfBirth",
  "qualification",
  "experience",
  "bloodGroup",
  "addressLine",
  "city",
  "state",
  "country",
  "pincode",
  "employeeId",
  "department",
  "bio",
  "profileImage",
  "coverImage",
];

export function toStoredProfileUrl(file) {
  if (!file?.filename) return "";
  return `/uploads/teachers/${file.filename}`;
}

export function parseMultipartBool(value) {
  return value === true || value === "true" || value === "1";
}

export function formatTeacherProfileDto(teacher, extras = {}) {
  const user = teacher.userId;
  const firstName = String(teacher.firstName || "").trim();
  const lastName = String(teacher.lastName || "").trim();
  const fullName = String(user?.name || "").trim() || `${firstName} ${lastName}`.trim() || "Teacher";

  const subjectLabel =
    (teacher.subjectNames || []).filter(Boolean).join(", ") ||
    (extras.subjectNames || []).filter(Boolean).join(", ") ||
    teacher.department ||
    "—";

  const assignedClasses = extras.assignedClasses || [];
  const classLabels = assignedClasses.map((c) => c.label || c.className).filter(Boolean);
  const sections = [...new Set([...(teacher.sections || []), ...assignedClasses.map((c) => c.section).filter(Boolean)])];

  return {
    teacherId: String(teacher._id),
    userId: String(user?._id || ""),
    name: fullName,
    firstName,
    lastName,
    email: user?.email || "",
    phone: teacher.phone || user?.phone || "",
    gender: teacher.gender || "OTHER",
    dateOfBirth: teacher.dateOfBirth || null,
    qualification: teacher.qualification || "",
    experience: teacher.experience ?? 0,
    bloodGroup: teacher.bloodGroup || "",
    addressLine: teacher.addressLine || "",
    city: teacher.city || "",
    state: teacher.state || "",
    country: teacher.country || "",
    pincode: teacher.pincode || "",
    employeeId: teacher.employeeId || "",
    department: teacher.department || "",
    subject: subjectLabel,
    subjectNames: teacher.subjectNames || extras.subjectNames || [],
    joiningDate: teacher.joiningDate || null,
    employmentType: teacher.employmentType || "",
    assignedClasses,
    classAssigned: classLabels.join(", ") || "—",
    sectionAssigned: sections.join(", ") || "—",
    profileImage: teacher.profileImage || "",
    coverImage: teacher.coverImage || "",
    bio: teacher.bio || "",
    socialLinks: {
      linkedin: teacher.socialLinks?.linkedin || "",
      facebook: teacher.socialLinks?.facebook || "",
      twitter: teacher.socialLinks?.twitter || "",
      website: teacher.socialLinks?.website || "",
    },
    preferences: {
      theme: teacher.settings?.theme || "brand",
      language: teacher.settings?.language || "en",
      sidebarMode: teacher.settings?.sidebarMode || "expanded",
      notificationSound: teacher.settings?.notificationSound !== false,
      darkMode: Boolean(teacher.settings?.darkMode),
      fontSize: teacher.settings?.fontSize || "medium",
      compactMode: Boolean(teacher.settings?.compactMode),
      animationsEnabled: teacher.settings?.animationsEnabled !== false,
    },
    notificationPrefs: {
      email: teacher.notificationPrefs?.email !== false,
      sms: Boolean(teacher.notificationPrefs?.sms),
      leaveApproval: teacher.notificationPrefs?.leaveApproval !== false,
      leaveAlerts: teacher.notificationPrefs?.leaveAlerts !== false,
      announcements: teacher.notificationPrefs?.announcements !== false,
      attendance: teacher.notificationPrefs?.attendance !== false,
      examAlerts: teacher.notificationPrefs?.examAlerts !== false,
    },
    role: "Teacher",
    updatedAt: teacher.updatedAt,
    createdAt: teacher.createdAt,
  };
}

export function profileCompletionPercent(dto) {
  const checks = [
    dto.name,
    dto.email,
    dto.phone,
    dto.gender && dto.gender !== "OTHER",
    dto.dateOfBirth,
    dto.qualification,
    dto.experience > 0,
    dto.addressLine,
    dto.city,
    dto.profileImage,
    dto.employeeId,
    dto.department,
    dto.bio,
  ];
  const filled = checks.filter((v) => v !== null && v !== undefined && String(v).trim() !== "").length;
  return Math.round((filled / checks.length) * 100);
}

export function buildProfileUpdatePayload(body, files = {}) {
  const payload = { teacher: {}, user: {}, socialLinks: {}, removeProfileImage: false, removeCoverImage: false };

  const assign = (key, val) => {
    if (val !== undefined && val !== null && val !== "") payload.teacher[key] = val;
  };

  if (body.name !== undefined) payload.user.name = String(body.name).trim();
  if (body.email !== undefined) payload.user.email = String(body.email).trim().toLowerCase();
  if (body.phone !== undefined) {
    payload.user.phone = String(body.phone).trim();
    payload.teacher.phone = String(body.phone).trim();
  }
  if (body.firstName !== undefined) payload.teacher.firstName = String(body.firstName).trim();
  if (body.lastName !== undefined) payload.teacher.lastName = String(body.lastName).trim();
  if (body.gender !== undefined) payload.teacher.gender = body.gender;
  if (body.dateOfBirth !== undefined && body.dateOfBirth !== "") {
    payload.teacher.dateOfBirth = new Date(body.dateOfBirth);
  }
  if (body.qualification !== undefined) payload.teacher.qualification = String(body.qualification).trim();
  if (body.experience !== undefined && body.experience !== "") {
    payload.teacher.experience = Number(body.experience) || 0;
  }
  if (body.bloodGroup !== undefined) payload.teacher.bloodGroup = String(body.bloodGroup).trim();
  if (body.addressLine !== undefined) payload.teacher.addressLine = String(body.addressLine).trim();
  if (body.city !== undefined) payload.teacher.city = String(body.city).trim();
  if (body.state !== undefined) payload.teacher.state = String(body.state).trim();
  if (body.country !== undefined) payload.teacher.country = String(body.country).trim();
  if (body.pincode !== undefined) payload.teacher.pincode = String(body.pincode).trim();
  if (body.employmentType !== undefined) payload.teacher.employmentType = body.employmentType;
  if (body.bio !== undefined) payload.teacher.bio = String(body.bio).trim();

  if (body.linkedin !== undefined) payload.socialLinks.linkedin = String(body.linkedin).trim();
  if (body.facebook !== undefined) payload.socialLinks.facebook = String(body.facebook).trim();
  if (body.twitter !== undefined) payload.socialLinks.twitter = String(body.twitter).trim();
  if (body.website !== undefined) payload.socialLinks.website = String(body.website).trim();

  if (parseMultipartBool(body.removeProfileImage)) payload.removeProfileImage = true;
  if (parseMultipartBool(body.removeCoverImage)) payload.removeCoverImage = true;

  if (files.profileImage?.[0]) payload.teacher.profileImage = toStoredProfileUrl(files.profileImage[0]);
  if (files.coverImage?.[0]) payload.teacher.coverImage = toStoredProfileUrl(files.coverImage[0]);

  return payload;
}
