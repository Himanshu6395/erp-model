import AppError from "../../common/errors/AppError.js";
import User from "../../models/User.js";
import { settingsRepository } from "./repository.js";

function stripSmtpPassword(doc) {
  const json = doc.toObject ? doc.toObject() : { ...doc };
  if (json.smtp?.password) {
    json.smtp = { ...json.smtp, password: json.smtp.password ? "********" : "" };
  }
  return json;
}

export const settingsService = {
  async getAll(userId) {
    const [settings, user, lastLogin] = await Promise.all([
      settingsRepository.getOrCreate(),
      settingsRepository.getUserProfile(userId),
      settingsRepository.getLastLogin(userId),
    ]);

    const payload = stripSmtpPassword(settings);
    payload.user = user
      ? {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role: user.role,
        }
      : null;
    payload.securityMeta = {
      lastLoginAt: lastLogin?.timestamp || null,
      lastLoginDevice: lastLogin?.device || "—",
      lastLoginIp: lastLogin?.ipAddress || "—",
    };
    return payload;
  },

  async updateProfile(userId, body) {
    const { name, email, phone, designation, avatarUrl } = body;
    if (!name?.trim()) throw new AppError("Full name is required", 400);
    if (!email?.trim()) throw new AppError("Email is required", 400);

    await settingsRepository.updateUserProfile(userId, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
    });

    const doc = await settingsRepository.getOrCreate();
    doc.profile = {
      designation: designation?.trim() || "",
      avatarUrl: avatarUrl || doc.profile?.avatarUrl || "",
    };
    await doc.save();
    return this.getAll(userId);
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const valid = await user.comparePassword(currentPassword);
    if (!valid) throw new AppError("Current password is incorrect", 400);

    if (!newPassword || newPassword.length < 8) {
      throw new AppError("New password must be at least 8 characters", 400);
    }

    await settingsRepository.updateUserPassword(userId, newPassword);
    return { message: "Password updated successfully" };
  },

  async logoutAllDevices() {
    return { message: "All sessions will require re-login on next request (integration hook)" };
  },

  async updatePlatform(body) {
    const doc = await settingsRepository.getOrCreate();
    const current = doc.platform?.toObject?.() || doc.platform || {};
    doc.platform = {
      platformName: body.platformName?.trim() || current.platformName || "School ERP",
      logoUrl: body.logoUrl ?? current.logoUrl ?? "",
      faviconUrl: body.faviconUrl ?? current.faviconUrl ?? "",
      timezone: body.timezone || current.timezone || "Asia/Kolkata",
      currency: body.currency || current.currency || "INR",
      dateFormat: body.dateFormat || current.dateFormat || "DD/MM/YYYY",
      supportEmail: body.supportEmail?.trim() ?? current.supportEmail ?? "",
      supportContact: body.supportContact?.trim() ?? current.supportContact ?? "",
      websiteUrl: body.websiteUrl?.trim() ?? current.websiteUrl ?? "",
      address: body.address?.trim() ?? current.address ?? "",
      primaryColor: body.primaryColor || current.primaryColor || "#2563eb",
      academicSession: body.academicSession?.trim() ?? current.academicSession ?? "",
    };
    await doc.save();
    return stripSmtpPassword(doc);
  },

  async getPublicPlatform() {
    const doc = await settingsRepository.getOrCreate();
    const p = doc.platform?.toObject?.() || doc.platform || {};
    return {
      platformName: p.platformName || "School ERP",
      logoUrl: p.logoUrl || "",
      faviconUrl: p.faviconUrl || "",
      timezone: p.timezone || "Asia/Kolkata",
      currency: p.currency || "INR",
      dateFormat: p.dateFormat || "DD/MM/YYYY",
      supportEmail: p.supportEmail || "",
      supportContact: p.supportContact || "",
      websiteUrl: p.websiteUrl || "",
      address: p.address || "",
      primaryColor: p.primaryColor || "#2563eb",
      academicSession: p.academicSession || "",
    };
  },

  async updateSmtp(body) {
    const doc = await settingsRepository.getOrCreate();
    const next = { ...doc.smtp.toObject?.() || doc.smtp, ...body };
    if (body.password === "********" || body.password === "") {
      next.password = doc.smtp.password;
    }
    doc.smtp = next;
    await doc.save();
    return stripSmtpPassword(doc);
  },

  async sendTestEmail() {
    return { message: "Test email queued (configure SMTP transport in production)" };
  },

  async updateNotifications(body) {
    const doc = await settingsRepository.saveSections({ notifications: body });
    return stripSmtpPassword(doc);
  },

  async updateBilling(body) {
    const doc = await settingsRepository.saveSections({ billing: body });
    return stripSmtpPassword(doc);
  },

  async updatePermissions(body) {
    const doc = await settingsRepository.saveSections({ permissions: body });
    return stripSmtpPassword(doc);
  },

  async updateTheme(body) {
    const theme = {
      mode: body.mode === "dark" ? "dark" : "light",
      sidebarColor: body.sidebarColor || "#111827",
      headerColor: body.headerColor || "#ffffff",
      primaryColor: body.primaryColor || "#2563eb",
      fontSize: ["small", "medium", "large"].includes(body.fontSize) ? body.fontSize : "medium",
      borderRadius: ["small", "medium", "large"].includes(body.borderRadius) ? body.borderRadius : "medium",
    };
    const doc = await settingsRepository.saveSections({ theme });
    return stripSmtpPassword(doc);
  },

  async getPublicTheme() {
    const doc = await settingsRepository.getOrCreate();
    const theme = doc.theme?.toObject?.() || doc.theme || {};
    return {
      mode: theme.mode || "light",
      sidebarColor: theme.sidebarColor || "#111827",
      headerColor: theme.headerColor || "#ffffff",
      primaryColor: theme.primaryColor || "#2563eb",
      fontSize: theme.fontSize || "medium",
      borderRadius: theme.borderRadius || "medium",
    };
  },
};
