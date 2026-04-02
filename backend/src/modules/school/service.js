import AppError from "../../common/errors/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import { schoolRepository } from "./repository.js";
import User from "../../models/User.js";
import School from "../../models/School.js";
import ClassModel from "../../models/Class.js";
import { subscriptionService } from "../subscription/service.js";

const numberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const dateOrNull = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const createSchool = async (payload) => {
  const schoolName = payload.schoolName?.trim() || payload.name?.trim();
  const schoolCode = (payload.schoolCode?.trim() || payload.code?.trim() || "").toUpperCase();
  const adminName = payload.adminName?.trim();
  const adminEmail = payload.adminEmail?.trim().toLowerCase();
  const adminPassword = payload.adminPassword;

  if (!schoolName || !schoolCode) {
    throw new AppError("School name and school code are required", 400);
  }
  if (!adminName || !adminEmail || !adminPassword) {
    throw new AppError("School admin name, email and password are required", 400);
  }

  const existingSchool = await School.findOne({ code: schoolCode });
  if (existingSchool) throw new AppError("School code already exists", 409);

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) throw new AppError("Admin email already in use", 409);

  const schoolPayload = {
    name: schoolName,
    code: schoolCode,
    address: payload.addressLine1?.trim() || payload.address?.trim() || "",
    isActive: payload.isActive ?? payload.securityIsActive ?? true,
    basicInfo: {
      schoolName,
      schoolCode,
      email: payload.email?.trim() || "",
      phoneNumber: payload.phoneNumber?.trim() || "",
      alternatePhone: payload.alternatePhone?.trim() || "",
      website: payload.website?.trim() || "",
      establishedYear: numberOrNull(payload.establishedYear),
      schoolType: payload.schoolType || "",
      affiliationBoard: payload.affiliationBoard || "",
      medium: payload.medium || "",
    },
    addressDetails: {
      addressLine1: payload.addressLine1?.trim() || "",
      addressLine2: payload.addressLine2?.trim() || "",
      city: payload.city?.trim() || "",
      state: payload.state?.trim() || "",
      country: payload.country?.trim() || "",
      pincode: payload.pincode?.trim() || "",
      latitude: numberOrNull(payload.latitude),
      longitude: numberOrNull(payload.longitude),
    },
    academicStructure: {
      classesOffered: toArray(payload.classesOffered),
      sectionsPerClass: numberOrNull(payload.sectionsPerClass),
      totalCapacity: numberOrNull(payload.totalCapacity),
      sessionStartMonth: payload.sessionStartMonth || "",
      sessionEndMonth: payload.sessionEndMonth || "",
    },
    schoolAdmin: {
      adminName,
      adminEmail,
      adminPhone: payload.adminPhone?.trim() || "",
    },
    staffConfiguration: {
      maxTeachersAllowed: numberOrNull(payload.maxTeachersAllowed),
      maxStaffAllowed: numberOrNull(payload.maxStaffAllowed),
      departments: toArray(payload.departments),
    },
    studentConfiguration: {
      maxStudentsAllowed: numberOrNull(payload.maxStudentsAllowed),
      admissionPrefix: payload.admissionPrefix?.trim() || "",
      rollNumberFormat: payload.rollNumberFormat?.trim() || "",
    },
    subscription: {
      planType: payload.planType || "Free",
      planPrice: numberOrNull(payload.planPrice) ?? 0,
      billingCycle: payload.billingCycle || "Monthly",
      startDate: dateOrNull(payload.startDate),
      endDate: dateOrNull(payload.endDate),
      trialDays: numberOrNull(payload.trialDays) ?? 0,
      isActive: payload.subscriptionIsActive ?? payload.isActive ?? true,
    },
    paymentSettings: {
      paymentMethodEnabled: {
        razorpay: Boolean(payload.razorpayEnabled),
        stripe: Boolean(payload.stripeEnabled),
        cash: Boolean(payload.cashEnabled),
      },
      currency: payload.currency || "INR",
    },
    branding: {
      schoolLogo: payload.schoolLogo?.trim() || "",
      favicon: payload.favicon?.trim() || "",
      primaryColor: payload.primaryColor || "#0ea5e9",
      secondaryColor: payload.secondaryColor || "#1f2937",
    },
    features: {
      attendanceModule: Boolean(payload.attendanceModule),
      feesModule: Boolean(payload.feesModule),
      examModule: Boolean(payload.examModule),
      transportModule: Boolean(payload.transportModule),
      hostelModule: Boolean(payload.hostelModule),
      libraryModule: Boolean(payload.libraryModule),
    },
    security: {
      isActive: payload.securityIsActive ?? payload.isActive ?? true,
      isBlocked: Boolean(payload.isBlocked),
      loginAccess: payload.loginAccess ?? true,
      allowedIPs: toArray(payload.allowedIPs),
      twoFactorAuthEnabled: Boolean(payload.twoFactorAuthEnabled),
    },
    communication: {
      smsEnabled: Boolean(payload.smsEnabled),
      emailEnabled: Boolean(payload.emailEnabled),
      whatsappEnabled: Boolean(payload.whatsappEnabled),
    },
    documents: {
      registrationCertificate: payload.registrationCertificate?.trim() || "",
      affiliationProof: payload.affiliationProof?.trim() || "",
      otherDocuments: toArray(payload.otherDocuments),
    },
    preferences: {
      timezone: payload.timezone || "Asia/Kolkata",
      language: payload.language || "English",
      dateFormat: payload.dateFormat || "DD-MM-YYYY",
      timeFormat: payload.timeFormat || "24h",
    },
  };

  const school = await schoolRepository.createSchool(schoolPayload);

  try {
    const schoolAdmin = await schoolRepository.createUser({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      phone: payload.adminPhone?.trim() || "",
      role: ROLES.SCHOOL_ADMIN,
      schoolId: school._id,
    });

    school.schoolAdmin.userId = schoolAdmin._id;
    await school.save();
    await subscriptionService.assignDefaultSubscription(school._id);

    return { school, schoolAdmin };
  } catch (error) {
    await School.findByIdAndDelete(school._id);
    throw error;
  }
};

const getAllSchools = async (query = {}) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const skip = (page - 1) * limit;

  const search = (query.search || "").trim();
  const schoolType = (query.schoolType || "").trim();
  const board = (query.board || "").trim();
  const status = (query.status || "").trim();

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
      { "addressDetails.city": { $regex: search, $options: "i" } },
      { "basicInfo.schoolName": { $regex: search, $options: "i" } },
      { "basicInfo.schoolCode": { $regex: search, $options: "i" } },
    ];
  }
  if (schoolType) filter["basicInfo.schoolType"] = schoolType;
  if (board) filter["basicInfo.affiliationBoard"] = board;
  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;

  const [rows, total] = await Promise.all([
    schoolRepository.getSchools({ filter, skip, limit }),
    schoolRepository.countSchools(filter),
  ]);

  return {
    data: rows,
    total,
    page,
    pages: Math.max(Math.ceil(total / limit), 1),
  };
};

const getSchoolById = async (schoolId) => {
  const school = await schoolRepository.getSchoolById(schoolId);
  if (!school) throw new AppError("School not found", 404);
  return school;
};

const updateSchoolById = async (schoolId, payload) => {
  const school = await schoolRepository.getSchoolById(schoolId);
  if (!school) throw new AppError("School not found", 404);

  const update = {
    ...(payload.schoolName ? { name: payload.schoolName, "basicInfo.schoolName": payload.schoolName } : {}),
    ...(payload.schoolCode ? { code: payload.schoolCode.toUpperCase(), "basicInfo.schoolCode": payload.schoolCode.toUpperCase() } : {}),
    ...(payload.email !== undefined ? { "basicInfo.email": payload.email } : {}),
    ...(payload.phoneNumber !== undefined ? { "basicInfo.phoneNumber": payload.phoneNumber } : {}),
    ...(payload.alternatePhone !== undefined ? { "basicInfo.alternatePhone": payload.alternatePhone } : {}),
    ...(payload.website !== undefined ? { "basicInfo.website": payload.website } : {}),
    ...(payload.establishedYear !== undefined ? { "basicInfo.establishedYear": numberOrNull(payload.establishedYear) } : {}),
    ...(payload.schoolType !== undefined ? { "basicInfo.schoolType": payload.schoolType } : {}),
    ...(payload.affiliationBoard !== undefined ? { "basicInfo.affiliationBoard": payload.affiliationBoard } : {}),
    ...(payload.medium !== undefined ? { "basicInfo.medium": payload.medium } : {}),

    ...(payload.addressLine1 !== undefined ? { address: payload.addressLine1, "addressDetails.addressLine1": payload.addressLine1 } : {}),
    ...(payload.addressLine2 !== undefined ? { "addressDetails.addressLine2": payload.addressLine2 } : {}),
    ...(payload.city !== undefined ? { "addressDetails.city": payload.city } : {}),
    ...(payload.state !== undefined ? { "addressDetails.state": payload.state } : {}),
    ...(payload.country !== undefined ? { "addressDetails.country": payload.country } : {}),
    ...(payload.pincode !== undefined ? { "addressDetails.pincode": payload.pincode } : {}),
    ...(payload.latitude !== undefined ? { "addressDetails.latitude": numberOrNull(payload.latitude) } : {}),
    ...(payload.longitude !== undefined ? { "addressDetails.longitude": numberOrNull(payload.longitude) } : {}),

    ...(payload.classesOffered !== undefined ? { "academicStructure.classesOffered": toArray(payload.classesOffered) } : {}),
    ...(payload.sectionsPerClass !== undefined ? { "academicStructure.sectionsPerClass": numberOrNull(payload.sectionsPerClass) } : {}),
    ...(payload.totalCapacity !== undefined ? { "academicStructure.totalCapacity": numberOrNull(payload.totalCapacity) } : {}),
    ...(payload.sessionStartMonth !== undefined ? { "academicStructure.sessionStartMonth": payload.sessionStartMonth } : {}),
    ...(payload.sessionEndMonth !== undefined ? { "academicStructure.sessionEndMonth": payload.sessionEndMonth } : {}),

    ...(payload.adminName !== undefined ? { "schoolAdmin.adminName": payload.adminName } : {}),
    ...(payload.adminEmail !== undefined ? { "schoolAdmin.adminEmail": payload.adminEmail } : {}),
    ...(payload.adminPhone !== undefined ? { "schoolAdmin.adminPhone": payload.adminPhone } : {}),

    ...(payload.planType !== undefined ? { "subscription.planType": payload.planType } : {}),
    ...(payload.planPrice !== undefined ? { "subscription.planPrice": numberOrNull(payload.planPrice) ?? 0 } : {}),
    ...(payload.billingCycle !== undefined ? { "subscription.billingCycle": payload.billingCycle } : {}),
    ...(payload.startDate !== undefined ? { "subscription.startDate": dateOrNull(payload.startDate) } : {}),
    ...(payload.endDate !== undefined ? { "subscription.endDate": dateOrNull(payload.endDate) } : {}),
    ...(payload.trialDays !== undefined ? { "subscription.trialDays": numberOrNull(payload.trialDays) ?? 0 } : {}),
    ...(payload.subscriptionIsActive !== undefined ? { "subscription.isActive": Boolean(payload.subscriptionIsActive) } : {}),

    ...(payload.attendanceModule !== undefined ? { "features.attendanceModule": Boolean(payload.attendanceModule) } : {}),
    ...(payload.feesModule !== undefined ? { "features.feesModule": Boolean(payload.feesModule) } : {}),
    ...(payload.examModule !== undefined ? { "features.examModule": Boolean(payload.examModule) } : {}),
    ...(payload.transportModule !== undefined ? { "features.transportModule": Boolean(payload.transportModule) } : {}),
    ...(payload.hostelModule !== undefined ? { "features.hostelModule": Boolean(payload.hostelModule) } : {}),
    ...(payload.libraryModule !== undefined ? { "features.libraryModule": Boolean(payload.libraryModule) } : {}),

    ...(payload.securityIsActive !== undefined ? { "security.isActive": Boolean(payload.securityIsActive), isActive: Boolean(payload.securityIsActive) } : {}),
    ...(payload.isBlocked !== undefined ? { "security.isBlocked": Boolean(payload.isBlocked) } : {}),
    ...(payload.loginAccess !== undefined ? { "security.loginAccess": Boolean(payload.loginAccess) } : {}),
    ...(payload.allowedIPs !== undefined ? { "security.allowedIPs": toArray(payload.allowedIPs) } : {}),
    ...(payload.twoFactorAuthEnabled !== undefined ? { "security.twoFactorAuthEnabled": Boolean(payload.twoFactorAuthEnabled) } : {}),
  };

  const updated = await schoolRepository.updateSchoolById(schoolId, update);
  return updated;
};

const deleteSchoolById = async (schoolId) => {
  const school = await schoolRepository.getSchoolById(schoolId);
  if (!school) throw new AppError("School not found", 404);

  await Promise.all([
    schoolRepository.deleteSchoolById(schoolId),
    schoolRepository.deleteUsersBySchoolId(schoolId),
    schoolRepository.deleteStudentsBySchoolId(schoolId),
    schoolRepository.deleteTeachersBySchoolId(schoolId),
    schoolRepository.deleteClassesBySchoolId(schoolId),
    schoolRepository.deleteNoticesBySchoolId(schoolId),
  ]);

  return { deleted: true };
};

const createStudent = async (schoolAdmin, payload) => {
  const schoolId = schoolAdmin.schoolId;
  const existing = await User.findOne({ email: payload.email });
  if (existing) throw new AppError("Email already in use", 409);

  const classInfo = await ClassModel.findOne({ _id: payload.classId, schoolId });
  if (!classInfo) throw new AppError("Class not found for this school", 404);

  const user = await schoolRepository.createUser({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: ROLES.STUDENT,
    schoolId,
  });

  const student = await schoolRepository.createStudent({
    schoolId,
    userId: user._id,
    classId: payload.classId,
    section: payload.section,
    rollNumber: payload.rollNumber,
  });

  return { user, student };
};

const createTeacher = async (schoolAdmin, payload) => {
  const schoolId = schoolAdmin.schoolId;
  const existing = await User.findOne({ email: payload.email });
  if (existing) throw new AppError("Email already in use", 409);

  const user = await schoolRepository.createUser({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: ROLES.TEACHER,
    schoolId,
  });

  const teacher = await schoolRepository.createTeacher({
    schoolId,
    userId: user._id,
    subject: payload.subject || "",
  });

  return { user, teacher };
};

const createClass = async (schoolAdmin, payload) => {
  const schoolId = schoolAdmin.schoolId;
  return schoolRepository.createClass({
    schoolId,
    name: payload.name,
    section: payload.section,
  });
};

const createNotice = async (schoolAdmin, payload) => {
  const schoolId = schoolAdmin.schoolId;
  return schoolRepository.createNotice({
    schoolId,
    title: payload.title,
    message: payload.message,
  });
};

const createSchoolAdminBySuperAdmin = async ({ name, email, password, phone, schoolId }) => {
  const school = await School.findById(schoolId);
  if (!school) throw new AppError("School not found", 404);

  const existing = await User.findOne({ email });
  if (existing) throw new AppError("Email already in use", 409);

  const user = await schoolRepository.createUser({
    name,
    email,
    password,
    phone: phone?.trim() || "",
    role: ROLES.SCHOOL_ADMIN,
    schoolId,
  });

  return user;
};

export const schoolService = {
  createSchool,
  getAllSchools,
  getSchoolById,
  updateSchoolById,
  deleteSchoolById,
  createStudent,
  createTeacher,
  createClass,
  createNotice,
  createSchoolAdminBySuperAdmin,
};
