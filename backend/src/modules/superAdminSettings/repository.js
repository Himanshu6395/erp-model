import PlatformSettings from "../../models/PlatformSettings.js";
import User from "../../models/User.js";
import LoginActivity from "../../models/LoginActivity.js";

const DEFAULT_MODULES = ["dashboard", "students", "teachers", "attendance", "fees", "exams", "timetable", "inquiries", "reports"];

function defaultModulePerms(overrides = {}) {
  return DEFAULT_MODULES.reduce((acc, key) => {
    acc[key] = {
      view: true,
      create: key !== "reports",
      edit: key !== "reports",
      delete: false,
      ...(overrides[key] || {}),
    };
    return acc;
  }, {});
}

export function buildDefaultSettings() {
  return {
    singletonKey: "default",
    profile: { designation: "Super Administrator", avatarUrl: "" },
    platform: {
      platformName: "School ERP",
      logoUrl: "",
      faviconUrl: "",
      timezone: "Asia/Kolkata",
      currency: "INR",
      dateFormat: "DD/MM/YYYY",
    },
    smtp: {
      host: "",
      port: 587,
      email: "",
      password: "",
      senderEmail: "",
      senderName: "School ERP",
    },
    notifications: {
      email: true,
      sms: false,
      inquiryAlerts: true,
      securityAlerts: true,
      paymentAlerts: true,
    },
    billing: {
      defaultTrialDays: 14,
      gstPercentage: 18,
      currency: "INR",
      invoicePrefix: "INV",
    },
    permissions: {
      SCHOOL_ADMIN: defaultModulePerms(),
      TEACHER: defaultModulePerms({
        students: { view: true, create: false, edit: false, delete: false },
        fees: { view: false, create: false, edit: false, delete: false },
      }),
      PARENT: defaultModulePerms({
        dashboard: { view: true, create: false, edit: false, delete: false },
        students: { view: true, create: false, edit: false, delete: false },
        teachers: { view: false, create: false, edit: false, delete: false },
        attendance: { view: true, create: false, edit: false, delete: false },
        fees: { view: true, create: false, edit: false, delete: false },
        exams: { view: true, create: false, edit: false, delete: false },
        timetable: { view: true, create: false, edit: false, delete: false },
        inquiries: { view: false, create: false, edit: false, delete: false },
        reports: { view: true, create: false, edit: false, delete: false },
      }),
    },
    theme: {
      mode: "light",
      sidebarColor: "#111827",
      headerColor: "#ffffff",
      fontSize: "medium",
    },
  };
}

export const settingsRepository = {
  async getOrCreate() {
    let doc = await PlatformSettings.findOne({ singletonKey: "default" });
    if (!doc) {
      doc = await PlatformSettings.create(buildDefaultSettings());
    }
    return doc;
  },

  async saveSections(sections) {
    const doc = await this.getOrCreate();
    Object.entries(sections).forEach(([key, value]) => {
      doc.set(key, value);
      doc.markModified(key);
    });
    await doc.save();
    return doc;
  },

  async getUserProfile(userId) {
    return User.findById(userId).select("name email phone role");
  },

  async updateUserProfile(userId, payload) {
    const user = await User.findById(userId);
    if (!user) return null;
    if (payload.name != null) user.name = payload.name;
    if (payload.email != null) user.email = payload.email;
    if (payload.phone != null) user.phone = payload.phone;
    await user.save();
    return user;
  },

  async updateUserPassword(userId, newPassword) {
    const user = await User.findById(userId);
    if (!user) return null;
    user.password = newPassword;
    await user.save();
    return user;
  },

  async getLastLogin(userId) {
    return LoginActivity.findOne({ userId, status: "SUCCESS" }).sort({ timestamp: -1 }).lean();
  },
};
