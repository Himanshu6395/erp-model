import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    address: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    basicInfo: {
      schoolName: { type: String, trim: true },
      schoolCode: { type: String, trim: true },
      email: { type: String, lowercase: true, trim: true, default: "" },
      phoneNumber: { type: String, trim: true, default: "" },
      alternatePhone: { type: String, trim: true, default: "" },
      website: { type: String, trim: true, default: "" },
      establishedYear: { type: Number, default: null },
      schoolType: { type: String, trim: true, default: "" },
      affiliationBoard: { type: String, trim: true, default: "" },
      medium: { type: String, trim: true, default: "" },
    },
    addressDetails: {
      addressLine1: { type: String, trim: true, default: "" },
      addressLine2: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
      country: { type: String, trim: true, default: "" },
      pincode: { type: String, trim: true, default: "" },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    academicStructure: {
      classesOffered: [{ type: String, trim: true }],
      sectionsPerClass: { type: Number, default: null },
      totalCapacity: { type: Number, default: null },
      sessionStartMonth: { type: String, trim: true, default: "" },
      sessionEndMonth: { type: String, trim: true, default: "" },
    },
    schoolAdmin: {
      adminName: { type: String, trim: true, default: "" },
      adminEmail: { type: String, lowercase: true, trim: true, default: "" },
      adminPhone: { type: String, trim: true, default: "" },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    staffConfiguration: {
      maxTeachersAllowed: { type: Number, default: null },
      maxStaffAllowed: { type: Number, default: null },
      departments: [{ type: String, trim: true }],
    },
    studentConfiguration: {
      maxStudentsAllowed: { type: Number, default: null },
      admissionPrefix: { type: String, trim: true, default: "" },
      rollNumberFormat: { type: String, trim: true, default: "" },
    },
    subscription: {
      planType: { type: String, trim: true, default: "Free" },
      planPrice: { type: Number, default: 0 },
      billingCycle: { type: String, trim: true, default: "Monthly" },
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
      trialDays: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true },
    },
    paymentSettings: {
      paymentMethodEnabled: {
        razorpay: { type: Boolean, default: false },
        stripe: { type: Boolean, default: false },
        cash: { type: Boolean, default: true },
      },
      currency: { type: String, trim: true, default: "INR" },
    },
    branding: {
      schoolLogo: { type: String, trim: true, default: "" },
      favicon: { type: String, trim: true, default: "" },
      primaryColor: { type: String, trim: true, default: "#0ea5e9" },
      secondaryColor: { type: String, trim: true, default: "#1f2937" },
    },
    features: {
      attendanceModule: { type: Boolean, default: true },
      feesModule: { type: Boolean, default: true },
      examModule: { type: Boolean, default: true },
      transportModule: { type: Boolean, default: false },
      hostelModule: { type: Boolean, default: false },
      libraryModule: { type: Boolean, default: false },
    },
    security: {
      isActive: { type: Boolean, default: true },
      isBlocked: { type: Boolean, default: false },
      blockedReason: { type: String, trim: true, default: "" },
      blockedAt: { type: Date, default: null },
      loginAccess: { type: Boolean, default: true },
      allowedIPs: [{ type: String, trim: true }],
      twoFactorAuthEnabled: { type: Boolean, default: false },
      failedLoginAttempts: { type: Number, default: 0, min: 0 },
      forceLogoutAt: { type: Date, default: null },
    },
    communication: {
      smsEnabled: { type: Boolean, default: false },
      emailEnabled: { type: Boolean, default: true },
      whatsappEnabled: { type: Boolean, default: false },
    },
    documents: {
      registrationCertificate: { type: String, trim: true, default: "" },
      affiliationProof: { type: String, trim: true, default: "" },
      otherDocuments: [{ type: String, trim: true }],
    },
    preferences: {
      timezone: { type: String, trim: true, default: "Asia/Kolkata" },
      language: { type: String, trim: true, default: "English" },
      dateFormat: { type: String, trim: true, default: "DD-MM-YYYY" },
      timeFormat: { type: String, trim: true, default: "24h" },
    },
  },
  { timestamps: true }
);

const School = mongoose.model("School", schoolSchema);
export default School;
