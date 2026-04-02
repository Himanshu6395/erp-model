import { schoolService } from "./service.js";

const createSchool = async (req, res) => {
  const data = await schoolService.createSchool(req.body);
  return res.status(201).json({ success: true, data });
};

const getAllSchools = async (req, res) => {
  const data = await schoolService.getAllSchools(req.query);
  return res.json({ success: true, data });
};

const getSchoolById = async (req, res) => {
  const data = await schoolService.getSchoolById(req.params.schoolId);
  return res.json({ success: true, data });
};

const updateSchoolById = async (req, res) => {
  const data = await schoolService.updateSchoolById(req.params.schoolId, req.body);
  return res.json({ success: true, data });
};

const deleteSchoolById = async (req, res) => {
  const data = await schoolService.deleteSchoolById(req.params.schoolId);
  return res.json({ success: true, data });
};

const createSchoolAdmin = async (req, res) => {
  const data = await schoolService.createSchoolAdminBySuperAdmin(req.body);
  return res.status(201).json({ success: true, data });
};

const createStudent = async (req, res) => {
  const data = await schoolService.createStudent(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const createTeacher = async (req, res) => {
  const data = await schoolService.createTeacher(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const createClass = async (req, res) => {
  const data = await schoolService.createClass(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

const createNotice = async (req, res) => {
  const data = await schoolService.createNotice(req.user, req.body);
  return res.status(201).json({ success: true, data });
};

export const schoolController = {
  createSchool,
  getAllSchools,
  getSchoolById,
  updateSchoolById,
  deleteSchoolById,
  createSchoolAdmin,
  createStudent,
  createTeacher,
  createClass,
  createNotice,
};
