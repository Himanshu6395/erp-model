import mongoose from "mongoose";

const permissionActionsSchema = new mongoose.Schema(
  {
    view: { type: Boolean, default: true },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false }
);

const rolePermissionsSchema = new mongoose.Schema(
  {
    dashboard: { type: permissionActionsSchema, default: () => ({}) },
    students: { type: permissionActionsSchema, default: () => ({}) },
    teachers: { type: permissionActionsSchema, default: () => ({}) },
    attendance: { type: permissionActionsSchema, default: () => ({}) },
    fees: { type: permissionActionsSchema, default: () => ({}) },
    exams: { type: permissionActionsSchema, default: () => ({}) },
    timetable: { type: permissionActionsSchema, default: () => ({}) },
    inquiries: { type: permissionActionsSchema, default: () => ({}) },
    reports: { type: permissionActionsSchema, default: () => ({}) },
  },
  { _id: false }
);

const platformSettingsSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: "default", unique: true },
    profile: {
      designation: { type: String, trim: true, default: "" },
      avatarUrl: { type: String, default: "" },
    },
    platform: {
      platformName: { type: String, trim: true, default: "School ERP" },
      logoUrl: { type: String, default: "" },
      faviconUrl: { type: String, default: "" },
      timezone: { type: String, trim: true, default: "Asia/Kolkata" },
      currency: { type: String, trim: true, default: "INR" },
      dateFormat: { type: String, trim: true, default: "DD/MM/YYYY" },
      supportEmail: { type: String, trim: true, default: "" },
      supportContact: { type: String, trim: true, default: "" },
      websiteUrl: { type: String, trim: true, default: "" },
      address: { type: String, default: "" },
      primaryColor: { type: String, default: "#2563eb" },
      academicSession: { type: String, trim: true, default: "" },
    },
    smtp: {
      host: { type: String, trim: true, default: "" },
      port: { type: Number, default: 587 },
      email: { type: String, trim: true, default: "" },
      password: { type: String, default: "" },
      senderEmail: { type: String, trim: true, default: "" },
      senderName: { type: String, trim: true, default: "" },
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      inquiryAlerts: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true },
      paymentAlerts: { type: Boolean, default: true },
    },
    billing: {
      defaultTrialDays: { type: Number, default: 14 },
      gstPercentage: { type: Number, default: 18 },
      currency: { type: String, trim: true, default: "INR" },
      invoicePrefix: { type: String, trim: true, default: "INV" },
    },
    permissions: {
      SCHOOL_ADMIN: { type: rolePermissionsSchema, default: () => ({}) },
      TEACHER: { type: rolePermissionsSchema, default: () => ({}) },
      PARENT: { type: rolePermissionsSchema, default: () => ({}) },
    },
    theme: {
      mode: { type: String, enum: ["light", "dark"], default: "light" },
      sidebarColor: { type: String, default: "#111827" },
      headerColor: { type: String, default: "#ffffff" },
      primaryColor: { type: String, default: "#2563eb" },
      fontSize: { type: String, enum: ["small", "medium", "large"], default: "medium" },
      borderRadius: { type: String, enum: ["small", "medium", "large"], default: "medium" },
    },
  },
  { timestamps: true }
);

const PlatformSettings = mongoose.model("PlatformSettings", platformSettingsSchema);
export default PlatformSettings;
