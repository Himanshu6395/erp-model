import { libraryService } from "./service.js";

const getDashboard = async (req, res) => {
  const data = await libraryService.getDashboard(req.user.schoolId);
  return res.json({ success: true, data });
};

const listCategories = async (req, res) => {
  const data = await libraryService.listCategories(req.user.schoolId);
  return res.json({ success: true, data });
};

const createCategory = async (req, res) => {
  const data = await libraryService.createCategory(req.user.schoolId, req.body);
  return res.status(201).json({ success: true, data });
};

const updateCategory = async (req, res) => {
  const data = await libraryService.updateCategory(req.user.schoolId, req.params.categoryId, req.body);
  return res.json({ success: true, data });
};

const deleteCategory = async (req, res) => {
  const data = await libraryService.deleteCategory(req.user.schoolId, req.params.categoryId);
  return res.json({ success: true, data });
};

const listBooks = async (req, res) => {
  const data = await libraryService.listBooks(req.user.schoolId, req.query);
  return res.json({ success: true, data });
};

const createBook = async (req, res) => {
  const data = await libraryService.createBook(req.user.schoolId, req.body);
  return res.status(201).json({ success: true, data });
};

const updateBook = async (req, res) => {
  const data = await libraryService.updateBook(req.user.schoolId, req.params.bookId, req.body);
  return res.json({ success: true, data });
};

const deleteBook = async (req, res) => {
  const data = await libraryService.deleteBook(req.user.schoolId, req.params.bookId);
  return res.json({ success: true, data });
};

const getStudents = async (req, res) => {
  const data = await libraryService.getStudentDirectory(req.user.schoolId, req.query);
  return res.json({ success: true, data });
};

const listIssues = async (req, res) => {
  const data = await libraryService.listIssues(req.user.schoolId, req.query);
  return res.json({ success: true, data });
};

const issueBook = async (req, res) => {
  const data = await libraryService.issueBookToStudent({
    schoolId: req.user.schoolId,
    actingUserId: req.user.userId,
    payload: req.body,
  });
  return res.status(201).json({ success: true, data });
};

const approveRequest = async (req, res) => {
  const data = await libraryService.approveRequest(req.user.schoolId, req.user.userId, req.params.issueId, req.body);
  return res.json({ success: true, data });
};

const rejectRequest = async (req, res) => {
  const data = await libraryService.rejectRequest(req.user.schoolId, req.user.userId, req.params.issueId, req.body);
  return res.json({ success: true, data });
};

const returnBook = async (req, res) => {
  const data = await libraryService.returnBook(req.user.schoolId, req.user.userId, req.params.issueId, req.body);
  return res.json({ success: true, data });
};

const listFines = async (req, res) => {
  const data = await libraryService.listFines(req.user.schoolId, req.query);
  return res.json({ success: true, data });
};

const payFine = async (req, res) => {
  const data = await libraryService.payFine(req.user.schoolId, req.user.userId, req.params.fineId, req.body);
  return res.json({ success: true, data });
};

const waiveFine = async (req, res) => {
  const data = await libraryService.waiveFine(req.user.schoolId, req.user.userId, req.params.fineId, req.body);
  return res.json({ success: true, data });
};

const getReports = async (req, res) => {
  const data = await libraryService.getReports(req.user.schoolId);
  return res.json({ success: true, data });
};

const getSettings = async (req, res) => {
  const data = await libraryService.getLibrarySettings(req.user.schoolId);
  return res.json({ success: true, data });
};

const updateSettings = async (req, res) => {
  const data = await libraryService.updateLibrarySettings(req.user.schoolId, req.body);
  return res.json({ success: true, data });
};

const getStudentLibrary = async (req, res) => {
  const data = await libraryService.getStudentLibraryOverview(req.user.schoolId, req.user.userId, req.query);
  return res.json({ success: true, data });
};

const requestBook = async (req, res) => {
  const data = await libraryService.createStudentRequest({
    schoolId: req.user.schoolId,
    userId: req.user.userId,
    payload: req.body,
  });
  return res.status(201).json({ success: true, data });
};

export const libraryController = {
  getDashboard,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listBooks,
  createBook,
  updateBook,
  deleteBook,
  getStudents,
  listIssues,
  issueBook,
  approveRequest,
  rejectRequest,
  returnBook,
  listFines,
  payFine,
  waiveFine,
  getReports,
  getSettings,
  updateSettings,
  getStudentLibrary,
  requestBook,
};
