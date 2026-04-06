import PDFDocument from "pdfkit";
import AppError from "../../common/errors/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import { adminRepository } from "./repository.js";
import School from "../../models/School.js";
import Student from "../../models/Student.js";
import ClassModel from "../../models/Class.js";
import Subject from "../../models/Subject.js";
import Timetable from "../../models/Timetable.js";
import * as feeDomain from "./feeDomain.js";
import * as feeCalc from "../../common/utils/feeCalculations.js";
import { schoolAdminNoticeService } from "../notices/schoolAdminNotice.service.js";

const ensureSchoolAdmin = (user) => {
  if (!user?.schoolId) throw new AppError("School context missing for current user", 400);
  if (user.role !== ROLES.SCHOOL_ADMIN) throw new AppError("Only SCHOOL_ADMIN can access this route", 403);
  return user.schoolId;
};

const parseCSV = (rawText) => {
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((item) => item.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((item) => item.trim());
    return headers.reduce((acc, header, idx) => ({ ...acc, [header]: values[idx] || "" }), {});
  });
};

const toDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeStudentDocuments = (input) => {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      if (typeof item === "string") {
        const u = item.trim();
        return u ? { name: "Document", url: u } : null;
      }
      if (item && typeof item === "object") {
        const url = String(item.url || item.documentUrl || "").trim();
        const name = String(item.name || item.documentName || "").trim();
        return url ? { name: name || "Document", url } : null;
      }
      return null;
    })
    .filter(Boolean);
};

const generateStudentCode = async (schoolId) => {
  const school = await School.findById(schoolId).select("code").lean();
  const prefix = String(school?.code || "STU")
    .replace(/\s+/g, "")
    .toUpperCase()
    .slice(0, 8);
  const pattern = new RegExp(`^${prefix}-\\d+$`);
  const latest = await Student.findOne({ schoolId, studentCode: pattern })
    .select("studentCode")
    .sort({ studentCode: -1 })
    .lean();
  const current = String(latest?.studentCode || "");
  const match = current.match(/-(\d+)$/);
  const nextNumber = match ? Number(match[1]) + 1 : 1;
  return `${prefix}-${String(nextNumber).padStart(5, "0")}`;
};

const studentExtendedFieldsForCreate = (payload) => {
  const parentName =
    payload.parentName || payload.fatherName || payload.guardianName || "";
  return {
    phone: payload.phone || payload.mobileNumber || "",
    alternatePhone: payload.alternateMobile || payload.alternatePhone || "",
    gender: payload.gender || "OTHER",
    dateOfBirth: toDate(payload.dateOfBirth),
    address: payload.address || "",
    city: payload.city || "",
    state: payload.state || "",
    pincode: payload.pincode || "",
    admissionDate: toDate(payload.admissionDate),
    admissionNumber: payload.admissionNumber || "",
    parentName,
    fatherName: payload.fatherName || "",
    motherName: payload.motherName || "",
    guardianName: payload.guardianName || "",
    parentPhone: payload.parentPhone || payload.parentMobile || "",
    parentEmail: payload.parentEmail || "",
    profileImage: payload.profileImage || "",
    documents: normalizeStudentDocuments(payload.documents),
    status: ["ACTIVE", "INACTIVE", "PASSED", "TRANSFERRED"].includes(payload.status) ? payload.status : "ACTIVE",
    transportRequired: Boolean(payload.transportRequired === true || payload.transportRequired === "true"),
    transportRouteId: payload.transportRouteId || payload.routeId || "",
    pickupPoint: payload.pickupPoint || "",
    hostelRequired: Boolean(payload.hostelRequired === true || payload.hostelRequired === "true"),
    hostelRoomNumber: payload.hostelRoomNumber || payload.roomNumber || "",
    bloodGroup: payload.bloodGroup || "",
    allergies: payload.allergies || "",
    medicalNotes: payload.medicalNotes || "",
    previousSchool: payload.previousSchool || "",
    religion: payload.religion || "",
    category: String(payload.category || "").trim(),
    nationality: payload.nationality || "",
  };
};

/** Only keys explicitly sent in JSON (partial update). */
const studentExtendedFieldsForPatch = (payload) => {
  const o = {};
  const has = (k) => Object.prototype.hasOwnProperty.call(payload, k);
  if (has("phone") || has("mobileNumber")) o.phone = payload.phone ?? payload.mobileNumber ?? "";
  if (has("alternateMobile") || has("alternatePhone")) o.alternatePhone = payload.alternateMobile ?? payload.alternatePhone ?? "";
  if (has("gender")) o.gender = payload.gender || "OTHER";
  if (has("dateOfBirth")) o.dateOfBirth = toDate(payload.dateOfBirth);
  if (has("address")) o.address = payload.address ?? "";
  if (has("city")) o.city = payload.city ?? "";
  if (has("state")) o.state = payload.state ?? "";
  if (has("pincode")) o.pincode = payload.pincode ?? "";
  if (has("admissionDate")) o.admissionDate = toDate(payload.admissionDate);
  if (has("admissionNumber")) o.admissionNumber = payload.admissionNumber ?? "";
  if (has("parentName")) o.parentName = payload.parentName ?? "";
  if (has("fatherName")) o.fatherName = payload.fatherName ?? "";
  if (has("motherName")) o.motherName = payload.motherName ?? "";
  if (has("guardianName")) o.guardianName = payload.guardianName ?? "";
  if (has("parentPhone") || has("parentMobile")) o.parentPhone = payload.parentPhone ?? payload.parentMobile ?? "";
  if (has("parentEmail")) o.parentEmail = payload.parentEmail ?? "";
  if (has("profileImage")) o.profileImage = payload.profileImage ?? "";
  if (has("documents")) o.documents = normalizeStudentDocuments(payload.documents);
  if (has("status") && ["ACTIVE", "INACTIVE", "PASSED", "TRANSFERRED"].includes(payload.status)) o.status = payload.status;
  if (has("transportRequired")) o.transportRequired = Boolean(payload.transportRequired === true || payload.transportRequired === "true");
  if (has("transportRouteId") || has("routeId")) o.transportRouteId = payload.transportRouteId ?? payload.routeId ?? "";
  if (has("pickupPoint")) o.pickupPoint = payload.pickupPoint ?? "";
  if (has("hostelRequired")) o.hostelRequired = Boolean(payload.hostelRequired === true || payload.hostelRequired === "true");
  if (has("hostelRoomNumber") || has("roomNumber")) o.hostelRoomNumber = payload.hostelRoomNumber ?? payload.roomNumber ?? "";
  if (has("bloodGroup")) o.bloodGroup = payload.bloodGroup ?? "";
  if (has("allergies")) o.allergies = payload.allergies ?? "";
  if (has("medicalNotes")) o.medicalNotes = payload.medicalNotes ?? "";
  if (has("previousSchool")) o.previousSchool = payload.previousSchool ?? "";
  if (has("religion")) o.religion = payload.religion ?? "";
  if (has("category")) o.category = String(payload.category ?? "").trim();
  if (has("nationality")) o.nationality = payload.nationality ?? "";
  return o;
};

const parseMaybeJson = (value, fallback) => {
  if (value == null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const ensureStringArray = (value) => {
  const source = Array.isArray(value) ? value : parseMaybeJson(value, value);
  if (Array.isArray(source)) {
    return source.map((item) => String(item || "").trim()).filter(Boolean);
  }
  if (typeof source === "string") {
    return source
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const ensureObjectIdArray = (value) => ensureStringArray(value);

const toStoredFileUrl = (file) => {
  if (!file?.filename) return "";
  return `/uploads/teachers/${file.filename}`;
};

const buildTeacherFullName = (payload) => {
  const firstName = String(payload.firstName || "").trim();
  const lastName = String(payload.lastName || "").trim();
  const fallbackName = String(payload.name || "").trim();
  const fullName = `${firstName} ${lastName}`.trim() || fallbackName;
  return {
    firstName,
    lastName,
    fullName,
  };
};

const normalizeTeacherStatus = (value, fallback = "ACTIVE") =>
  ["ACTIVE", "INACTIVE"].includes(String(value || "").toUpperCase()) ? String(value).toUpperCase() : fallback;

const normalizeTeacherPayload = async (schoolId, payload, files = {}, existingTeacher = null) => {
  const body = payload || {};
  const { firstName, lastName, fullName } = buildTeacherFullName(body);
  const subjectIds = ensureObjectIdArray(body.subjects || body.subjectIds);
  const assignedClasses = ensureObjectIdArray(body.assignedClasses || body.classIds);
  const sections = ensureStringArray(body.sections);
  const subjectNames = ensureStringArray(body.subjectNames || body.subjectLabels);
  const certificatesFromBody = ensureStringArray(body.certificates);

  if (!fullName) throw new AppError("First name or teacher name is required", 400);
  if (!body.email && !existingTeacher) throw new AppError("Email is required", 400);
  if (!body.password && !existingTeacher) throw new AppError("Password is required", 400);

  if (subjectIds.length) {
    const count = await Subject.countDocuments({ schoolId, _id: { $in: subjectIds } });
    if (count !== subjectIds.length) throw new AppError("One or more selected subjects are invalid", 400);
  }

  if (assignedClasses.length) {
    const count = await ClassModel.countDocuments({ schoolId, _id: { $in: assignedClasses } });
    if (count !== assignedClasses.length) throw new AppError("One or more assigned classes are invalid", 400);
  }

  let timetableId = body.timetableId || null;
  if (timetableId) {
    const exists = await Timetable.exists({ schoolId, _id: timetableId });
    if (!exists) throw new AppError("Selected timetable is invalid", 400);
  }

  const resumeFile = files.resume?.[0];
  const idProofFile = files.idProof?.[0];
  const profileImageFile = files.profileImage?.[0];
  const certificatesFiles = files.certificates || [];

  const existingDocs = existingTeacher?.documents || {};
  const documents = {
    resume: resumeFile ? toStoredFileUrl(resumeFile) : body.resume ?? existingDocs.resume ?? "",
    certificates: certificatesFiles.length
      ? certificatesFiles.map(toStoredFileUrl).filter(Boolean)
      : certificatesFromBody.length
        ? certificatesFromBody
        : existingDocs.certificates || [],
    idProof: idProofFile ? toStoredFileUrl(idProofFile) : body.idProof ?? existingDocs.idProof ?? "",
  };

  const subjectDocs = subjectIds.length
    ? await Subject.find({ schoolId, _id: { $in: subjectIds } }).select("name").lean()
    : [];
  const derivedSubjectNames = subjectDocs.map((item) => item.name).filter(Boolean);

  return {
    userPayload: {
      name: fullName,
      email: body.email ? String(body.email).trim().toLowerCase() : existingTeacher?.userId?.email,
      password: body.password || undefined,
      phone: body.phone ?? "",
      status: normalizeTeacherStatus(body.status, existingTeacher?.userId?.status || "ACTIVE"),
      isVerified:
        body.isVerified === undefined
          ? existingTeacher?.userId?.isVerified ?? true
          : body.isVerified === true || body.isVerified === "true",
    },
    teacherPayload: {
      firstName,
      lastName,
      phone: body.phone ?? "",
      gender: ["MALE", "FEMALE", "OTHER"].includes(String(body.gender || "").toUpperCase())
        ? String(body.gender).toUpperCase()
        : existingTeacher?.gender || "OTHER",
      dateOfBirth: body.dateOfBirth !== undefined ? toDate(body.dateOfBirth) : existingTeacher?.dateOfBirth ?? null,
      qualification: body.qualification ?? "",
      department: body.department ?? "",
      joiningDate: body.joiningDate !== undefined ? toDate(body.joiningDate) : existingTeacher?.joiningDate ?? null,
      experience: body.experience !== undefined ? Number(body.experience || 0) : existingTeacher?.experience ?? 0,
      salary: body.salary !== undefined ? Number(body.salary || 0) : existingTeacher?.salary ?? 0,
      employeeId: body.employeeId || existingTeacher?.employeeId || "",
      subjects: subjectIds,
      subjectNames: derivedSubjectNames.length ? derivedSubjectNames : subjectNames,
      assignedClasses,
      sections,
      timetableId: timetableId || null,
      addressLine: body.addressLine ?? "",
      city: body.city ?? "",
      state: body.state ?? "",
      country: body.country ?? "",
      pincode: body.pincode ?? "",
      profileImage: profileImageFile ? toStoredFileUrl(profileImageFile) : body.profileImage ?? existingTeacher?.profileImage ?? "",
      bankName: body.bankName ?? "",
      accountNumber: body.accountNumber ?? "",
      ifscCode: body.ifscCode ?? "",
      panCard: body.panCard ?? "",
      aadharNumber: body.aadharNumber ?? "",
      documents,
    },
  };
};

const teacherPatchPayload = (nextTeacherPayload, existingTeacher) => {
  const out = {};
  for (const key of Object.keys(nextTeacherPayload)) {
    if (nextTeacherPayload[key] !== undefined) out[key] = nextTeacherPayload[key];
  }
  if (!out.documents) out.documents = existingTeacher?.documents || {};
  return out;
};

const generateTeacherEmployeeId = async (schoolId) => {
  const school = await School.findById(schoolId).select("code").lean();
  const prefix = String(school?.code || "TCH")
    .replace(/\s+/g, "")
    .toUpperCase()
    .slice(0, 6);
  const count = await adminRepository.countTeachers({ schoolId });
  return `${prefix}-T-${String(count + 1).padStart(4, "0")}`;
};

const logActivity = async (user, action, entityType, entityId, meta = {}) => {
  await adminRepository.createActivity({
    schoolId: user.schoolId,
    actorUserId: user.userId,
    action,
    entityType,
    entityId: String(entityId),
    meta,
  });
};

const getDashboard = async (user) => {
  const schoolId = ensureSchoolAdmin(user);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [studentsCount, teachersCount, classes, attendanceCount, feesCollectedRows, recentActivities, feeDash] =
    await Promise.all([
      adminRepository.countStudents({ schoolId }),
      adminRepository.countTeachers({ schoolId }),
      adminRepository.findClasses({ schoolId }),
      adminRepository.countAttendance({ schoolId, from: monthStart }),
      adminRepository.countCollectedFees({ schoolId, from: monthStart }),
      adminRepository.getRecentActivities({ schoolId, limit: 12 }),
      adminRepository.aggregateFeeDashboard({ schoolId }),
    ]);

  return {
    totalStudents: studentsCount,
    totalTeachers: teachersCount,
    totalClasses: classes.length,
    attendanceSummary: {
      markedRecordsThisMonth: attendanceCount,
    },
    feeCollectionSummary: {
      collectedThisMonth: feesCollectedRows[0]?.total || 0,
      ...feeDash,
    },
    recentActivities,
  };
};

const createStudent = async (user, payload) => {
  const schoolId = ensureSchoolAdmin(user);
  const existingUser = await adminRepository.findUserByEmail(payload.email?.trim().toLowerCase());
  if (existingUser) throw new AppError("Email already in use", 409);

  const classInfo = await adminRepository.findClassById({ schoolId, classId: payload.classId });
  if (!classInfo) throw new AppError("Class not found in your school", 404);

  const displayName = String(payload.name || payload.fullName || "").trim();
  if (!displayName) throw new AppError("Student name is required", 400);
  const studentCode = await generateStudentCode(schoolId);
  const ext = studentExtendedFieldsForCreate(payload);

  const studentUser = await adminRepository.createUser({
    name: displayName,
    email: payload.email,
    password: payload.password,
    phone: payload.phone || payload.mobileNumber || "",
    role: ROLES.STUDENT,
    schoolId,
  });

  let student;
  let nextStudentCode = studentCode;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      student = await adminRepository.createStudent({
        schoolId,
        userId: studentUser._id,
        classId: payload.classId,
        section: payload.section,
        rollNumber: payload.rollNumber,
        studentCode: nextStudentCode,
        ...ext,
      });
      break;
    } catch (error) {
      if (error?.code !== 11000 || attempt === 2) {
        await adminRepository.deleteUserById(studentUser._id);
        throw error;
      }
      nextStudentCode = await generateStudentCode(schoolId);
    }
  }

  await logActivity(user, "CREATE", "STUDENT", student._id, { name: displayName, email: payload.email });
  const fullStudent = await adminRepository.findStudentById({ schoolId, studentId: student._id });
  await autoAssignFeeStructuresForStudent(schoolId, fullStudent);

  if (payload.feeStructureId) {
    try {
      await assignFees(user, {
        studentId: student._id,
        feeStructureId: payload.feeStructureId,
        manualDiscount: Number(payload.feeAssignManualDiscount || 0),
        dueDate: payload.feeAssignDueDate || undefined,
      });
    } catch (e) {
      if (e.statusCode !== 409) throw e;
    }
  }

  return adminRepository.findStudentById({ schoolId, studentId: student._id });
};

const autoAssignFeeStructuresForStudent = async (schoolId, student) => {
  if (!student?.classId) return;
  const classId = student.classId?._id || student.classId;
  const structures = await adminRepository.findActiveStructuresForClass({ schoolId, classId });
  for (const st of structures) {
    if (!feeDomain.structureMatchesStudent(st, student)) continue;
    const exists = await adminRepository.findFeeAssignmentByStudentStructure({
      schoolId,
      studentId: student._id,
      feeStructureId: st._id,
    });
    if (exists) continue;
    const doc = feeDomain.buildStudentFeeDocument(st, student, 0);
    await adminRepository.createFeeAssignment(doc);
  }
};

const listStudents = async (user, { page = 1, limit = 10, search = "" }) => {
  const schoolId = ensureSchoolAdmin(user);
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const skip = (safePage - 1) * safeLimit;
  const rows = await adminRepository.findStudents({ schoolId, query: search, skip, limit: safeLimit });
  const filtered = rows.filter((row) => row.userId);
  const total = await adminRepository.countStudents({ schoolId });
  return {
    items: filtered,
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.ceil(total / safeLimit),
  };
};

const getStudentById = async (user, studentId) => {
  const schoolId = ensureSchoolAdmin(user);
  const student = await adminRepository.findStudentById({ schoolId, studentId });
  if (!student) throw new AppError("Student not found", 404);
  return student;
};

const updateStudent = async (user, studentId, payload) => {
  const schoolId = ensureSchoolAdmin(user);
  const student = await adminRepository.findStudentById({ schoolId, studentId });
  if (!student) throw new AppError("Student not found", 404);

  if (payload.email && payload.email !== student.userId.email) {
    const existing = await adminRepository.findUserByEmail(payload.email);
    if (existing && String(existing._id) !== String(student.userId._id)) {
      throw new AppError("Email already in use", 409);
    }
  }

  const nextName = payload.name !== undefined || payload.fullName !== undefined ? String(payload.name || payload.fullName || "").trim() : null;
  await adminRepository.updateUserById(student.userId._id, {
    ...(nextName ? { name: nextName } : {}),
    ...(payload.email ? { email: payload.email } : {}),
    ...(payload.phone !== undefined || payload.mobileNumber !== undefined
      ? { phone: payload.phone ?? payload.mobileNumber ?? "" }
      : {}),
  });

  const extUpdate = studentExtendedFieldsForPatch(payload);

  const updated = await adminRepository.updateStudent({
    schoolId,
    studentId,
    payload: {
      ...(payload.classId ? { classId: payload.classId } : {}),
      ...(payload.section !== undefined ? { section: payload.section } : {}),
      ...(payload.rollNumber !== undefined ? { rollNumber: payload.rollNumber } : {}),
      ...extUpdate,
    },
  });
  await logActivity(user, "UPDATE", "STUDENT", studentId);
  return updated;
};

const deleteStudent = async (user, studentId) => {
  const schoolId = ensureSchoolAdmin(user);
  const student = await adminRepository.deleteStudent({ schoolId, studentId });
  if (!student) throw new AppError("Student not found", 404);
  await adminRepository.deleteUserById(student.userId);
  await logActivity(user, "DELETE", "STUDENT", studentId);
  return { deleted: true };
};

const bulkImportStudents = async (user, csvText) => {
  const schoolId = ensureSchoolAdmin(user);
  const rows = parseCSV(csvText);
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    try {
      await createStudent(user, {
        name: row.name,
        email: row.email,
        password: row.password || "password123",
        phone: row.phone,
        gender: row.gender,
        dateOfBirth: row.dateOfBirth,
        address: row.address,
        admissionDate: row.admissionDate,
        classId: row.classId,
        section: row.section,
        rollNumber: row.rollNumber,
        parentName: row.parentName,
        parentPhone: row.parentPhone,
        parentEmail: row.parentEmail,
        profileImage: row.profileImage,
        documents: row.documents ? row.documents.split("|").map((item) => item.trim()) : [],
      });
      created += 1;
    } catch (error) {
      skipped += 1;
    }
  }

  await logActivity(user, "IMPORT", "STUDENT", schoolId, { created, skipped });
  return { created, skipped };
};

const generateStudentIdCardPDF = async (user, studentId) => {
  const student = await getStudentById(user, studentId);

  const doc = new PDFDocument({
    size: [350, 200],
    margin: 0,
  });

  const chunks = [];

  return new Promise((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // 🎨 Background Card
    doc.roundedRect(5, 5, 340, 190, 10).fill("#ffffff");

    // 🔵 Left Blue Strip
    doc.rect(5, 5, 80, 190).fill("#2563eb");

    // 🏫 School Name
    doc.fillColor("#fff")
      .fontSize(12)
      .text("MY SCHOOL", 10, 20, { width: 70, align: "center" });

    // 🖼 Profile Image
    if (student.profileImage) {
      try {
        doc.image(student.profileImage, 20, 60, {
          width: 50,
          height: 50,
        });
      } catch {
        doc.rect(20, 60, 50, 50).stroke();
      }
    } else {
      doc.rect(20, 60, 50, 50).stroke();
    }

    // 📌 Student Info
    const x = 100;
    const y = 30;

    doc.fillColor("#000");

    doc.fontSize(11).text(`Name: ${student.userId?.name || "-"}`, x, y);
    doc.text(`Class: ${student.classId?.name}-${student.section}`, x, y + 20);
    doc.text(`Roll: ${student.rollNumber || "-"}`, x, y + 40);
    doc.text(`Parent: ${student.fatherName || student.parentName || student.guardianName || "-"}`, x, y + 60);
    doc.text(`Phone: ${student.phone || "-"}`, x, y + 80);

    // ➖ Divider
    doc.moveTo(x, y + 110).lineTo(320, y + 110).stroke();

    // 🔽 Footer
    doc.fontSize(9)
      .fillColor("#555")
      .text(`ID: ${student._id}`, x, y + 120);

    doc.text("Signature", 250, y + 120);
    doc.moveTo(250, y + 135).lineTo(320, y + 135).stroke();

    doc.end();
  });
};
const createTeacher = async (user, payload, files = {}) => {
  const schoolId = ensureSchoolAdmin(user);
  const existingUser = await adminRepository.findUserByEmail(payload.email?.trim().toLowerCase());
  if (existingUser) throw new AppError("Email already in use", 409);

  const normalized = await normalizeTeacherPayload(schoolId, payload, files);
  const employeeId = normalized.teacherPayload.employeeId || (await generateTeacherEmployeeId(schoolId));

  const teacherUser = await adminRepository.createUser({
    name: normalized.userPayload.name,
    email: normalized.userPayload.email,
    password: normalized.userPayload.password,
    phone: normalized.userPayload.phone,
    status: normalized.userPayload.status,
    isVerified: normalized.userPayload.isVerified,
    role: ROLES.TEACHER,
    schoolId,
  });

  const teacher = await adminRepository.createTeacher({
    schoolId,
    userId: teacherUser._id,
    employeeId,
    ...normalized.teacherPayload,
  });
  await logActivity(user, "CREATE", "TEACHER", teacher._id, {
    name: normalized.userPayload.name,
    email: normalized.userPayload.email,
    employeeId,
  });
  return adminRepository.findTeacherById({ schoolId, teacherId: teacher._id });
};

const listTeachers = async (user, { page = 1, limit = 10, search = "" }) => {
  const schoolId = ensureSchoolAdmin(user);
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const skip = (safePage - 1) * safeLimit;
  const rows = await adminRepository.findTeachers({ schoolId, query: search, skip, limit: safeLimit });
  const filtered = rows.filter((row) => row.userId);
  const total = await adminRepository.countTeachers({ schoolId });
  return {
    items: filtered,
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: Math.ceil(total / safeLimit),
  };
};

const getTeacherById = async (user, teacherId) => {
  const schoolId = ensureSchoolAdmin(user);
  const teacher = await adminRepository.findTeacherById({ schoolId, teacherId });
  if (!teacher) throw new AppError("Teacher not found", 404);
  return teacher;
};

const updateTeacher = async (user, teacherId, payload, files = {}) => {
  const schoolId = ensureSchoolAdmin(user);
  const teacher = await getTeacherById(user, teacherId);

  if (payload.email && payload.email !== teacher.userId.email) {
    const existing = await adminRepository.findUserByEmail(payload.email);
    if (existing && String(existing._id) !== String(teacher.userId._id)) {
      throw new AppError("Email already in use", 409);
    }
  }

  const normalized = await normalizeTeacherPayload(schoolId, payload, files, teacher);

  await adminRepository.updateUserById(teacher.userId._id, {
    ...(normalized.userPayload.name ? { name: normalized.userPayload.name } : {}),
    ...(normalized.userPayload.email ? { email: normalized.userPayload.email } : {}),
    ...(normalized.userPayload.phone !== undefined ? { phone: normalized.userPayload.phone } : {}),
    ...(normalized.userPayload.status ? { status: normalized.userPayload.status } : {}),
    ...(normalized.userPayload.isVerified !== undefined ? { isVerified: normalized.userPayload.isVerified } : {}),
  });
  if (payload.password) {
    const userDoc = await adminRepository.findUserById(teacher.userId._id);
    userDoc.password = payload.password;
    await userDoc.save();
  }

  const updated = await adminRepository.updateTeacher({
    schoolId,
    teacherId,
    payload: teacherPatchPayload(normalized.teacherPayload, teacher),
  });
  await logActivity(user, "UPDATE", "TEACHER", teacherId);
  return updated;
};

const deleteTeacher = async (user, teacherId) => {
  const schoolId = ensureSchoolAdmin(user);
  const teacher = await adminRepository.deleteTeacher({ schoolId, teacherId });
  if (!teacher) throw new AppError("Teacher not found", 404);
  await adminRepository.deleteUserById(teacher.userId);
  await logActivity(user, "DELETE", "TEACHER", teacherId);
  return { deleted: true };
};

const createClass = async (user, payload) => {
  const schoolId = ensureSchoolAdmin(user);
  if (payload.classTeacherId) {
    const teacher = await adminRepository.findTeacherById({ schoolId, teacherId: payload.classTeacherId });
    if (!teacher) throw new AppError("Assigned class teacher not found in your school", 404);
  }
  const created = await adminRepository.createClass({
    schoolId,
    name: payload.name,
    section: payload.section,
    classTeacherId: payload.classTeacherId || null,
  });
  await logActivity(user, "CREATE", "CLASS", created._id, { name: payload.name, section: payload.section });
  return adminRepository.findClassById({ schoolId, classId: created._id });
};

const listClasses = async (user) => {
  const schoolId = ensureSchoolAdmin(user);
  return adminRepository.findClasses({ schoolId });
};

const updateClass = async (user, classId, payload) => {
  const schoolId = ensureSchoolAdmin(user);
  if (payload.classTeacherId) {
    const teacher = await adminRepository.findTeacherById({ schoolId, teacherId: payload.classTeacherId });
    if (!teacher) throw new AppError("Assigned class teacher not found in your school", 404);
  }
  const updated = await adminRepository.updateClass({ schoolId, classId, payload });
  if (!updated) throw new AppError("Class not found", 404);
  await logActivity(user, "UPDATE", "CLASS", classId);
  return updated;
};

const deleteClass = async (user, classId) => {
  const schoolId = ensureSchoolAdmin(user);
  const deleted = await adminRepository.deleteClass({ schoolId, classId });
  if (!deleted) throw new AppError("Class not found", 404);
  await logActivity(user, "DELETE", "CLASS", classId);
  return { deleted: true };
};

const createSubject = async (user, payload) => {
  const schoolId = ensureSchoolAdmin(user);
  const classInfo = await adminRepository.findClassById({ schoolId, classId: payload.classId });
  if (!classInfo) throw new AppError("Class not found", 404);
  if (payload.teacherId) {
    const teacher = await adminRepository.findTeacherById({ schoolId, teacherId: payload.teacherId });
    if (!teacher) throw new AppError("Teacher not found", 404);
  }
  const subject = await adminRepository.createSubject({
    schoolId,
    classId: payload.classId,
    name: payload.name,
    teacherId: payload.teacherId || null,
  });
  await logActivity(user, "CREATE", "SUBJECT", subject._id);
  return subject;
};

const listSubjects = async (user) => {
  const schoolId = ensureSchoolAdmin(user);
  return adminRepository.findSubjects({ schoolId });
};

const updateSubject = async (user, subjectId, payload) => {
  const schoolId = ensureSchoolAdmin(user);
  const updated = await adminRepository.updateSubject({ schoolId, subjectId, payload });
  if (!updated) throw new AppError("Subject not found", 404);
  await logActivity(user, "UPDATE", "SUBJECT", subjectId);
  return updated;
};

const deleteSubject = async (user, subjectId) => {
  const schoolId = ensureSchoolAdmin(user);
  const deleted = await adminRepository.deleteSubject({ schoolId, subjectId });
  if (!deleted) throw new AppError("Subject not found", 404);
  await logActivity(user, "DELETE", "SUBJECT", subjectId);
  return { deleted: true };
};

const markStudentAttendance = async (user, payload) => {
  const schoolId = ensureSchoolAdmin(user);
  const student = await adminRepository.findStudentById({ schoolId, studentId: payload.studentId });
  if (!student) throw new AppError("Student not found", 404);
  const data = await adminRepository.upsertStudentAttendance({
    schoolId,
    studentId: payload.studentId,
    date: new Date(payload.date),
    status: payload.status,
  });
  await logActivity(user, "MARK", "STUDENT_ATTENDANCE", data._id);
  return data;
};

const studentAttendanceReport = async (user, { studentId, from, to }) => {
  const schoolId = ensureSchoolAdmin(user);
  return adminRepository.studentAttendanceReport({
    schoolId,
    studentId,
    from: toDate(from) || new Date("2000-01-01"),
    to: toDate(to) || new Date("2999-12-31"),
  });
};

const markTeacherAttendance = async (user, payload) => {
  const schoolId = ensureSchoolAdmin(user);
  const teacher = await adminRepository.findTeacherById({ schoolId, teacherId: payload.teacherId });
  if (!teacher) throw new AppError("Teacher not found", 404);
  const data = await adminRepository.upsertTeacherAttendance({
    schoolId,
    teacherId: payload.teacherId,
    date: new Date(payload.date),
    status: payload.status,
  });
  await logActivity(user, "MARK", "TEACHER_ATTENDANCE", data._id);
  return data;
};

const teacherAttendanceReport = async (user, { teacherId, from, to }) => {
  const schoolId = ensureSchoolAdmin(user);
  return adminRepository.teacherAttendanceReport({
    schoolId,
    teacherId,
    from: toDate(from) || new Date("2000-01-01"),
    to: toDate(to) || new Date("2999-12-31"),
  });
};

const monthlyAttendanceSummary = async (user, { month, year }) => {
  const schoolId = ensureSchoolAdmin(user);
  const y = Number(year);
  const m = Number(month);
  const from = new Date(y, m - 1, 1);
  const to = new Date(y, m, 0, 23, 59, 59, 999);
  const [students, teachers] = await Promise.all([
    adminRepository.studentAttendanceReport({ schoolId, studentId: { $exists: true }, from, to }),
    adminRepository.teacherAttendanceReport({ schoolId, teacherId: { $exists: true }, from, to }),
  ]);
  return { month: m, year: y, studentAttendanceRecords: students.length, teacherAttendanceRecords: teachers.length };
};

const createFeeStructure = async (user, payload) => {
  const schoolId = ensureSchoolAdmin(user);
  const classId = payload.classId;
  if (!classId) throw new AppError("classId is required", 400);
  const cls = await adminRepository.findClassById({ schoolId, classId });
  if (!cls) throw new AppError("Class not found", 404);

  const academicYear = String(payload.academicYear || "").trim();
  if (!academicYear) throw new AppError("academicYear is required", 400);

  const section = String(payload.section || "").trim();
  const dup = await adminRepository.countActiveDuplicateStructure({
    schoolId,
    classId,
    academicYear,
    section,
    excludeId: null,
  });
  if (dup > 0) throw new AppError("An active fee structure already exists for this class, year, and section", 409);

  const { feesBreakdown, totalAmount } = feeDomain.computeStructureTotalsFromBody(payload);
  const dueDate = toDate(payload.dueDate) || toDate(payload.applicableTo) || null;

  const fee = await adminRepository.createFeeStructure({
    schoolId,
    title: String(payload.title || "").trim(),
    academicYear,
    classId,
    section,
    feesBreakdown,
    discountType: payload.discountType || "NONE",
    discountValue: Number(payload.discountValue ?? 0),
    totalAmount,
    frequency: payload.frequency || "YEARLY",
    installmentEnabled: Boolean(payload.installmentEnabled ?? payload.installments),
    numberOfInstallments: Math.min(Math.max(Number(payload.numberOfInstallments || 1), 1), 24),
    dueDate,
    fineType: payload.fineType || "NONE",
    fineAmount: Number(payload.fineAmount ?? 0),
    gracePeriodDays: Number(payload.gracePeriodDays ?? 0),
    applicableFrom: toDate(payload.applicableFrom),
    applicableTo: toDate(payload.applicableTo),
    status: payload.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    amount: totalAmount,
    category: payload.category || "",
  });
  await logActivity(user, "CREATE", "FEE_STRUCTURE", fee._id);
  return adminRepository.findFeeStructureById({ schoolId, structureId: fee._id });
};

const getFeeStructures = async (user) => {
  const schoolId = ensureSchoolAdmin(user);
  return adminRepository.getFeeStructures({ schoolId });
};

const assignFees = async (user, payload) => {
  const schoolId = ensureSchoolAdmin(user);
  const student = await adminRepository.findStudentById({ schoolId, studentId: payload.studentId });
  if (!student) throw new AppError("Student not found", 404);
  const structure = await adminRepository.findFeeStructureById({ schoolId, structureId: payload.feeStructureId });
  if (!structure) throw new AppError("Fee structure not found", 404);
  if (structure.status !== "ACTIVE") throw new AppError("Fee structure is not active", 400);
  if (!feeDomain.structureMatchesStudent(structure, student)) throw new AppError("Structure does not apply to this student's class/section", 400);

  const exists = await adminRepository.findFeeAssignmentByStudentStructure({
    schoolId,
    studentId: student._id,
    feeStructureId: structure._id,
  });
  if (exists) throw new AppError("This fee is already assigned to the student", 409);

  const manualDiscount = Number(payload.manualDiscount || 0);
  const doc = feeDomain.buildStudentFeeDocument(structure, student, manualDiscount);
  if (payload.dueDate) doc.dueDate = toDate(payload.dueDate);
  const assigned = await adminRepository.createFeeAssignment(doc);
  await logActivity(user, "ASSIGN", "FEE", assigned._id);
  return adminRepository.findFeeAssignmentById({ schoolId, assignmentId: assigned._id });
};

const assignFeesBulk = async (user, payload) => {
  const schoolId = ensureSchoolAdmin(user);
  const structure = await adminRepository.findFeeStructureById({ schoolId, structureId: payload.feeStructureId });
  if (!structure) throw new AppError("Fee structure not found", 404);
  if (structure.status !== "ACTIVE") throw new AppError("Fee structure is not active", 400);

  const mode = String(payload.mode || "class");
  let students = [];
  if (mode === "students" && Array.isArray(payload.studentIds)) {
    for (const sid of payload.studentIds) {
      const stu = await adminRepository.findStudentById({ schoolId, studentId: sid });
      if (stu) students.push(stu);
    }
  } else {
    const classId = payload.classId || structure.classId?._id || structure.classId;
    const page = await listStudents(user, { page: 1, limit: 2000, search: "" });
    students = page.items.filter((s) => String(s.classId?._id || s.classId) === String(classId));
    if (mode === "section" && payload.section) {
      students = students.filter((s) => (s.section || "").trim() === String(payload.section).trim());
    }
  }

  let created = 0;
  let skipped = 0;
  for (const stu of students) {
    if (!feeDomain.structureMatchesStudent(structure, stu)) {
      skipped += 1;
      continue;
    }
    const exists = await adminRepository.findFeeAssignmentByStudentStructure({
      schoolId,
      studentId: stu._id,
      feeStructureId: structure._id,
    });
    if (exists) {
      skipped += 1;
      continue;
    }
    const doc = feeDomain.buildStudentFeeDocument(structure, stu, Number(payload.manualDiscount || 0));
    await adminRepository.createFeeAssignment(doc);
    created += 1;
  }
  await logActivity(user, "ASSIGN_BULK", "FEE", structure._id, { created, skipped });
  return { created, skipped };
};

const listStudentFeesAdmin = async (user, query) => {
  const schoolId = ensureSchoolAdmin(user);
  const filter = {};
  if (query.status && feeCalc.STUDENT_FEE_STATUS.includes(query.status)) filter.status = query.status;
  if (query.classId) filter.classId = query.classId;
  if (query.studentId) filter.studentId = query.studentId;
  if (query.fromDue || query.toDue) {
    filter.dueDate = {};
    if (query.fromDue) filter.dueDate.$gte = new Date(query.fromDue);
    if (query.toDue) filter.dueDate.$lte = new Date(query.toDue);
  }

  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
  const skip = (page - 1) * limit;

  let rows = await adminRepository.listFeeAssignments({ schoolId, filter, skip: 0, limit: 5000 });
  if (query.section) {
    rows = rows.filter((r) => (r.studentId?.section || "").trim() === String(query.section).trim());
  }
  if (query.search?.trim()) {
    const q = query.search.trim().toLowerCase();
    rows = rows.filter((r) => (r.studentId?.userId?.name || "").toLowerCase().includes(q));
  }
  const total = rows.length;
  const paged = rows.slice(skip, skip + limit);
  const enriched = [];
  for (const row of paged) {
    const structure = row.feeStructureId;
    const plain = typeof row.toObject === "function" ? row.toObject() : row;
    const { fineAmount, status } = feeDomain.mergeFineAndStatus(plain, structure);
    enriched.push({
      ...plain,
      computedFineAmount: fineAmount,
      computedStatus: status,
    });
  }
  return { items: enriched, page, limit, total, totalPages: Math.ceil(total / limit) };
};

const getStudentFeeOne = async (user, assignmentId) => {
  const schoolId = ensureSchoolAdmin(user);
  const row = await adminRepository.findFeeAssignmentById({ schoolId, assignmentId });
  if (!row) throw new AppError("Student fee record not found", 404);
  const structure = row.feeStructureId;
  const { fineAmount, status } = feeDomain.mergeFineAndStatus(row, structure);
  return { ...row.toObject(), computedFineAmount: fineAmount, computedStatus: status };
};

const patchStudentFee = async (user, assignmentId, payload) => {
  const schoolId = ensureSchoolAdmin(user);
  const row = await adminRepository.findFeeAssignmentById({ schoolId, assignmentId });
  if (!row) throw new AppError("Student fee record not found", 404);
  const structure = row.feeStructureId;
  const extraDisc = Number(payload.applyManualDiscount || 0);
  const structureNet = Number(structure?.totalAmount || structure?.amount || 0);
  const newManual = Number(row.manualDiscountAmount || 0) + extraDisc;
  const finalAmount = Math.max(structureNet - newManual, 0);
  const baseRow = typeof row.toObject === "function" ? row.toObject() : row;
  let fineAmount = feeDomain.mergeFineAndStatus({ ...baseRow, finalAmount }, structure).fineAmount;
  if (payload.setFineAmount != null && payload.setFineAmount !== "") {
    fineAmount = Math.max(Number(payload.setFineAmount), 0);
  }
  if (payload.addFine != null && Number(payload.addFine) > 0) {
    fineAmount = Number(fineAmount || 0) + Number(payload.addFine);
  }

  const dueTotal = finalAmount + Number(fineAmount || 0);
  const paid = Number(row.paidAmount || 0);
  const remaining = Math.max(dueTotal - paid, 0);
  let status = feeCalc.deriveStudentFeeStatus({ finalAmount, fineAmount, paidAmount: paid });
  if (paid >= dueTotal - 0.01) status = "PAID";
  if (status !== "PAID" && new Date() > new Date(row.dueDate || 0) && remaining > 0.01) status = "OVERDUE";

  const updated = await adminRepository.updateFeeAssignmentById({
    schoolId,
    assignmentId,
    payload: {
      manualDiscountAmount: newManual,
      finalAmount,
      fineAmount,
      remainingAmount: remaining,
      status,
      amount: finalAmount,
    },
  });
  await logActivity(user, "UPDATE", "FEE_ASSIGNMENT", assignmentId);
  return updated;
};

const sendFeeReminder = async (user, assignmentId) => {
  const schoolId = ensureSchoolAdmin(user);
  const row = await adminRepository.findFeeAssignmentById({ schoolId, assignmentId });
  if (!row) throw new AppError("Student fee record not found", 404);
  const uid = row.studentId?.userId?._id || row.studentId?.userId;
  if (!uid) throw new AppError("Student user not linked", 400);
  const structure = row.feeStructureId;
  const { fineAmount } = feeDomain.mergeFineAndStatus(row, structure);
  const remaining =
    Number(row.finalAmount || 0) + Number(fineAmount || 0) - Number(row.paidAmount || 0);
  await adminRepository.createNotification({
    schoolId,
    userId: uid,
    title: "Fee due reminder",
    message: `Reminder: ${structure?.title || "Fee"} — ₹${Math.max(remaining, 0).toFixed(2)} pending. Due: ${row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "—"}.`,
    type: "FEE_REMINDER",
  });
  await logActivity(user, "REMIND", "FEE_ASSIGNMENT", assignmentId);
  return { sent: true };
};

const collectFeePayment = async (user, payload) => {
  const schoolId = ensureSchoolAdmin(user);
  const studentFeeId = payload.studentFeeId;
  if (!studentFeeId) throw new AppError("studentFeeId is required", 400);

  const assignment = await adminRepository.findFeeAssignmentById({ schoolId, assignmentId: studentFeeId });
  if (!assignment) throw new AppError("Student fee record not found", 404);
  const student = await adminRepository.findStudentById({ schoolId, studentId: assignment.studentId?._id || assignment.studentId });
  if (!student) throw new AppError("Student not found", 404);

  const structure = assignment.feeStructureId;
  if (!structure) throw new AppError("Linked fee structure missing", 400);

  const payAmount = Number(payload.amount ?? payload.payAmount);
  const receiptNumber = await feeDomain.generateReceiptNumber(schoolId);
  const paymentPayload = {
    schoolId,
    studentId: student._id,
    studentFeeId: assignment._id,
    amount: payAmount,
    paymentDate: toDate(payload.paymentDate) || new Date(),
    paymentMode: payload.paymentMode || payload.paymentMethod || "CASH",
    paymentMethod: String(payload.paymentMode || payload.paymentMethod || "cash").toLowerCase(),
    transactionId: String(payload.transactionId || "").trim(),
    collectedByUserId: user.userId,
    receiptNumber,
    note: payload.note || "",
  };

  const payment = await feeDomain.applyPaymentToAssignment({
    assignment,
    structure,
    payAmount,
    adminRepo: adminRepository,
    paymentPayload,
  });

  const uid = student.userId?._id || student.userId;
  if (uid) {
    await adminRepository.createNotification({
      schoolId,
      userId: uid,
      title: "Payment received",
      message: `₹${payAmount.toFixed(2)} recorded for ${structure.title || "fees"}. Receipt: ${receiptNumber}.`,
      type: "FEE_PAYMENT",
    });
  }

  await logActivity(user, "COLLECT", "FEE_PAYMENT", payment._id);
  return payment;
};

const generateFeeReceiptPDF = async (user, paymentId) => {
  ensureSchoolAdmin(user);
  const schoolId = user.schoolId;
  const payment = await adminRepository.getFeePaymentById({ schoolId, paymentId });
  if (!payment) throw new AppError("Payment not found", 404);
  const school = await School.findById(schoolId).lean();
  const assign = payment.studentFeeId;
  const structure = assign?.feeStructureId;
  const breakdown = structure?.feesBreakdown || assign?.feesBreakdownSnapshot;

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks = [];
  return new Promise((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.fontSize(18).text(school?.name || "School", { align: "center" });
    doc.fontSize(14).text("Fee Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(11);
    doc.text(`Receipt No: ${payment.receiptNumber || payment._id}`);
    doc.text(`Date: ${new Date(payment.paymentDate).toLocaleString()}`);
    doc.text(`Student: ${payment.studentId?.userId?.name || "-"}`);
    doc.text(`Class: ${payment.studentId?.classId?.name || "-"} — Section: ${payment.studentId?.section || "-"}`);
    doc.moveDown();
    doc.text("Fee breakdown (structure):");
    if (breakdown) {
      doc.text(`  Tuition: ₹${breakdown.tuitionFee ?? 0}`);
      doc.text(`  Transport: ₹${breakdown.transportFee ?? 0}`);
      doc.text(`  Hostel: ₹${breakdown.hostelFee ?? 0}`);
      doc.text(`  Exam: ₹${breakdown.examFee ?? 0}`);
      doc.text(`  Library: ₹${breakdown.libraryFee ?? 0}`);
      doc.text(`  Sports: ₹${breakdown.sportsFee ?? 0}`);
    } else {
      doc.text("  (see fee structure in portal)");
    }
    doc.moveDown();
    doc.text(`Amount paid: ₹${payment.amount}`);
    doc.text(`Mode: ${payment.paymentMode || payment.paymentMethod}`);
    if (payment.transactionId) doc.text(`Txn ID: ${payment.transactionId}`);
    doc.end();
  });
};

const getPendingDues = async (user) => {
  const schoolId = ensureSchoolAdmin(user);
  const studentsPage = await listStudents(user, { page: 1, limit: 1000, search: "" });
  const result = [];
  for (const student of studentsPage.items) {
    const assignments = await adminRepository.getFeeAssignmentsByStudent({ schoolId, studentId: student._id });
    let pending = 0;
    for (const item of assignments) {
      const structure = item.feeStructureId;
      const { fineAmount } = feeDomain.mergeFineAndStatus(item, structure);
      const due = Number(item.finalAmount || item.amount || 0) + Number(fineAmount || 0);
      const paid = Number(item.paidAmount || 0);
      pending += Math.max(due - paid, 0);
    }
    result.push({
      studentId: student._id,
      studentName: student.userId?.name || "",
      totalAssigned: assignments.reduce((s, i) => s + Number(i.finalAmount || i.amount || 0), 0),
      totalPaid: assignments.reduce((s, i) => s + Number(i.paidAmount || 0), 0),
      pending,
    });
  }
  return result.filter((item) => item.pending > 0);
};

const exportStudentFeesCsv = async (user, query) => {
  const { items } = await listStudentFeesAdmin(user, { ...query, page: 1, limit: 5000 });
  const headers = [
    "Student",
    "Class",
    "Section",
    "Structure",
    "Final",
    "Paid",
    "Remaining",
    "Fine",
    "Status",
    "Due",
  ];
  const lines = [headers.join(",")];
  for (const r of items) {
    const st = r.studentId;
    const fs = r.feeStructureId;
    const rem = Math.max(
      Number(r.finalAmount || 0) + Number(r.computedFineAmount ?? r.fineAmount ?? 0) - Number(r.paidAmount || 0),
      0
    );
    lines.push(
      [
        `"${(st?.userId?.name || "").replace(/"/g, '""')}"`,
        r.classId?.name || "",
        st?.section || "",
        `"${(fs?.title || "").replace(/"/g, '""')}"`,
        r.finalAmount ?? r.amount,
        r.paidAmount,
        rem,
        r.computedFineAmount ?? r.fineAmount,
        r.computedStatus || r.status,
        r.dueDate ? new Date(r.dueDate).toISOString().slice(0, 10) : "",
      ].join(",")
    );
  }
  return lines.join("\n");
};

const getAnalyticsReport = async (user) => {
  const dashboard = await getDashboard(user);
  const pendingDues = await getPendingDues(user);
  return {
    attendance: dashboard.attendanceSummary,
    fees: {
      collection: dashboard.feeCollectionSummary,
      pendingStudents: pendingDues.length,
      totalPending: pendingDues.reduce((sum, item) => sum + item.pending, 0),
    },
    performance: {
      message: "Performance analytics endpoint is ready for exam/result expansion.",
    },
  };
};

const createNotice = async (user, body, file) => {
  const notice = await schoolAdminNoticeService.create(user, body, file);
  await logActivity(user, "CREATE", "NOTICE", notice._id);
  return notice;
};

const listNotices = async (user, query) => schoolAdminNoticeService.list(user, query || {});

const updateNotice = async (user, noticeId, body, file) => {
  const notice = await schoolAdminNoticeService.update(user, noticeId, body, file);
  await logActivity(user, "UPDATE", "NOTICE", noticeId);
  return notice;
};

const deleteNotice = async (user, noticeId) => {
  const data = await schoolAdminNoticeService.remove(user, noticeId);
  await logActivity(user, "DELETE", "NOTICE", noticeId);
  return data;
};

const updateSchoolProfile = async (user, payload) => {
  const schoolId = ensureSchoolAdmin(user);
  const school = await School.findByIdAndUpdate(
    schoolId,
    {
      ...(payload.schoolName ? { "basicInfo.schoolName": payload.schoolName, name: payload.schoolName } : {}),
      ...(payload.phoneNumber ? { "basicInfo.phoneNumber": payload.phoneNumber } : {}),
      ...(payload.email ? { "basicInfo.email": payload.email } : {}),
      ...(payload.addressLine1 ? { "addressDetails.addressLine1": payload.addressLine1, address: payload.addressLine1 } : {}),
      ...(payload.primaryColor ? { "branding.primaryColor": payload.primaryColor } : {}),
      ...(payload.secondaryColor ? { "branding.secondaryColor": payload.secondaryColor } : {}),
      ...(payload.schoolLogo ? { "branding.schoolLogo": payload.schoolLogo } : {}),
    },
    { new: true }
  );
  if (!school) throw new AppError("School not found", 404);
  await logActivity(user, "UPDATE", "SCHOOL_PROFILE", school._id);
  return school;
};

const changePassword = async (user, payload) => {
  const currentUser = await adminRepository.findUserById(user.userId);
  if (!currentUser) throw new AppError("User not found", 404);
  const ok = await currentUser.comparePassword(payload.currentPassword || "");
  if (!ok) throw new AppError("Current password is incorrect", 400);
  currentUser.password = payload.newPassword;
  await currentUser.save();
  await logActivity(user, "UPDATE", "PASSWORD", user.userId);
  return { changed: true };
};

export const adminService = {
  getDashboard,
  createStudent,
  listStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  bulkImportStudents,
  generateStudentIdCardPDF,
  createTeacher,
  listTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  createClass,
  listClasses,
  updateClass,
  deleteClass,
  createSubject,
  listSubjects,
  updateSubject,
  deleteSubject,
  markStudentAttendance,
  studentAttendanceReport,
  markTeacherAttendance,
  teacherAttendanceReport,
  monthlyAttendanceSummary,
  createFeeStructure,
  getFeeStructures,
  assignFees,
  assignFeesBulk,
  listStudentFeesAdmin,
  getStudentFeeOne,
  patchStudentFee,
  sendFeeReminder,
  exportStudentFeesCsv,
  collectFeePayment,
  generateFeeReceiptPDF,
  getPendingDues,
  getAnalyticsReport,
  createNotice,
  listNotices,
  updateNotice,
  deleteNotice,
  updateSchoolProfile,
  changePassword,
};
