import AppError from "../../common/errors/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import School from "../../models/School.js";
import User from "../../models/User.js";
import { schoolSettingsRepository } from "./repository.js";

function ensureSchoolAdmin(user) {
  if (user.role !== ROLES.SCHOOL_ADMIN) throw new AppError("Only school admin can access settings", 403);
  if (!user.schoolId) throw new AppError("School not linked to this account", 400);
  return user.schoolId;
}

function stripSmtpPassword(school) {
  const json = school.toObject ? school.toObject() : { ...school };
  if (json.smtp?.password) {
    json.smtp = { ...json.smtp, password: json.smtp.password ? "********" : "" };
  }
  return json;
}

function formatAddress(school) {
  const a = school.addressDetails || {};
  return [a.addressLine1, a.addressLine2, a.city, a.state, a.pincode].filter(Boolean).join(", ");
}

function buildPayload(school, user, lastLogin) {
  const s = stripSmtpPassword(school);
  const basic = s.basicInfo || {};
  const branding = s.branding || {};
  const prefs = s.preferences || {};
  const pay = s.paymentSettings || {};

  return {
    user: user
      ? {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role: user.role,
        }
      : null,
    profile: {
      designation: s.adminProfile?.designation || "",
      avatarUrl: s.adminProfile?.avatarUrl || "",
    },
    school: {
      schoolName: basic.schoolName || s.name || "",
      logoUrl: branding.schoolLogo || "",
      faviconUrl: branding.favicon || "",
      address: formatAddress(s) || s.address || "",
      contactNumber: basic.phoneNumber || "",
      supportEmail: basic.email || "",
      websiteUrl: basic.website || "",
      timezone: prefs.timezone || "Asia/Kolkata",
      currency: pay.currency || "INR",
      dateFormat: (prefs.dateFormat || "DD/MM/YYYY").replace(/-/g, "/"),
      academicSession: prefs.academicSession || "",
      primaryColor: branding.primaryColor || "#2563eb",
    },
    smtp: s.smtp || {},
    notifications: s.notificationSettings || {},
    theme: s.panelTheme || {},
    securityMeta: {
      lastLoginAt: lastLogin?.timestamp || null,
      lastLoginDevice: lastLogin?.device || "—",
      lastLoginIp: lastLogin?.ipAddress || "—",
    },
  };
}

export const schoolAdminSettingsService = {
  async getAll(user) {
    const schoolId = ensureSchoolAdmin(user);
    const [school, dbUser, lastLogin] = await Promise.all([
      schoolSettingsRepository.findSchoolById(schoolId),
      schoolSettingsRepository.findUserById(user.userId),
      schoolSettingsRepository.getLastLogin(user.userId),
    ]);
    if (!school) throw new AppError("School not found", 404);
    return buildPayload(school, dbUser, lastLogin);
  },

  async updateProfile(user, body) {
    const schoolId = ensureSchoolAdmin(user);
    const { name, email, phone, designation, avatarUrl } = body;
    if (!name?.trim()) throw new AppError("Name is required", 400);
    if (!email?.trim()) throw new AppError("Email is required", 400);

    const dbUser = await User.findById(user.userId);
    if (!dbUser) throw new AppError("User not found", 404);
    dbUser.name = name.trim();
    dbUser.email = email.trim().toLowerCase();
    dbUser.phone = phone?.trim() || "";
    await dbUser.save();

    const school = await School.findById(schoolId);
    if (!school) throw new AppError("School not found", 404);
    school.adminProfile = {
      designation: designation?.trim() || "",
      avatarUrl: avatarUrl ?? school.adminProfile?.avatarUrl ?? "",
    };
    school.schoolAdmin = {
      ...school.schoolAdmin?.toObject?.(),
      adminName: name.trim(),
      adminEmail: email.trim().toLowerCase(),
      adminPhone: phone?.trim() || school.schoolAdmin?.adminPhone || "",
    };
    await school.save();
    return this.getAll(user);
  },

  async changePassword(user, { currentPassword, newPassword }) {
    ensureSchoolAdmin(user);
    const dbUser = await User.findById(user.userId);
    if (!dbUser) throw new AppError("User not found", 404);
    const valid = await dbUser.comparePassword(currentPassword);
    if (!valid) throw new AppError("Current password is incorrect", 400);
    if (!newPassword || newPassword.length < 8) {
      throw new AppError("New password must be at least 8 characters", 400);
    }
    dbUser.password = newPassword;
    await dbUser.save();
    return { message: "Password updated successfully" };
  },

  async logoutAllDevices() {
    return { message: "All sessions will require re-login on next request (integration hook)" };
  },

  async updateSchoolSettings(user, body) {
    const schoolId = ensureSchoolAdmin(user);
    const school = await schoolSettingsRepository.findSchoolById(schoolId);
    if (!school) throw new AppError("School not found", 404);

    const current = school.toObject();
    const schoolName = body.schoolName?.trim() || current.basicInfo?.schoolName || current.name;

    school.name = schoolName;
    school.basicInfo = {
      ...current.basicInfo,
      schoolName,
      phoneNumber: body.contactNumber?.trim() ?? current.basicInfo?.phoneNumber ?? "",
      email: body.supportEmail?.trim() ?? current.basicInfo?.email ?? "",
      website: body.websiteUrl?.trim() ?? current.basicInfo?.website ?? "",
    };
    school.address = body.address?.trim() ?? current.address ?? "";
    school.addressDetails = {
      ...current.addressDetails,
      addressLine1: body.address?.trim() ?? current.addressDetails?.addressLine1 ?? "",
    };
    school.branding = {
      ...current.branding,
      schoolLogo: body.logoUrl ?? current.branding?.schoolLogo ?? "",
      favicon: body.faviconUrl ?? current.branding?.favicon ?? "",
      primaryColor: body.primaryColor || current.branding?.primaryColor || "#2563eb",
    };
    school.preferences = {
      ...current.preferences,
      timezone: body.timezone || current.preferences?.timezone || "Asia/Kolkata",
      dateFormat: body.dateFormat || current.preferences?.dateFormat || "DD/MM/YYYY",
      academicSession: body.academicSession?.trim() ?? current.preferences?.academicSession ?? "",
    };
    school.paymentSettings = {
      ...current.paymentSettings,
      currency: body.currency || current.paymentSettings?.currency || "INR",
    };
    await school.save();
    return this.getAll(user);
  },

  async updateSmtp(user, body) {
    const schoolId = ensureSchoolAdmin(user);
    const school = await schoolSettingsRepository.findSchoolById(schoolId);
    if (!school) throw new AppError("School not found", 404);
    const current = school.smtp?.toObject?.() || school.smtp || {};
    const password = body.password === "********" ? current.password : body.password ?? current.password;
    school.smtp = {
      host: body.host?.trim() ?? current.host ?? "",
      port: Number(body.port) || current.port || 587,
      email: body.email?.trim() ?? current.email ?? "",
      password: password || "",
      senderEmail: body.senderEmail?.trim() ?? current.senderEmail ?? "",
      senderName: body.senderName?.trim() ?? current.senderName ?? "",
    };
    await school.save();
    return this.getAll(user);
  },

  async sendTestEmail() {
    return { message: "Test email queued (SMTP integration hook)" };
  },

  async updateNotifications(user, body) {
    const schoolId = ensureSchoolAdmin(user);
    const school = await schoolSettingsRepository.findSchoolById(schoolId);
    if (!school) throw new AppError("School not found", 404);
    const current = school.notificationSettings?.toObject?.() || school.notificationSettings || {};
    school.notificationSettings = {
      email: body.email ?? current.email ?? true,
      sms: body.sms ?? current.sms ?? false,
      inquiryAlerts: body.inquiryAlerts ?? current.inquiryAlerts ?? true,
      attendanceAlerts: body.attendanceAlerts ?? current.attendanceAlerts ?? true,
      feeAlerts: body.feeAlerts ?? current.feeAlerts ?? true,
    };
    await school.save();
    return this.getAll(user);
  },

  async updateTheme(user, body) {
    const schoolId = ensureSchoolAdmin(user);
    const school = await schoolSettingsRepository.findSchoolById(schoolId);
    if (!school) throw new AppError("School not found", 404);
    const current = school.panelTheme?.toObject?.() || school.panelTheme || {};
    school.panelTheme = {
      mode: body.mode || current.mode || "light",
      sidebarColor: body.sidebarColor || current.sidebarColor || "#111827",
      headerColor: body.headerColor || current.headerColor || "#ffffff",
      primaryColor: body.primaryColor || current.primaryColor || "#2563eb",
      fontSize: body.fontSize || current.fontSize || "medium",
      borderRadius: body.borderRadius || current.borderRadius || "medium",
    };
    if (body.primaryColor) {
      school.branding = {
        ...school.branding?.toObject?.(),
        primaryColor: body.primaryColor,
      };
    }
    await school.save();
    return this.getAll(user);
  },
};
