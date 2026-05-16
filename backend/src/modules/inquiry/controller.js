import { inquiryService } from "./service.js";

const create = async (req, res) => {
  const data = await inquiryService.createInquiry(req.user, req.body);
  res.status(201).json({ success: true, data });
};

const list = async (req, res) => {
  const data = await inquiryService.listInquiries(req.user, req.query);
  res.json({ success: true, data });
};

const exportCsv = async (req, res) => {
  const csv = await inquiryService.exportCsv(req.user, req.query);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=inquiries-export.csv");
  res.send(csv);
};

const analytics = async (req, res) => {
  const data = await inquiryService.analytics(req.user);
  res.json({ success: true, data });
};

const badge = async (req, res) => {
  const data = await inquiryService.analytics(req.user);
  res.json({
    success: true,
    data: { pendingFollowUps: data.pendingFollowUps },
  });
};

const getOne = async (req, res) => {
  const data = await inquiryService.getOne(req.user, req.params.id);
  res.json({ success: true, data });
};

const update = async (req, res) => {
  const data = await inquiryService.updateInquiry(req.user, req.params.id, req.body);
  res.json({ success: true, data });
};

const remove = async (req, res) => {
  await inquiryService.deleteInquiry(req.user, req.params.id);
  res.json({ success: true, message: "Deleted" });
};

const patchStatus = async (req, res) => {
  const data = await inquiryService.patchStatus(req.user, req.params.id, req.body, false);
  res.json({ success: true, data });
};

const assignTeacher = async (req, res) => {
  const data = await inquiryService.assignTeacher(req.user, req.params.id, req.body);
  res.json({ success: true, data });
};

const convert = async (req, res) => {
  const data = await inquiryService.convertToAdmission(req.user, req.params.id, req.body);
  res.json({ success: true, data });
};

const followUp = async (req, res) => {
  const data = await inquiryService.addFollowUp(req.user, req.params.id, req.body, false);
  res.json({ success: true, data });
};

const comment = async (req, res) => {
  const data = await inquiryService.addComment(req.user, req.params.id, req.body.text || req.body.comment, false);
  res.json({ success: true, data });
};

export const inquiryAdminController = {
  create,
  list,
  exportCsv,
  analytics,
  badge,
  getOne,
  update,
  remove,
  patchStatus,
  assignTeacher,
  convert,
  followUp,
  comment,
};

const teacherList = async (req, res) => {
  const data = await inquiryService.teacherList(req.user, req.query);
  res.json({ success: true, data });
};

const teacherGetOne = async (req, res) => {
  const data = await inquiryService.teacherGetOne(req.user, req.params.id);
  res.json({ success: true, data });
};

const teacherPatchStatus = async (req, res) => {
  const data = await inquiryService.patchStatus(req.user, req.params.id, req.body, true);
  res.json({ success: true, data });
};

const teacherFollowUp = async (req, res) => {
  const data = await inquiryService.addFollowUp(req.user, req.params.id, req.body, true);
  res.json({ success: true, data });
};

const teacherComment = async (req, res) => {
  const data = await inquiryService.addComment(req.user, req.params.id, req.body.text || req.body.comment, true);
  res.json({ success: true, data });
};

export const inquiryTeacherController = {
  teacherList,
  teacherGetOne,
  teacherPatchStatus,
  teacherFollowUp,
  teacherComment,
};
