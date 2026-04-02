import dotenv from "dotenv";
import connectDB from "../config/db.js";
import { ROLES } from "../src/common/constants/roles.js";
import School from "../src/models/School.js";
import User from "../src/models/User.js";
import ClassModel from "../src/models/Class.js";
import Student from "../src/models/Student.js";
import Teacher from "../src/models/Teacher.js";
import Attendance from "../src/models/Attendance.js";
import Result from "../src/models/Result.js";
import FeeStructure from "../src/models/FeeStructure.js";
import FeeAssignment from "../src/models/FeeAssignment.js";
import FeePayment from "../src/models/FeePayment.js";
import Assignment from "../src/models/Assignment.js";
import Notice from "../src/models/Notice.js";
import * as feeDomain from "../src/modules/admin/feeDomain.js";

dotenv.config();

const run = async () => {
  await connectDB();

  await Promise.all([
    School.deleteMany({}),
    User.deleteMany({}),
    ClassModel.deleteMany({}),
    Student.deleteMany({}),
    Teacher.deleteMany({}),
    Attendance.deleteMany({}),
    Result.deleteMany({}),
    FeePayment.deleteMany({}),
    FeeAssignment.deleteMany({}),
    FeeStructure.deleteMany({}),
    Assignment.deleteMany({}),
    Notice.deleteMany({}),
  ]);

  const school = await School.create({
    name: "Green Valley School",
    code: "GVS001",
    address: "Demo City",
  });

  const superAdmin = await User.create({
    name: "ERP Super Admin",
    email: "superadmin@erp.com",
    password: "password123",
    role: ROLES.SUPER_ADMIN,
    schoolId: null,
  });

  const schoolAdmin = await User.create({
    name: "School Admin",
    email: "schooladmin@gvs.com",
    password: "password123",
    role: ROLES.SCHOOL_ADMIN,
    schoolId: school._id,
  });

  const class10A = await ClassModel.create({
    schoolId: school._id,
    name: "10",
    section: "A",
  });

  const studentUser = await User.create({
    name: "Aarav Sharma",
    email: "student@gvs.com",
    password: "password123",
    role: ROLES.STUDENT,
    schoolId: school._id,
  });

  const teacherUser = await User.create({
    name: "Priya Mehta",
    email: "teacher@gvs.com",
    password: "password123",
    role: ROLES.TEACHER,
    schoolId: school._id,
  });

  const student = await Student.create({
    schoolId: school._id,
    userId: studentUser._id,
    classId: class10A._id,
    section: "A",
    rollNumber: "10A-01",
  });

  await Teacher.create({
    schoolId: school._id,
    userId: teacherUser._id,
    subject: "Mathematics",
  });

  await Attendance.insertMany([
    { schoolId: school._id, studentId: student._id, date: new Date("2026-01-02"), status: "PRESENT" },
    { schoolId: school._id, studentId: student._id, date: new Date("2026-01-03"), status: "PRESENT" },
    { schoolId: school._id, studentId: student._id, date: new Date("2026-01-04"), status: "ABSENT" },
  ]);

  await Result.insertMany([
    { schoolId: school._id, studentId: student._id, subject: "Math", marks: 88 },
    { schoolId: school._id, studentId: student._id, subject: "Science", marks: 91 },
    { schoolId: school._id, studentId: student._id, subject: "English", marks: 84 },
  ]);

  const feeStructure = await FeeStructure.create({
    schoolId: school._id,
    title: "Class 10 Annual 2025-26",
    academicYear: "2025-2026",
    classId: class10A._id,
    section: "",
    feesBreakdown: {
      tuitionFee: 40000,
      examFee: 3000,
      libraryFee: 2000,
      sportsFee: 2000,
      otherCharges: [{ label: "Lab", amount: 3000 }],
    },
    discountType: "NONE",
    discountValue: 0,
    totalAmount: 50000,
    frequency: "YEARLY",
    installmentEnabled: false,
    dueDate: new Date("2026-06-30"),
    fineType: "PER_DAY",
    fineAmount: 10,
    gracePeriodDays: 5,
    status: "ACTIVE",
  });

  const assignPayload = feeDomain.buildStudentFeeDocument(feeStructure, student, 0);
  await FeeAssignment.create({
    ...assignPayload,
    paidAmount: 32000,
    remainingAmount: 18000,
    status: "PARTIAL",
  });

  await Assignment.insertMany([
    { schoolId: school._id, classId: class10A._id, title: "Math Worksheet 5", dueDate: new Date("2026-04-01") },
    { schoolId: school._id, classId: class10A._id, title: "Science Lab Record", dueDate: new Date("2026-04-05") },
  ]);

  await Notice.insertMany([
    {
      schoolId: school._id,
      title: "PTM Meeting",
      description: "Parent-teacher meeting on Friday at 10 AM.",
      message: "Parent-teacher meeting on Friday at 10 AM.",
      noticeType: "EVENT",
      targetAudience: "BOTH",
      status: "PUBLISHED",
      priority: "HIGH",
      publishDate: new Date(),
    },
    {
      schoolId: school._id,
      title: "Exam Form",
      description: "Submit exam form before month end.",
      message: "Submit exam form before month end.",
      noticeType: "GENERAL",
      targetAudience: "STUDENTS",
      classId: class10A._id,
      status: "PUBLISHED",
      priority: "MEDIUM",
      publishDate: new Date(),
    },
  ]);

  console.log("Seed complete");
  console.log("Super Admin:", superAdmin.email, "password123");
  console.log("School Admin:", schoolAdmin.email, "password123");
  console.log("Student:", studentUser.email, "password123");
  process.exit(0);
};

run().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
