import mongoose from "mongoose";
import AppError from "../../common/errors/AppError.js";
import School from "../../models/School.js";
import User from "../../models/User.js";
import Student from "../../models/Student.js";
import Teacher from "../../models/Teacher.js";
import ClassModel from "../../models/Class.js";
import Notification from "../../models/Notification.js";
import LibraryBook from "../../models/LibraryBook.js";
import LibraryCategory from "../../models/LibraryCategory.js";
import LibraryIssue from "../../models/LibraryIssue.js";
import LibraryFineRecord from "../../models/LibraryFineRecord.js";

const DEFAULT_LIBRARY_SETTINGS = {
  maxBooksPerStudent: 3,
  defaultIssueDays: 14,
  finePerDay: 5,
  maxIssueDays: 30,
  requestRequiresApproval: true,
  allowStudentRequests: true,
  allowEbooks: true,
  issueReminderDaysBefore: 2,
};

const ensureObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(String(value || ""))) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }
  return new mongoose.Types.ObjectId(String(value));
};

const parsePaging = (query = {}) => {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 10)));
  return { page, limit, skip: (page - 1) * limit };
};

const startOfDay = (value = new Date()) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (value = new Date()) => {
  const d = new Date(value);
  d.setHours(23, 59, 59, 999);
  return d;
};

const diffDays = (from, to) => {
  const a = startOfDay(from);
  const b = startOfDay(to);
  return Math.max(0, Math.ceil((b - a) / 86400000));
};

const getSchoolSettings = async (schoolId) => {
  const school = await School.findById(schoolId).lean();
  if (!school) throw new AppError("School not found", 404);
  return {
    school,
    settings: { ...DEFAULT_LIBRARY_SETTINGS, ...(school.librarySettings || {}) },
  };
};

const buildBookStatus = (book) => {
  if (book.status === "ARCHIVED") return "ARCHIVED";
  if (Number(book.availableCopies || 0) <= 0) return "OUT_OF_STOCK";
  if (Number(book.availableCopies || 0) <= Math.max(1, Math.floor(Number(book.quantity || 0) * 0.2))) return "LOW_STOCK";
  return "AVAILABLE";
};

const applyBookInventoryState = async (book) => {
  book.status = buildBookStatus(book);
  await book.save();
  return book;
};

const markOverdueIssues = async (schoolId) => {
  await LibraryIssue.updateMany(
    {
      schoolId,
      status: "ISSUED",
      returnDate: null,
      dueDate: { $lt: startOfDay(new Date()) },
    },
    { $set: { status: "OVERDUE" } }
  );
};

const createUserNotification = async ({ schoolId, userId, title, message, type }) => {
  if (!userId) return null;
  return Notification.create({ schoolId, userId, title, message, type });
};

const getStudentWithRelations = async (schoolId, studentId) => {
  const student = await Student.findOne({ _id: studentId, schoolId }).populate("userId", "name email").populate("classId", "name section");
  if (!student) throw new AppError("Student not found", 404);
  return student;
};

const getStudentByUser = async ({ schoolId, userId }) => {
  const student = await Student.findOne({ schoolId, userId }).populate("userId", "name email").populate("classId", "name section");
  if (!student) throw new AppError("Student profile not found", 404);
  return student;
};

const getTeacherByUser = async ({ schoolId, userId }) =>
  Teacher.findOne({ schoolId, userId }).populate("userId", "name email");

const getBookOrThrow = async (schoolId, bookId) => {
  const book = await LibraryBook.findOne({ _id: bookId, schoolId }).populate("categoryId", "name color");
  if (!book) throw new AppError("Book not found", 404);
  return book;
};

const countActiveIssuedForStudent = async (schoolId, studentId) =>
  LibraryIssue.countDocuments({
    schoolId,
    studentId,
    status: { $in: ["ISSUED", "OVERDUE"] },
    returnDate: null,
  });

const countPendingRequestForBook = async (schoolId, studentId, bookId) =>
  LibraryIssue.countDocuments({
    schoolId,
    studentId,
    bookId,
    status: { $in: ["REQUESTED", "ISSUED", "OVERDUE"] },
    returnDate: null,
  });

const buildStudentSnapshot = (student) => ({
  name: student.userId?.name || "",
  rollNumber: student.rollNumber || "",
  section: student.section || student.classId?.section || "",
  profileImage: student.profileImage || "",
  className: student.classId?.name || "",
});

const buildBookSnapshot = (book) => ({
  title: book.title || "",
  bookCode: book.bookCode || "",
  author: book.author || "",
  isbn: book.isbn || "",
  categoryName: book.categoryId?.name || "",
});

const enrichIssue = (issue) => {
  const fineAmount = Number(issue.fine || 0);
  const isOverdue = !issue.returnDate && ["ISSUED", "OVERDUE"].includes(issue.status) && issue.dueDate && new Date(issue.dueDate) < new Date();
  return {
    ...issue.toObject(),
    computedStatus: isOverdue && issue.status === "ISSUED" ? "OVERDUE" : issue.status,
    fineAmount,
    overdueDays: !issue.returnDate && issue.dueDate ? diffDays(issue.dueDate, new Date()) : 0,
  };
};

const listCategories = async (schoolId) => {
  const categories = await LibraryCategory.find({ schoolId }).sort({ name: 1 }).lean();
  const counts = await LibraryBook.aggregate([
    { $match: { schoolId: ensureObjectId(schoolId, "schoolId"), categoryId: { $ne: null } } },
    { $group: { _id: "$categoryId", booksCount: { $sum: 1 }, quantity: { $sum: "$quantity" } } },
  ]);
  const countMap = new Map(counts.map((item) => [String(item._id), item]));
  return categories.map((category) => ({
    ...category,
    booksCount: countMap.get(String(category._id))?.booksCount || 0,
    quantity: countMap.get(String(category._id))?.quantity || 0,
  }));
};

const createCategory = async (schoolId, payload) => {
  const name = String(payload.name || "").trim();
  if (!name) throw new AppError("Category name is required", 400);
  const exists = await LibraryCategory.findOne({ schoolId, name });
  if (exists) throw new AppError("Category already exists", 409);
  return LibraryCategory.create({
    schoolId,
    name,
    description: String(payload.description || "").trim(),
    color: String(payload.color || "#2563eb").trim(),
    isActive: payload.isActive !== false,
  });
};

const updateCategory = async (schoolId, categoryId, payload) => {
  const category = await LibraryCategory.findOne({ _id: categoryId, schoolId });
  if (!category) throw new AppError("Category not found", 404);
  if (payload.name !== undefined) category.name = String(payload.name || "").trim();
  if (payload.description !== undefined) category.description = String(payload.description || "").trim();
  if (payload.color !== undefined) category.color = String(payload.color || "#2563eb").trim();
  if (payload.isActive !== undefined) category.isActive = Boolean(payload.isActive);
  await category.save();
  return category;
};

const deleteCategory = async (schoolId, categoryId) => {
  const booksCount = await LibraryBook.countDocuments({ schoolId, categoryId });
  if (booksCount > 0) throw new AppError("Cannot delete a category with assigned books", 400);
  const deleted = await LibraryCategory.findOneAndDelete({ _id: categoryId, schoolId });
  if (!deleted) throw new AppError("Category not found", 404);
  return { deleted: true };
};

const listBooks = async (schoolId, query = {}) => {
  const { page, limit, skip } = parsePaging(query);
  const filter = { schoolId };

  if (query.categoryId && mongoose.Types.ObjectId.isValid(String(query.categoryId))) {
    filter.categoryId = String(query.categoryId);
  }
  if (query.status) filter.status = query.status;
  if (query.search) {
    const regex = new RegExp(String(query.search).trim(), "i");
    filter.$or = [{ title: regex }, { author: regex }, { isbn: regex }, { bookCode: regex }, { publisher: regex }];
  }

  const [rows, total] = await Promise.all([
    LibraryBook.find(filter).populate("categoryId", "name color").sort({ createdAt: -1 }).skip(skip).limit(limit),
    LibraryBook.countDocuments(filter),
  ]);

  return {
    data: rows.map((row) => ({ ...row.toObject(), status: buildBookStatus(row) })),
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  };
};

const createBook = async (schoolId, payload) => {
  const title = String(payload.title || payload.bookName || "").trim();
  const bookCode = String(payload.bookCode || "").trim();
  if (!title) throw new AppError("Book name is required", 400);
  if (!bookCode) throw new AppError("Book code is required", 400);
  const exists = await LibraryBook.findOne({ schoolId, bookCode });
  if (exists) throw new AppError("Book code already exists", 409);

  const book = await LibraryBook.create({
    schoolId,
    title,
    bookCode,
    isbn: String(payload.isbn || "").trim(),
    author: String(payload.author || "").trim(),
    publisher: String(payload.publisher || "").trim(),
    categoryId: payload.categoryId && mongoose.Types.ObjectId.isValid(String(payload.categoryId)) ? payload.categoryId : null,
    language: String(payload.language || "English").trim(),
    quantity: Number(payload.quantity || 1),
    availableCopies: payload.availableCopies !== undefined ? Number(payload.availableCopies) : Number(payload.quantity || 1),
    shelfNumber: String(payload.shelfNumber || "").trim(),
    rackNumber: String(payload.rackNumber || "").trim(),
    bookImage: String(payload.bookImage || "").trim(),
    ebookUrl: String(payload.ebookUrl || payload.pdfUrl || "").trim(),
    description: String(payload.description || "").trim(),
    barcode: String(payload.barcode || payload.qrCode || "").trim(),
    status: payload.status || "AVAILABLE",
  });
  await applyBookInventoryState(book);
  return LibraryBook.findById(book._id).populate("categoryId", "name color");
};

const updateBook = async (schoolId, bookId, payload) => {
  const book = await LibraryBook.findOne({ _id: bookId, schoolId });
  if (!book) throw new AppError("Book not found", 404);
  const activeIssueCount = await LibraryIssue.countDocuments({
    schoolId,
    bookId,
    status: { $in: ["ISSUED", "OVERDUE"] },
    returnDate: null,
  });

  const fields = [
    "title",
    "isbn",
    "bookCode",
    "author",
    "publisher",
    "language",
    "shelfNumber",
    "rackNumber",
    "bookImage",
    "ebookUrl",
    "description",
    "barcode",
    "status",
  ];
  fields.forEach((field) => {
    if (payload[field] !== undefined) book[field] = String(payload[field] || "").trim();
  });
  if (payload.categoryId !== undefined) {
    book.categoryId = payload.categoryId && mongoose.Types.ObjectId.isValid(String(payload.categoryId)) ? payload.categoryId : null;
  }
  if (payload.quantity !== undefined) {
    const quantity = Number(payload.quantity || 0);
    if (quantity < activeIssueCount) throw new AppError("Quantity cannot be lower than active issued copies", 400);
    book.quantity = quantity;
  }
  if (payload.availableCopies !== undefined) {
    book.availableCopies = Number(payload.availableCopies || 0);
  } else {
    book.availableCopies = Math.max(0, Number(book.quantity || 0) - activeIssueCount);
  }
  await applyBookInventoryState(book);
  return LibraryBook.findById(book._id).populate("categoryId", "name color");
};

const deleteBook = async (schoolId, bookId) => {
  const activeIssue = await LibraryIssue.findOne({
    schoolId,
    bookId,
    status: { $in: ["REQUESTED", "ISSUED", "OVERDUE"] },
    returnDate: null,
  });
  if (activeIssue) throw new AppError("Cannot delete a book with active requests or issues", 400);
  const deleted = await LibraryBook.findOneAndDelete({ _id: bookId, schoolId });
  if (!deleted) throw new AppError("Book not found", 404);
  return { deleted: true };
};

const getStudentDirectory = async (schoolId, query = {}) => {
  const filter = { schoolId };
  if (query.search) {
    const userIds = await User.find({
      $or: [{ name: new RegExp(String(query.search).trim(), "i") }, { email: new RegExp(String(query.search).trim(), "i") }],
    }).select("_id");
    const ids = userIds.map((u) => u._id);
    filter.$or = [
      { userId: { $in: ids } },
      { rollNumber: new RegExp(String(query.search).trim(), "i") },
      { studentCode: new RegExp(String(query.search).trim(), "i") },
    ];
  }
  const rows = await Student.find(filter).populate("userId", "name email").populate("classId", "name section").sort({ createdAt: -1 }).limit(100);
  return rows.map((student) => ({
    _id: student._id,
    userId: student.userId?._id || null,
    name: student.userId?.name || "",
    email: student.userId?.email || "",
    rollNumber: student.rollNumber || "",
    studentCode: student.studentCode || "",
    className: student.classId?.name || "",
    section: student.section || student.classId?.section || "",
    profileImage: student.profileImage || "",
  }));
};

const issueBookToStudent = async ({ schoolId, actingUserId, payload, source = "ADMIN" }) => {
  const student = await getStudentWithRelations(schoolId, payload.studentId);
  const book = await getBookOrThrow(schoolId, payload.bookId);
  const { settings } = await getSchoolSettings(schoolId);

  if (book.availableCopies <= 0) throw new AppError("No copies available for issue", 400);
  const existing = await countPendingRequestForBook(schoolId, student._id, book._id);
  if (existing > 0) throw new AppError("This student already has an active request or issue for the selected book", 400);
  const activeCount = await countActiveIssuedForStudent(schoolId, student._id);
  if (activeCount >= Number(settings.maxBooksPerStudent || DEFAULT_LIBRARY_SETTINGS.maxBooksPerStudent)) {
    throw new AppError("Student has reached the library issue limit", 400);
  }

  const issueDate = payload.issueDate ? startOfDay(payload.issueDate) : startOfDay(new Date());
  const dueDate = payload.dueDate
    ? endOfDay(payload.dueDate)
    : endOfDay(new Date(issueDate.getTime() + Number(settings.defaultIssueDays || 14) * 86400000));
  if (dueDate <= issueDate) throw new AppError("Due date must be after issue date", 400);

  const issue = await LibraryIssue.create({
    schoolId,
    studentId: student._id,
    bookId: book._id,
    categoryId: book.categoryId?._id || book.categoryId || null,
    requestedByUserId: source === "STUDENT" ? actingUserId : null,
    approvedByUserId: actingUserId,
    issueDate,
    dueDate,
    status: "ISSUED",
    requestNote: String(payload.requestNote || payload.notes || "").trim(),
    studentSnapshot: buildStudentSnapshot(student),
    bookSnapshot: buildBookSnapshot(book),
  });

  book.availableCopies = Math.max(0, Number(book.availableCopies || 0) - 1);
  await applyBookInventoryState(book);

  await createUserNotification({
    schoolId,
    userId: student.userId?._id,
    title: "Library book issued",
    message: `${book.title} has been issued to you. Return by ${new Date(dueDate).toLocaleDateString()}.`,
    type: "LIBRARY_BOOK_ISSUED",
  });

  return LibraryIssue.findById(issue._id).populate("bookId").populate({
    path: "studentId",
    populate: [{ path: "userId", select: "name email" }, { path: "classId", select: "name section" }],
  });
};

const createStudentRequest = async ({ schoolId, userId, payload }) => {
  const { settings } = await getSchoolSettings(schoolId);
  if (!settings.allowStudentRequests) throw new AppError("Student issue requests are disabled", 403);
  const student = await getStudentByUser({ schoolId, userId });
  const book = await getBookOrThrow(schoolId, payload.bookId);
  if (book.availableCopies <= 0) throw new AppError("This book is currently unavailable", 400);
  const existing = await countPendingRequestForBook(schoolId, student._id, book._id);
  if (existing > 0) throw new AppError("You already have an active request or issue for this book", 400);

  if (!settings.requestRequiresApproval) {
    return issueBookToStudent({
      schoolId,
      actingUserId: userId,
      payload: { studentId: student._id, bookId: book._id, requestNote: payload.requestNote },
      source: "STUDENT",
    });
  }

  const issueDate = startOfDay(new Date());
  const dueDate = endOfDay(new Date(issueDate.getTime() + Number(settings.defaultIssueDays || 14) * 86400000));
  const request = await LibraryIssue.create({
    schoolId,
    studentId: student._id,
    bookId: book._id,
    categoryId: book.categoryId?._id || book.categoryId || null,
    requestedByUserId: userId,
    issueDate,
    dueDate,
    status: "REQUESTED",
    requestNote: String(payload.requestNote || "").trim(),
    studentSnapshot: buildStudentSnapshot(student),
    bookSnapshot: buildBookSnapshot(book),
  });

  return LibraryIssue.findById(request._id).populate("bookId");
};

const listIssues = async (schoolId, query = {}) => {
  await markOverdueIssues(schoolId);
  const { page, limit, skip } = parsePaging(query);
  const filter = { schoolId };
  if (query.status) filter.status = query.status;
  if (query.studentId && mongoose.Types.ObjectId.isValid(String(query.studentId))) filter.studentId = String(query.studentId);
  if (query.bookId && mongoose.Types.ObjectId.isValid(String(query.bookId))) filter.bookId = String(query.bookId);
  if (query.search) {
    const regex = new RegExp(String(query.search).trim(), "i");
    filter.$or = [
      { "studentSnapshot.name": regex },
      { "studentSnapshot.rollNumber": regex },
      { "bookSnapshot.title": regex },
      { "bookSnapshot.bookCode": regex },
    ];
  }

  const [rows, total] = await Promise.all([
    LibraryIssue.find(filter)
      .populate("bookId")
      .populate({ path: "studentId", populate: [{ path: "userId", select: "name email" }, { path: "classId", select: "name section" }] })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    LibraryIssue.countDocuments(filter),
  ]);
  return {
    data: rows.map(enrichIssue),
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  };
};

const approveRequest = async (schoolId, actingUserId, issueId, payload = {}) => {
  const request = await LibraryIssue.findOne({ _id: issueId, schoolId, status: "REQUESTED" });
  if (!request) throw new AppError("Request not found", 404);
  const book = await getBookOrThrow(schoolId, request.bookId);
  if (book.availableCopies <= 0) throw new AppError("No copies available for this book", 400);
  request.status = "ISSUED";
  request.approvedByUserId = actingUserId;
  if (payload.dueDate) request.dueDate = endOfDay(payload.dueDate);
  request.rejectionReason = "";
  await request.save();
  book.availableCopies = Math.max(0, Number(book.availableCopies || 0) - 1);
  await applyBookInventoryState(book);

  const student = await Student.findById(request.studentId).populate("userId", "_id name");
  await createUserNotification({
    schoolId,
    userId: student?.userId?._id,
    title: "Library request approved",
    message: `${request.bookSnapshot.title} has been approved and issued to you.`,
    type: "LIBRARY_REQUEST_APPROVED",
  });

  return LibraryIssue.findById(request._id).populate("bookId").populate({
    path: "studentId",
    populate: [{ path: "userId", select: "name email" }, { path: "classId", select: "name section" }],
  });
};

const rejectRequest = async (schoolId, actingUserId, issueId, payload = {}) => {
  const request = await LibraryIssue.findOne({ _id: issueId, schoolId, status: "REQUESTED" });
  if (!request) throw new AppError("Request not found", 404);
  request.status = "REJECTED";
  request.approvedByUserId = actingUserId;
  request.rejectionReason = String(payload.rejectionReason || "Request rejected").trim();
  await request.save();
  const student = await Student.findById(request.studentId).populate("userId", "_id name");
  await createUserNotification({
    schoolId,
    userId: student?.userId?._id,
    title: "Library request update",
    message: `${request.bookSnapshot.title} request was rejected. ${request.rejectionReason}`,
    type: "LIBRARY_REQUEST_REJECTED",
  });
  return request;
};

const returnBook = async (schoolId, actingUserId, issueId, payload = {}) => {
  await markOverdueIssues(schoolId);
  const issue = await LibraryIssue.findOne({
    _id: issueId,
    schoolId,
    status: { $in: ["ISSUED", "OVERDUE"] },
    returnDate: null,
  });
  if (!issue) throw new AppError("Active issue record not found", 404);

  const book = await getBookOrThrow(schoolId, issue.bookId);
  const { settings } = await getSchoolSettings(schoolId);
  const returnDate = payload.returnDate ? endOfDay(payload.returnDate) : endOfDay(new Date());
  const overdueDays = issue.dueDate ? diffDays(issue.dueDate, returnDate) : 0;
  const fineAmount = overdueDays > 0 ? overdueDays * Number(settings.finePerDay || 0) : 0;

  issue.returnDate = returnDate;
  issue.returnedToUserId = actingUserId;
  issue.returnNote = String(payload.returnNote || "").trim();
  issue.fine = fineAmount;
  issue.fineStatus = fineAmount > 0 ? "PENDING" : "NONE";
  issue.status = "RETURNED";
  await issue.save();

  book.availableCopies = Math.min(Number(book.quantity || 0), Number(book.availableCopies || 0) + 1);
  await applyBookInventoryState(book);

  let fineRecord = null;
  if (fineAmount > 0) {
    fineRecord = await LibraryFineRecord.findOneAndUpdate(
      { schoolId, issueId: issue._id },
      {
        schoolId,
        issueId: issue._id,
        studentId: issue.studentId,
        bookId: issue.bookId,
        amount: fineAmount,
        daysOverdue: overdueDays,
        reason: "Overdue return",
        status: "PENDING",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const student = await Student.findById(issue.studentId).populate("userId", "_id name");
  await createUserNotification({
    schoolId,
    userId: student?.userId?._id,
    title: fineAmount > 0 ? "Book returned with fine" : "Book return confirmed",
    message:
      fineAmount > 0
        ? `${issue.bookSnapshot.title} return is complete. Overdue fine: Rs ${fineAmount}.`
        : `${issue.bookSnapshot.title} return has been recorded successfully.`,
    type: fineAmount > 0 ? "LIBRARY_FINE_GENERATED" : "LIBRARY_BOOK_RETURNED",
  });

  return { issue: enrichIssue(issue), fineRecord };
};

const listFines = async (schoolId, query = {}) => {
  const { page, limit, skip } = parsePaging(query);
  const filter = { schoolId };
  if (query.status) filter.status = query.status;
  if (query.studentId && mongoose.Types.ObjectId.isValid(String(query.studentId))) filter.studentId = String(query.studentId);
  const [rows, total] = await Promise.all([
    LibraryFineRecord.find(filter)
      .populate("bookId", "title bookCode")
      .populate({ path: "studentId", populate: [{ path: "userId", select: "name email" }, { path: "classId", select: "name section" }] })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    LibraryFineRecord.countDocuments(filter),
  ]);
  return {
    data: rows.map((row) => row.toObject()),
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  };
};

const payFine = async (schoolId, actingUserId, fineId, payload = {}) => {
  const fine = await LibraryFineRecord.findOne({ _id: fineId, schoolId });
  if (!fine) throw new AppError("Fine record not found", 404);
  fine.status = "PAID";
  fine.paidAt = new Date();
  fine.paidByUserId = actingUserId;
  fine.notes = payload.notes !== undefined ? String(payload.notes || "").trim() : fine.notes;
  await fine.save();
  await LibraryIssue.findByIdAndUpdate(fine.issueId, { fineStatus: "PAID" });
  return fine;
};

const waiveFine = async (schoolId, actingUserId, fineId, payload = {}) => {
  const fine = await LibraryFineRecord.findOne({ _id: fineId, schoolId });
  if (!fine) throw new AppError("Fine record not found", 404);
  fine.status = "WAIVED";
  fine.waivedAt = new Date();
  fine.paidByUserId = actingUserId;
  fine.notes = payload.notes !== undefined ? String(payload.notes || "").trim() : fine.notes;
  await fine.save();
  await LibraryIssue.findByIdAndUpdate(fine.issueId, { fineStatus: "WAIVED" });
  return fine;
};

const getDashboard = async (schoolId) => {
  await markOverdueIssues(schoolId);
  const schoolObjectId = ensureObjectId(schoolId, "schoolId");
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [books, categories, issues, overdueBooks, pendingRequests, fineAgg, monthlyIssues, mostBorrowed, categoryDistribution, topBorrowers] =
    await Promise.all([
      LibraryBook.countDocuments({ schoolId }),
      LibraryCategory.countDocuments({ schoolId }),
      LibraryIssue.countDocuments({ schoolId, status: { $in: ["ISSUED", "OVERDUE"] }, returnDate: null }),
      LibraryIssue.countDocuments({ schoolId, status: "OVERDUE", returnDate: null }),
      LibraryIssue.countDocuments({ schoolId, status: "REQUESTED" }),
      LibraryFineRecord.aggregate([
        { $match: { schoolId: schoolObjectId, status: "PAID" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      LibraryIssue.aggregate([
        { $match: { schoolId: schoolObjectId, createdAt: { $gte: sixMonthsAgo }, status: { $in: ["ISSUED", "OVERDUE", "RETURNED"] } } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      LibraryIssue.aggregate([
        { $match: { schoolId: schoolObjectId, status: { $in: ["ISSUED", "OVERDUE", "RETURNED"] } } },
        { $group: { _id: "$bookId", borrowCount: { $sum: 1 }, title: { $first: "$bookSnapshot.title" }, bookCode: { $first: "$bookSnapshot.bookCode" } } },
        { $sort: { borrowCount: -1 } },
        { $limit: 5 },
      ]),
      LibraryBook.aggregate([
        { $match: { schoolId: schoolObjectId } },
        {
          $group: {
            _id: "$categoryId",
            booksCount: { $sum: 1 },
            copies: { $sum: "$quantity" },
          },
        },
        {
          $lookup: {
            from: "librarycategories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
      ]),
      LibraryIssue.aggregate([
        { $match: { schoolId: schoolObjectId, status: { $in: ["ISSUED", "OVERDUE", "RETURNED"] } } },
        { $group: { _id: "$studentId", borrowCount: { $sum: 1 }, name: { $first: "$studentSnapshot.name" }, className: { $first: "$studentSnapshot.className" } } },
        { $sort: { borrowCount: -1 } },
        { $limit: 5 },
      ]),
    ]);

  const availableBooksAgg = await LibraryBook.aggregate([
    { $match: { schoolId: schoolObjectId } },
    { $group: { _id: null, available: { $sum: "$availableCopies" }, quantity: { $sum: "$quantity" } } },
  ]);

  return {
    stats: {
      totalBooks: books,
      totalCategories: categories,
      issuedBooks: issues,
      overdueBooks,
      pendingRequests,
      fineCollected: fineAgg[0]?.total || 0,
      availableBooks: availableBooksAgg[0]?.available || 0,
      inventoryCopies: availableBooksAgg[0]?.quantity || 0,
    },
    charts: {
      monthlyIssuedBooks: monthlyIssues.map((item) => ({
        month: `${String(item._id.month).padStart(2, "0")}/${item._id.year}`,
        count: item.count,
      })),
      mostBorrowedBooks: mostBorrowed.map((item) => ({
        _id: item._id,
        title: item.title || "Untitled",
        bookCode: item.bookCode || "",
        borrowCount: item.borrowCount,
      })),
      categoryDistribution: categoryDistribution.map((item) => ({
        categoryId: item._id,
        name: item.category?.[0]?.name || "Uncategorised",
        booksCount: item.booksCount,
        copies: item.copies,
      })),
      studentBorrowingAnalytics: topBorrowers.map((item) => ({
        studentId: item._id,
        name: item.name || "Student",
        className: item.className || "",
        borrowCount: item.borrowCount,
      })),
    },
  };
};

const getReports = async (schoolId) => {
  const [dashboard, issues, fines, books] = await Promise.all([
    getDashboard(schoolId),
    listIssues(schoolId, { page: 1, limit: 100, status: "" }),
    listFines(schoolId, { page: 1, limit: 100 }),
    listBooks(schoolId, { page: 1, limit: 200 }),
  ]);
  return {
    overview: dashboard.stats,
    charts: dashboard.charts,
    overdueReport: issues.data.filter((item) => item.computedStatus === "OVERDUE"),
    fineReport: fines.data,
    inventoryReport: books.data,
  };
};

const getLibrarySettings = async (schoolId) => {
  const { settings } = await getSchoolSettings(schoolId);
  return settings;
};

const updateLibrarySettings = async (schoolId, payload = {}) => {
  const school = await School.findById(schoolId);
  if (!school) throw new AppError("School not found", 404);
  const current = { ...DEFAULT_LIBRARY_SETTINGS, ...(school.librarySettings?.toObject?.() || school.librarySettings || {}) };
  const next = {
    maxBooksPerStudent: Number(payload.maxBooksPerStudent ?? current.maxBooksPerStudent),
    defaultIssueDays: Number(payload.defaultIssueDays ?? current.defaultIssueDays),
    finePerDay: Number(payload.finePerDay ?? current.finePerDay),
    maxIssueDays: Number(payload.maxIssueDays ?? current.maxIssueDays),
    requestRequiresApproval: payload.requestRequiresApproval ?? current.requestRequiresApproval,
    allowStudentRequests: payload.allowStudentRequests ?? current.allowStudentRequests,
    allowEbooks: payload.allowEbooks ?? current.allowEbooks,
    issueReminderDaysBefore: Number(payload.issueReminderDaysBefore ?? current.issueReminderDaysBefore),
  };
  school.librarySettings = next;
  school.features = { ...(school.features?.toObject?.() || school.features || {}), libraryModule: true };
  await school.save();
  return next;
};

const getStudentLibraryOverview = async (schoolId, userId, query = {}) => {
  await markOverdueIssues(schoolId);
  const student = await getStudentByUser({ schoolId, userId });
  const [books, categories, issues, fines, settings] = await Promise.all([
    listBooks(schoolId, { ...query, page: query.page || 1, limit: query.limit || 100 }),
    listCategories(schoolId),
    LibraryIssue.find({ schoolId, studentId: student._id }).populate("bookId").sort({ createdAt: -1 }),
    LibraryFineRecord.find({ schoolId, studentId: student._id }).populate("bookId", "title bookCode").sort({ createdAt: -1 }),
    getLibrarySettings(schoolId),
  ]);

  const activeIssues = issues.filter((item) => ["ISSUED", "OVERDUE"].includes(item.status) && !item.returnDate);
  const requests = issues.filter((item) => item.status === "REQUESTED");
  return {
    catalog: books.data,
    categories,
    settings,
    issuedBooks: activeIssues.map(enrichIssue),
    requests: requests.map(enrichIssue),
    history: issues.map(enrichIssue),
    fines: fines.map((item) => item.toObject()),
    totalFine: fines.filter((item) => item.status !== "WAIVED").reduce((sum, item) => sum + Number(item.amount || 0), 0),
    dueSoon: activeIssues.filter((item) => item.dueDate && diffDays(new Date(), item.dueDate) <= Number(settings.issueReminderDaysBefore || 2)),
  };
};

export const libraryService = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listBooks,
  createBook,
  updateBook,
  deleteBook,
  getStudentDirectory,
  listIssues,
  issueBookToStudent,
  createStudentRequest,
  approveRequest,
  rejectRequest,
  returnBook,
  listFines,
  payFine,
  waiveFine,
  getDashboard,
  getReports,
  getLibrarySettings,
  updateLibrarySettings,
  getStudentLibraryOverview,
};
