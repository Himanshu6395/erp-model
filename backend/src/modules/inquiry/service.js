import mongoose from "mongoose";
import AppError from "../../common/errors/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import School from "../../models/School.js";
import Student from "../../models/Student.js";
import Teacher from "../../models/Teacher.js";
import ClassModel from "../../models/Class.js";
import Inquiry, { INQUIRY_SOURCE, INQUIRY_STATUS } from "../../models/Inquiry.js";
import { inquiryRepository } from "./repository.js";
import { adminRepository } from "../admin/repository.js";

const ensureSchoolAdmin = (user) => {
  if (!user?.schoolId) throw new AppError("School context missing", 400);
  if (user.role !== ROLES.SCHOOL_ADMIN) throw new AppError("Forbidden", 403);
  return user.schoolId;
};

const ensureTeacher = (user) => {
  if (!user?.schoolId) throw new AppError("School context missing", 400);
  if (user.role !== ROLES.TEACHER) throw new AppError("Forbidden", 403);
  return user.schoolId;
};

async function getTeacherDoc(user) {
  const schoolId = ensureTeacher(user);
  const teacher = await Teacher.findOne({
    schoolId,
    userId: new mongoose.Types.ObjectId(user.userId),
  }).lean();
  if (!teacher) throw new AppError("Teacher profile not found", 404);
  return teacher;
}

async function nextInquiryId(schoolId) {
  const school = await School.findById(schoolId).select("code").lean();
  const prefix = `INQ-${String(school?.code || "SCH").replace(/\s+/g, "").toUpperCase().slice(0, 8)}`;
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const latest = await Inquiry.findOne({
    schoolId,
    inquiryId: new RegExp(`^${escaped}-`),
  })
    .select("inquiryId")
    .sort({ inquiryId: -1 })
    .lean();
  let next = 1;
  const cur = latest?.inquiryId || "";
  const m = cur.match(/-(\d+)$/);
  if (m) next = Number(m[1]) + 1;
  return `${prefix}-${String(next).padStart(4, "0")}`;
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function buildFilter(user, query, forceTeacherId = null) {
  const schoolId = new mongoose.Types.ObjectId(user.schoolId);
  const filter = { schoolId };
  if (forceTeacherId) {
    filter.assignedTeacherId = new mongoose.Types.ObjectId(forceTeacherId);
  }
  if (query.teacherId && mongoose.Types.ObjectId.isValid(query.teacherId)) {
    filter.assignedTeacherId = new mongoose.Types.ObjectId(query.teacherId);
  }
  if (query.search) {
    const rx = new RegExp(query.search.trim(), "i");
    filter.$or = [{ studentFullName: rx }, { mobileNumber: rx }, { email: rx }, { inquiryId: rx }];
  }
  if (query.status && INQUIRY_STATUS.includes(query.status)) filter.status = query.status;
  if (query.interestedClass && query.interestedClass.trim()) {
    filter.interestedClass = new RegExp(query.interestedClass.trim(), "i");
  }
  if (query.fromDate || query.toDate) {
    filter.createdAt = {};
    if (query.fromDate) filter.createdAt.$gte = new Date(query.fromDate);
    if (query.toDate) {
      const t = new Date(query.toDate);
      t.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = t;
    }
  }
  return filter;
}

async function resolveClassForAdmission(schoolId, inquiry, body) {
  if (body.classId && mongoose.Types.ObjectId.isValid(body.classId)) {
    const c = await ClassModel.findOne({ _id: body.classId, schoolId });
    if (!c) throw new AppError("Class not found", 404);
    return { classId: c._id, section: body.section?.trim() || c.section };
  }
  if (inquiry.interestedClassId) {
    const c = await ClassModel.findOne({ _id: inquiry.interestedClassId, schoolId });
    if (!c) throw new AppError("Interested class invalid", 400);
    return { classId: c._id, section: body.section?.trim() || c.section };
  }
  const label = (inquiry.interestedClass || "").trim().toLowerCase();
  if (!label) throw new AppError("classId required or set interestedClass on inquiry", 400);
  const classes = await ClassModel.find({ schoolId }).lean();
  const match = classes.find((c) => `${c.name} ${c.section}`.toLowerCase().includes(label));
  if (!match) throw new AppError("Could not resolve class — pass classId in request", 400);
  return { classId: match._id, section: body.section?.trim() || match.section };
}

async function nextRoll(schoolId, classId, section) {
  const rows = await Student.find({ schoolId, classId, section }).select("rollNumber").lean();
  let max = 0;
  for (const r of rows) {
    const n = parseInt(String(r.rollNumber || "").replace(/\D+/g, ""), 10);
    if (!Number.isNaN(n)) max = Math.max(max, n);
  }
  return String(max + 1);
}

async function generateStudentCodeLike(schoolId) {
  const school = await School.findById(schoolId).select("code").lean();
  const prefix = String(school?.code || "STU").replace(/\s+/g, "").toUpperCase().slice(0, 8);
  const pattern = new RegExp(`^${prefix}-\\d+$`);
  const latest = await Student.findOne({ schoolId, studentCode: pattern })
    .select("studentCode")
    .sort({ studentCode: -1 })
    .lean();
  const current = String(latest?.studentCode || "");
  const match = current.match(/-(\d+)$/);
  const nextNum = match ? Number(match[1]) + 1 : 1;
  return `${prefix}-${String(nextNum).padStart(5, "0")}`;
}

export const inquiryService = {
  async createInquiry(adminUser, body) {
    const schoolId = ensureSchoolAdmin(adminUser);
    const inquiryId = await nextInquiryId(schoolId);
    const assignedTeacherId =
      body.assignedTeacherId && mongoose.Types.ObjectId.isValid(body.assignedTeacherId)
        ? body.assignedTeacherId
        : null;
    if (assignedTeacherId) {
      const ok = await Teacher.findOne({ _id: assignedTeacherId, schoolId });
      if (!ok) throw new AppError("Assigned teacher not found", 404);
    }
    const interestedClassId =
      body.interestedClassId && mongoose.Types.ObjectId.isValid(body.interestedClassId)
        ? body.interestedClassId
        : null;

    const doc = {
      schoolId,
      inquiryId,
      studentFullName: String(body.studentFullName || "").trim(),
      fatherName: String(body.fatherName || "").trim(),
      motherName: String(body.motherName || "").trim(),
      mobileNumber: String(body.mobileNumber || "").trim(),
      alternateNumber: String(body.alternateNumber || "").trim(),
      email: String(body.email || "").trim().toLowerCase(),
      gender: ["MALE", "FEMALE", "OTHER"].includes(body.gender) ? body.gender : "OTHER",
      dateOfBirth: parseDate(body.dateOfBirth),
      address: String(body.address || "").trim(),
      city: String(body.city || "").trim(),
      state: String(body.state || "").trim(),
      pincode: String(body.pincode || "").trim(),
      interestedClass: String(body.interestedClass || "").trim(),
      interestedClassId,
      previousSchool: String(body.previousSchool || "").trim(),
      source: INQUIRY_SOURCE.includes(body.source) ? body.source : "WALK_IN",
      counselorNotes: String(body.counselorNotes || "").trim(),
      followUpDate: parseDate(body.followUpDate),
      assignedTeacherId,
      assignment:
        assignedTeacherId && mongoose.Types.ObjectId.isValid(adminUser.userId)
          ? {
              teacherId: assignedTeacherId,
              assignedByUserId: adminUser.userId,
              assignedAt: new Date(),
            }
          : null,
      status: INQUIRY_STATUS.includes(body.status) ? body.status : "PENDING",
      statusHistory: [
        {
          status: INQUIRY_STATUS.includes(body.status) ? body.status : "PENDING",
          note: "Created",
          changedByUserId: adminUser.userId,
          changedAt: new Date(),
        },
      ],
    };
    if (!doc.studentFullName) throw new AppError("Student full name required", 400);
    if (!doc.mobileNumber) throw new AppError("Mobile number required", 400);
    return inquiryRepository.create(doc);
  },

  async listInquiries(adminUser, query) {
    const schoolIdStr = ensureSchoolAdmin(adminUser);
    const filter = buildFilter({ schoolId: schoolIdStr }, query);
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      inquiryRepository.findMany(filter, { skip, limit, sort: { createdAt: -1 } }),
      inquiryRepository.count(filter),
    ]);
    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  },

  async exportCsv(adminUser, query) {
    const schoolIdStr = ensureSchoolAdmin(adminUser);
    const filter = buildFilter({ schoolId: schoolIdStr }, query);
    const items = await inquiryRepository.findMany(filter, {
      skip: 0,
      limit: 5000,
      sort: { createdAt: -1 },
    });
    const headers = ["Inquiry ID", "Student", "Mobile", "Email", "Class", "Status", "Source", "Follow-up", "Created"];
    const rows = items.map((r) =>
      [
        r.inquiryId,
        `"${String(r.studentFullName || "").replace(/"/g, '""')}"`,
        r.mobileNumber,
        r.email,
        `"${String(r.interestedClass || "").replace(/"/g, '""')}"`,
        r.status,
        r.source,
        r.followUpDate ? new Date(r.followUpDate).toISOString() : "",
        r.createdAt ? new Date(r.createdAt).toISOString() : "",
      ].join(",")
    );
    return `${headers.join(",")}\n${rows.join("\n")}`;
  },

  async getOne(adminUser, id) {
    const schoolId = ensureSchoolAdmin(adminUser);
    const row = await inquiryRepository.findById({ schoolId, id });
    if (!row) throw new AppError("Inquiry not found", 404);
    return row;
  },

  async updateInquiry(adminUser, id, body) {
    const schoolId = ensureSchoolAdmin(adminUser);
    const existing = await inquiryRepository.findById({ schoolId, id });
    if (!existing) throw new AppError("Inquiry not found", 404);
    const updates = {};
    const fields = [
      "studentFullName",
      "fatherName",
      "motherName",
      "mobileNumber",
      "alternateNumber",
      "email",
      "gender",
      "address",
      "city",
      "state",
      "pincode",
      "interestedClass",
      "previousSchool",
      "source",
      "counselorNotes",
    ];
    for (const k of fields) if (body[k] !== undefined) updates[k] = body[k];
    if (body.dateOfBirth !== undefined) updates.dateOfBirth = parseDate(body.dateOfBirth);
    if (body.followUpDate !== undefined) updates.followUpDate = parseDate(body.followUpDate);
    if (body.interestedClassId !== undefined) {
      updates.interestedClassId =
        body.interestedClassId && mongoose.Types.ObjectId.isValid(body.interestedClassId)
          ? body.interestedClassId
          : null;
    }
    return inquiryRepository.updateById({ schoolId, id, payload: updates });
  },

  async deleteInquiry(adminUser, id) {
    const schoolId = ensureSchoolAdmin(adminUser);
    const row = await inquiryRepository.deleteById({ schoolId, id });
    if (!row) throw new AppError("Inquiry not found", 404);
    return row;
  },

  async patchStatus(actorUser, id, payload, teacherMode = false) {
    const schoolId = teacherMode ? ensureTeacher(actorUser) : ensureSchoolAdmin(actorUser);
    const inquiry = await Inquiry.findOne({ _id: id, schoolId });
    if (!inquiry) throw new AppError("Inquiry not found", 404);
    if (teacherMode) {
      const teacher = await getTeacherDoc(actorUser);
      if (!inquiry.assignedTeacherId?.equals(teacher._id)) throw new AppError("Not assigned to you", 403);
      if (payload.status === "CONVERTED_TO_ADMISSION") throw new AppError("Teachers cannot convert", 403);
    }
    const next = payload.status;
    if (!INQUIRY_STATUS.includes(next)) throw new AppError("Invalid status", 400);
    if (inquiry.status === "CONVERTED_TO_ADMISSION" && next !== "CONVERTED_TO_ADMISSION") {
      throw new AppError("Cannot change status after admission", 400);
    }
    inquiry.status = next;
    inquiry.statusHistory.push({
      status: next,
      note: String(payload.note || "").trim(),
      changedByUserId: actorUser.userId,
      changedAt: new Date(),
    });
    await inquiry.save();
    return inquiryRepository.findById({ schoolId, id });
  },

  async assignTeacher(adminUser, id, body) {
    const schoolId = ensureSchoolAdmin(adminUser);
    const inquiry = await Inquiry.findOne({ _id: id, schoolId });
    if (!inquiry) throw new AppError("Inquiry not found", 404);
    const tid = body.teacherId;
    if (!tid || !mongoose.Types.ObjectId.isValid(tid)) throw new AppError("Valid teacherId required", 400);
    const teacher = await Teacher.findOne({ _id: tid, schoolId });
    if (!teacher) throw new AppError("Teacher not found", 404);
    inquiry.assignedTeacherId = tid;
    inquiry.assignment = {
      teacherId: tid,
      assignedByUserId: adminUser.userId,
      assignedAt: new Date(),
    };
    inquiry.statusHistory.push({
      status: inquiry.status,
      note: "Assigned teacher",
      changedByUserId: adminUser.userId,
      changedAt: new Date(),
    });
    await inquiry.save();
    return inquiryRepository.findById({ schoolId, id });
  },

  async addFollowUp(actorUser, id, body, teacherMode = false) {
    const schoolId = teacherMode ? ensureTeacher(actorUser) : ensureSchoolAdmin(actorUser);
    const inquiry = await Inquiry.findOne({ _id: id, schoolId });
    if (!inquiry) throw new AppError("Inquiry not found", 404);
    if (teacherMode) {
      const teacher = await getTeacherDoc(actorUser);
      if (!inquiry.assignedTeacherId?.equals(teacher._id)) throw new AppError("Not assigned to you", 403);
    }
    const fd = parseDate(body.followUpDate);
    if (!fd) throw new AppError("followUpDate required", 400);
    inquiry.followUps.push({
      followUpDate: fd,
      remarks: String(body.remarks || "").trim(),
      nextAction: String(body.nextAction || "").trim(),
      createdByUserId: actorUser.userId,
      createdAt: new Date(),
    });
    inquiry.followUpDate = fd;
    await inquiry.save();
    return inquiryRepository.findById({ schoolId, id });
  },

  async addComment(actorUser, id, text, teacherMode = false) {
    const schoolId = teacherMode ? ensureTeacher(actorUser) : ensureSchoolAdmin(actorUser);
    const inquiry = await Inquiry.findOne({ _id: id, schoolId });
    if (!inquiry) throw new AppError("Inquiry not found", 404);
    if (teacherMode) {
      const teacher = await getTeacherDoc(actorUser);
      if (!inquiry.assignedTeacherId?.equals(teacher._id)) throw new AppError("Not assigned to you", 403);
    }
    inquiry.comments.push({
      text: String(text || "").trim(),
      createdByUserId: actorUser.userId,
      createdAt: new Date(),
    });
    await inquiry.save();
    return inquiryRepository.findById({ schoolId, id });
  },

  async convertToAdmission(adminUser, id, body) {
    const schoolId = ensureSchoolAdmin(adminUser);
    const inquiry = await Inquiry.findOne({ _id: id, schoolId });
    if (!inquiry) throw new AppError("Inquiry not found", 404);
    if (inquiry.status === "CONVERTED_TO_ADMISSION" || inquiry.conversion?.studentId) {
      throw new AppError("Already converted", 400);
    }
    const { classId, section } = await resolveClassForAdmission(schoolId, inquiry, body);

    const displayName = inquiry.studentFullName.trim();
    let email =
      String(body.email || inquiry.email || "").trim().toLowerCase() ||
      `inquiry.${String(inquiry.inquiryId || "x").replace(/[^a-zA-Z0-9]/g, "")}@noreply.local`.toLowerCase();
    let existing = await adminRepository.findUserByEmail(email);
    let suffix = 0;
    while (existing && suffix < 20) {
      suffix += 1;
      email = `inq.${suffix}.${String(inquiry.inquiryId || "x").replace(/[^a-zA-Z0-9]/g, "")}@noreply.local`;
      existing = await adminRepository.findUserByEmail(email);
    }
    if (existing) throw new AppError("Could not allocate unique login email — set email on inquiry/body", 409);

    const password = String(body.password || "").trim() || `Stu@${Math.random().toString(36).slice(2, 10)}`;
    let rollNumber = await nextRoll(schoolId, classId, section);
    let studentCode = await generateStudentCodeLike(schoolId);

    let studentUser;
    let student;
    let lastErr = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        studentUser = await adminRepository.createUser({
          name: displayName,
          email,
          password,
          phone: inquiry.mobileNumber || "",
          role: ROLES.STUDENT,
          schoolId,
        });

        student = await adminRepository.createStudent({
          schoolId,
          userId: studentUser._id,
          classId,
          section,
          rollNumber,
          studentCode,
          admissionNumber: body.admissionNumber?.trim() || `ADM-${new Date().getFullYear()}-${rollNumber.padStart(4, "0")}`,
          phone: inquiry.mobileNumber || "",
          alternatePhone: inquiry.alternateNumber || "",
          gender: inquiry.gender,
          dateOfBirth: inquiry.dateOfBirth || null,
          address: inquiry.address || "",
          city: inquiry.city || "",
          state: inquiry.state || "",
          pincode: inquiry.pincode || "",
          admissionDate: new Date(),
          parentName: inquiry.fatherName || "",
          fatherName: inquiry.fatherName || "",
          motherName: inquiry.motherName || "",
          parentPhone: inquiry.mobileNumber || "",
          parentEmail: inquiry.email || email,
          previousSchool: inquiry.previousSchool || "",
          status: "ACTIVE",
        });
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
        if (studentUser?._id) await adminRepository.deleteUserById(studentUser._id);
        if (String(e.message || "").includes("studentCode") || e.code === 11000) {
          studentCode = await generateStudentCodeLike(schoolId);
        } else {
          throw e;
        }
      }
    }
    if (lastErr) throw lastErr;

    inquiry.status = "CONVERTED_TO_ADMISSION";
    inquiry.conversion = {
      convertedByUserId: adminUser.userId,
      convertedAt: new Date(),
      studentId: student._id,
      admissionNumber: student.admissionNumber,
      rollNumber,
    };
    inquiry.statusHistory.push({
      status: "CONVERTED_TO_ADMISSION",
      note: "Converted to admission",
      changedByUserId: adminUser.userId,
      changedAt: new Date(),
    });
    await inquiry.save();

    const plainPw = password.length <= 24 ? password : undefined;
    return {
      inquiry: await inquiryRepository.findById({ schoolId, id }),
      studentCredentials: { email, temporaryPassword: plainPw || "***" },
    };
  },

  async analytics(adminUser) {
    const schoolId = ensureSchoolAdmin(adminUser);
    const oid =
      schoolId instanceof mongoose.Types.ObjectId ? schoolId : new mongoose.Types.ObjectId(String(schoolId));

    const byStatus = await Inquiry.aggregate([
      { $match: { schoolId: oid } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const statusMap = Object.fromEntries(byStatus.map((r) => [r._id, r.count]));
    const total = await Inquiry.countDocuments({ schoolId: oid });
    const monthly = await Inquiry.aggregate([
      { $match: { schoolId: oid } },
      { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
      { $limit: 24 },
    ]);
    const bySource = await Inquiry.aggregate([
      { $match: { schoolId: oid } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
    ]);

    const teacherPerf = await Inquiry.aggregate([
      { $match: { schoolId: oid, assignedTeacherId: { $ne: null } } },
      {
        $group: {
          _id: "$assignedTeacherId",
          total: { $sum: 1 },
          converted: {
            $sum: { $cond: [{ $eq: ["$status", "CONVERTED_TO_ADMISSION"] }, 1, 0] },
          },
        },
      },
      { $limit: 20 },
    ]);

    const tIds = teacherPerf.map((t) => t._id).filter(Boolean);
    const teachers = await Teacher.find({ _id: { $in: tIds } }).populate("userId", "name").lean();
    const tMap = {};
    teachers.forEach((t) => {
      tMap[t._id.toString()] = [t.firstName, t.lastName].filter(Boolean).join(" ") || t.userId?.name || "Teacher";
    });

    const pendingFollowUps = await Inquiry.countDocuments({
      schoolId: oid,
      status: "FOLLOW_UP",
      followUpDate: { $lte: new Date() },
    });

    return {
      total,
      pending: statusMap.PENDING || 0,
      followUp: statusMap.FOLLOW_UP || 0,
      dropped: statusMap.DROPPED || 0,
      converted: statusMap.CONVERTED_TO_ADMISSION || 0,
      conversionRatio:
        total > 0 ? Math.round(((statusMap.CONVERTED_TO_ADMISSION || 0) / total) * 1000) / 10 : 0,
      pendingFollowUps,
      monthly: monthly.map((r) => ({
        label: `${r._id.y}-${String(r._id.m).padStart(2, "0")}`,
        count: r.count,
      })),
      bySource: bySource.map((r) => ({ source: r._id, count: r.count })),
      teacherPerformance: teacherPerf.map((row) => ({
        teacherId: row._id,
        name: tMap[row._id.toString()] || "—",
        total: row.total,
        converted: row.converted,
      })),
    };
  },

  async teacherList(user, query) {
    const teacher = await getTeacherDoc(user);
    return inquiryService.listInquiries(
      { ...user, role: ROLES.SCHOOL_ADMIN },
      { ...query, teacherId: teacher._id.toString() }
    );
  },

  async teacherGetOne(user, id) {
    const schoolId = ensureTeacher(user);
    const teacher = await getTeacherDoc(user);
    const row = await inquiryRepository.findById({ schoolId, id });
    if (!row) throw new AppError("Inquiry not found", 404);
    const assignedId =
      row.assignedTeacherId && typeof row.assignedTeacherId === "object" && row.assignedTeacherId._id
        ? row.assignedTeacherId._id.toString()
        : row.assignedTeacherId?.toString?.();
    if (!assignedId || assignedId !== teacher._id.toString()) {
      throw new AppError("Not assigned to you", 403);
    }
    return row;
  },
};

export default inquiryService;
