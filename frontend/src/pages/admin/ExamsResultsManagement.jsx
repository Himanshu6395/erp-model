import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Award,
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  Lock,
  Save,
  ShieldCheck,
} from "lucide-react";
import { adminService } from "../../services/adminService";

const EXAM_TYPES = ["THEORY", "PRACTICAL", "COMBINED"];
const EXAM_STATUS = ["DRAFT", "UPCOMING", "ONGOING", "COMPLETED", "PUBLISHED"];
const SUBJECT_EXAM_TYPES = ["WRITTEN", "ORAL", "PRACTICAL"];
const RE_EVALUATION = ["NOT_REQUESTED", "REQUESTED", "APPROVED", "REJECTED"];

const emptyExamForm = {
  name: "",
  academicYear: "2025-2026",
  term: "Term 1",
  classId: "",
  section: "",
  sectionId: "",
  startDate: "",
  endDate: "",
  description: "",
  examType: "COMBINED",
  status: "UPCOMING",
  resultPublishDate: "",
  graceMarksEnabled: false,
  graceMarksLimit: 0,
  attendanceMinPct: 0,
  resultPublished: false,
  resultLocked: false,
  meritListEnabled: true,
  smsNotificationEnabled: false,
  emailNotificationEnabled: false,
};

const emptySubjectForm = {
  id: "",
  subjectId: "",
  subjectCode: "",
  maxMarks: 100,
  passingMarks: 40,
  examType: "WRITTEN",
  weightage: 100,
  isInternal: false,
  theory: 100,
  practical: 0,
  internal: 0,
};

const emptyScheduleForm = {
  id: "",
  subjectId: "",
  examDate: "",
  startTime: "09:00",
  endTime: "12:00",
  duration: 180,
  roomNumber: "",
  invigilatorId: "",
};

const emptyResultForm = {
  studentId: "",
  subjectId: "",
  marksObtained: "",
  internalMarks: "",
  practicalMarks: "",
  vivaMarks: "",
  graceMarks: "",
  attendancePercentage: "",
  teacherRemarks: "",
  principalRemarks: "",
  strengths: "",
  improvements: "",
  supplementaryFlag: false,
  reEvaluationStatus: "NOT_REQUESTED",
};

function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function ExamsResultsManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingExamId = location.state?.examId || null;

  const [loading, setLoading] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [examData, setExamData] = useState(null);
  const [examForm, setExamForm] = useState(emptyExamForm);
  const [subjectForm, setSubjectForm] = useState(emptySubjectForm);
  const [scheduleForm, setScheduleForm] = useState(emptyScheduleForm);
  const [resultForm, setResultForm] = useState(emptyResultForm);
  const [resultsData, setResultsData] = useState({ rows: [], students: [] });
  const [reportCards, setReportCards] = useState([]);
  const [meritList, setMeritList] = useState([]);

  const loadPage = useCallback(async () => {
    setBootstrapLoading(true);
    try {
      const [classData, subjectData, teacherData, studentData] = await Promise.all([
        adminService.getClasses(),
        adminService.getSubjects(),
        adminService.getTeachers({ page: 1, limit: 200 }),
        adminService.getStudents({ page: 1, limit: 500 }),
      ]);
      setClasses(Array.isArray(classData) ? classData : []);
      setSubjects(Array.isArray(subjectData) ? subjectData : []);
      setTeachers(teacherData.items || []);
      setStudents(studentData.items || []);

      if (editingExamId) {
        const [detail, merit, resultPayload, cards] = await Promise.all([
          adminService.getExamSession(editingExamId),
          adminService.getExamMeritList(editingExamId).catch(() => []),
          adminService.listExamResults(editingExamId).catch(() => ({ rows: [], students: [] })),
          adminService.listReportCards(editingExamId).catch(() => []),
        ]);
        setExamData(detail);
        setResultsData(resultPayload || { rows: [], students: [] });
        setReportCards(Array.isArray(cards) ? cards : []);
        setMeritList(Array.isArray(merit) ? merit : []);
        setExamForm({
          name: detail.exam?.name || "",
          academicYear: detail.exam?.academicYear || "2025-2026",
          term: detail.exam?.term || "Term 1",
          classId: detail.exam?.classId?._id || detail.exam?.classId || "",
          section: detail.exam?.section || "",
          sectionId: detail.exam?.sectionId || "",
          startDate: detail.exam?.startDate ? detail.exam.startDate.slice(0, 10) : "",
          endDate: detail.exam?.endDate ? detail.exam.endDate.slice(0, 10) : "",
          description: detail.exam?.description || "",
          examType: detail.exam?.examType || "COMBINED",
          status: detail.exam?.status || "UPCOMING",
          resultPublishDate: detail.exam?.resultPublishDate ? detail.exam.resultPublishDate.slice(0, 10) : "",
          graceMarksEnabled: Boolean(detail.exam?.settings?.graceMarksEnabled),
          graceMarksLimit: detail.exam?.settings?.graceMarksLimit || 0,
          attendanceMinPct: detail.exam?.settings?.attendanceMinPct || 0,
          resultPublished: Boolean(detail.exam?.settings?.resultPublished),
          resultLocked: Boolean(detail.exam?.settings?.resultLocked),
          meritListEnabled: detail.exam?.settings?.meritListEnabled !== false,
          smsNotificationEnabled: Boolean(detail.exam?.settings?.smsNotificationEnabled),
          emailNotificationEnabled: Boolean(detail.exam?.settings?.emailNotificationEnabled),
        });
      } else {
        setExamData(null);
        setResultsData({ rows: [], students: [] });
        setReportCards([]);
        setMeritList([]);
        setExamForm(emptyExamForm);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBootstrapLoading(false);
    }
  }, [editingExamId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const refreshExamData = useCallback(async () => {
    if (!editingExamId) return;
    loadPage();
  }, [editingExamId, loadPage]);

  const filteredSubjects = useMemo(
    () => subjects.filter((item) => !examForm.classId || String(item.classId?._id || item.classId) === String(examForm.classId)),
    [subjects, examForm.classId]
  );

  const completion = useMemo(() => {
    const checks = [
      Boolean(examForm.name.trim()),
      Boolean(examForm.classId),
      Boolean(examForm.startDate),
      Boolean(examForm.endDate),
      Boolean(examForm.examType),
      Boolean(examForm.status),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [examForm]);

  const onExamChange = (event) => {
    const { name, value, type, checked } = event.target;
    setExamForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const availableStudents = useMemo(
    () =>
      students.filter((student) => {
        const sameClass = !examForm.classId || String(student.classId?._id || student.classId) === String(examForm.classId);
        const sameSection = !examForm.section || String(student.section || "").trim() === String(examForm.section).trim();
        return sameClass && sameSection;
      }),
    [students, examForm.classId, examForm.section]
  );

  const configuredSubjects = Array.isArray(examData?.subjects) ? examData.subjects : [];
  const schedules = Array.isArray(examData?.schedules) ? examData.schedules : [];
  const results = Array.isArray(resultsData?.rows) ? resultsData.rows : [];

  if (bootstrapLoading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)]">
        Loading exams and results workspace...
      </div>
    );
  }

  const selectedClass = classes.find((item) => item._id === examForm.classId);

  const saveExam = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: examForm.name,
        academicYear: examForm.academicYear,
        term: examForm.term,
        classId: examForm.classId,
        section: examForm.section,
        sectionId: examForm.sectionId,
        startDate: examForm.startDate,
        endDate: examForm.endDate,
        description: examForm.description,
        examType: examForm.examType,
        status: examForm.status,
        resultPublishDate: examForm.resultPublishDate || undefined,
        settings: {
          graceMarksEnabled: examForm.graceMarksEnabled,
          graceMarksLimit: Number(examForm.graceMarksLimit || 0),
          attendanceMinPct: Number(examForm.attendanceMinPct || 0),
          resultPublished: examForm.resultPublished,
          resultLocked: examForm.resultLocked,
          meritListEnabled: examForm.meritListEnabled,
          smsNotificationEnabled: examForm.smsNotificationEnabled,
          emailNotificationEnabled: examForm.emailNotificationEnabled,
        },
      };

      if (editingExamId) {
        await adminService.updateExamSession(editingExamId, payload);
        toast.success("Exam updated");
        refreshExamData();
      } else {
        const created = await adminService.createExamSession(payload);
        toast.success("Exam created");
        navigate("/admin/exams-results/create", { state: { examId: created._id } });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSubjectConfig = async () => {
    if (!editingExamId) return toast.error("Create the exam first.");
    try {
      const payload = {
        subjectId: subjectForm.subjectId,
        subjectCode: subjectForm.subjectCode,
        maxMarks: Number(subjectForm.maxMarks || 0),
        passingMarks: Number(subjectForm.passingMarks || 0),
        examType: subjectForm.examType,
        isInternal: subjectForm.isInternal,
        components: {
          theory: Number(subjectForm.theory || 0),
          practical: Number(subjectForm.practical || 0),
          internal: Number(subjectForm.internal || 0),
        },
        weightage: {
          theory: Number(subjectForm.weightage || 0),
          practical: 0,
          internal: 0,
        },
      };
      if (subjectForm.id) {
        await adminService.updateExamSubject(subjectForm.id, payload);
        toast.success("Subject configuration updated");
      } else {
        await adminService.addExamSubject(editingExamId, payload);
        toast.success("Subject configured");
      }
      setSubjectForm(emptySubjectForm);
      refreshExamData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const saveSchedule = async () => {
    if (!editingExamId) return toast.error("Create the exam first.");
    try {
      const payload = {
        subjectId: scheduleForm.subjectId,
        examDate: scheduleForm.examDate,
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        duration: Number(scheduleForm.duration || 0),
        roomNumber: scheduleForm.roomNumber,
        invigilatorId: scheduleForm.invigilatorId || undefined,
      };
      if (scheduleForm.id) {
        await adminService.updateExamSchedule(scheduleForm.id, payload);
        toast.success("Schedule updated");
      } else {
        await adminService.createExamSchedule(editingExamId, payload);
        toast.success("Schedule added");
      }
      setScheduleForm(emptyScheduleForm);
      refreshExamData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const saveResult = async () => {
    if (!editingExamId) return toast.error("Create the exam first.");
    try {
      await adminService.saveExamResults(editingExamId, {
        entries: [
          {
            studentId: resultForm.studentId,
            subjectId: resultForm.subjectId,
            marksObtained: Number(resultForm.marksObtained || 0),
            internalMarks: Number(resultForm.internalMarks || 0),
            practicalMarks: Number(resultForm.practicalMarks || 0),
            vivaMarks: Number(resultForm.vivaMarks || 0),
            graceMarks: Number(resultForm.graceMarks || 0),
            attendancePercentage: Number(resultForm.attendancePercentage || 0),
            teacherRemarks: resultForm.teacherRemarks,
            principalRemarks: resultForm.principalRemarks,
            strengths: resultForm.strengths,
            improvements: resultForm.improvements,
            supplementaryFlag: resultForm.supplementaryFlag,
            reEvaluationStatus: resultForm.reEvaluationStatus,
          },
        ],
        publishNow: examForm.resultPublished,
      });
      toast.success("Result saved");
      setResultForm(emptyResultForm);
      refreshExamData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const togglePublish = async (resultPublished, resultLocked = examForm.resultLocked) => {
    if (!editingExamId) return;
    try {
      await adminService.publishExamResults(editingExamId, { resultPublished, resultLocked });
      toast.success(resultPublished ? "Results published" : "Results unpublished");
      setExamForm((current) => ({ ...current, resultPublished, resultLocked }));
      refreshExamData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const generateCards = async () => {
    if (!editingExamId) return;
    try {
      await adminService.generateReportCards(editingExamId, { signature: "School Admin" });
      toast.success("Report cards generated");
      refreshExamData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteSubjectConfig = async (id) => {
    try {
      await adminService.deleteExamSubject(id);
      toast.success("Subject configuration deleted");
      refreshExamData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteSchedule = async (id) => {
    try {
      await adminService.deleteExamSchedule(id);
      toast.success("Schedule deleted");
      refreshExamData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteResult = async (id) => {
    try {
      await adminService.deleteExamResult(id);
      toast.success("Result deleted");
      refreshExamData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-brand-950 to-sky-700 px-6 py-6 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-sky-100">Assessment center</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {editingExamId ? "Manage exam and results" : "Create exam and results setup"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
                Configure the full assessment workflow from exam session details to subject mapping, schedules, marks, merit lists, and report cards.
              </p>
            </div>
            <div className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm lg:min-w-[240px] lg:w-auto">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-sky-100">
                <span>Form completion</span>
                <span>{completion}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-cyan-300 transition-all" style={{ width: `${completion}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-200">Set the exam basics first, then unlock subjects, schedule, and results tools.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Configured subjects</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{configuredSubjects.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Scheduled papers</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{schedules.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Result rows</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{results.length}</p>
          </div>
          <div className="rounded-3xl border border-sky-200 bg-sky-50 p-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-sky-700">Report cards</p>
            <p className="mt-3 text-3xl font-bold text-sky-900">{reportCards.length}</p>
          </div>
        </div>
      </section>

      <form onSubmit={saveExam} className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <section className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <FileSpreadsheet className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Exam session</h2>
                <p className="text-sm text-slate-500">Define the core exam settings, class scope, dates, and publish controls.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Exam name" required><input className="input" name="name" value={examForm.name} onChange={onExamChange} required /></Field>
              <Field label="Academic year" required><input className="input" name="academicYear" value={examForm.academicYear} onChange={onExamChange} required /></Field>
              <Field label="Term"><input className="input" name="term" value={examForm.term} onChange={onExamChange} /></Field>
              <Field label="Class" required>
                <select className="input" name="classId" value={examForm.classId} onChange={onExamChange} required>
                  <option value="">Select class</option>
                  {classes.map((item) => <option key={item._id} value={item._id}>{item.name}-{item.section}</option>)}
                </select>
              </Field>
              <Field label="Section"><input className="input" name="section" value={examForm.section} onChange={onExamChange} /></Field>
              <Field label="Section ID"><input className="input" name="sectionId" value={examForm.sectionId} onChange={onExamChange} /></Field>
              <Field label="Start date" required><input className="input" type="date" name="startDate" value={examForm.startDate} onChange={onExamChange} required /></Field>
              <Field label="End date" required><input className="input" type="date" name="endDate" value={examForm.endDate} onChange={onExamChange} required /></Field>
              <Field label="Result publish date"><input className="input" type="date" name="resultPublishDate" value={examForm.resultPublishDate} onChange={onExamChange} /></Field>
              <Field label="Exam type">
                <select className="input" name="examType" value={examForm.examType} onChange={onExamChange}>
                  {EXAM_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select className="input" name="status" value={examForm.status} onChange={onExamChange}>
                  {EXAM_STATUS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Attendance minimum %"><input className="input" type="number" name="attendanceMinPct" value={examForm.attendanceMinPct} onChange={onExamChange} min={0} max={100} /></Field>
              <Field label="Grace marks limit"><input className="input" type="number" name="graceMarksLimit" value={examForm.graceMarksLimit} onChange={onExamChange} min={0} /></Field>
              <div className="sm:col-span-2"><Field label="Description"><textarea className="input min-h-28" name="description" value={examForm.description} onChange={onExamChange} /></Field></div>
              <div className="sm:col-span-2 grid gap-3 sm:grid-cols-2">
                {[
                  ["graceMarksEnabled", "Grace marks"],
                  ["resultPublished", "Result published"],
                  ["resultLocked", "Result locked"],
                  ["meritListEnabled", "Merit list enabled"],
                  ["smsNotificationEnabled", "SMS notification"],
                  ["emailNotificationEnabled", "Email notification"],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    <input type="checkbox" name={key} checked={Boolean(examForm[key])} onChange={onExamChange} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-between">
              <button type="button" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto" onClick={() => navigate("/admin/exams-results/registered")}><ClipboardList className="h-4 w-4" />View all exams</button>
              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"><Save className="h-4 w-4" />{loading ? "Saving..." : editingExamId ? "Update exam" : "Create exam"}</button>
            </div>
          </section>

          {editingExamId ? (
            <>
              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
                <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white"><BookOpen className="h-5 w-5" /></span><div><h2 className="text-lg font-bold text-slate-950">Subject configuration</h2><p className="text-sm text-slate-500">Set max marks, passing marks, type, weightage, and internal flags per subject.</p></div></div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Subject" required><select className="input" value={subjectForm.subjectId} onChange={(event) => setSubjectForm((current) => ({ ...current, subjectId: event.target.value }))}><option value="">Select subject</option>{filteredSubjects.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></Field>
                  <Field label="Subject code"><input className="input" value={subjectForm.subjectCode} onChange={(event) => setSubjectForm((current) => ({ ...current, subjectCode: event.target.value }))} /></Field>
                  <Field label="Max marks" required><input className="input" type="number" value={subjectForm.maxMarks} onChange={(event) => setSubjectForm((current) => ({ ...current, maxMarks: event.target.value }))} /></Field>
                  <Field label="Passing marks" required><input className="input" type="number" value={subjectForm.passingMarks} onChange={(event) => setSubjectForm((current) => ({ ...current, passingMarks: event.target.value }))} /></Field>
                  <Field label="Subject exam type"><select className="input" value={subjectForm.examType} onChange={(event) => setSubjectForm((current) => ({ ...current, examType: event.target.value }))}>{SUBJECT_EXAM_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
                  <Field label="Weightage"><input className="input" type="number" value={subjectForm.weightage} onChange={(event) => setSubjectForm((current) => ({ ...current, weightage: event.target.value }))} /></Field>
                  <Field label="Theory max"><input className="input" type="number" value={subjectForm.theory} onChange={(event) => setSubjectForm((current) => ({ ...current, theory: event.target.value }))} /></Field>
                  <Field label="Practical max"><input className="input" type="number" value={subjectForm.practical} onChange={(event) => setSubjectForm((current) => ({ ...current, practical: event.target.value }))} /></Field>
                  <Field label="Internal max"><input className="input" type="number" value={subjectForm.internal} onChange={(event) => setSubjectForm((current) => ({ ...current, internal: event.target.value }))} /></Field>
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={subjectForm.isInternal} onChange={(event) => setSubjectForm((current) => ({ ...current, isInternal: event.target.checked }))} />Internal subject</label>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700" onClick={saveSubjectConfig}><Save className="h-4 w-4" />{subjectForm.id ? "Update subject config" : "Add subject config"}</button>
                  {subjectForm.id ? <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" onClick={() => setSubjectForm(emptySubjectForm)}>Reset</button> : null}
                </div>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
                <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white"><CalendarClock className="h-5 w-5" /></span><div><h2 className="text-lg font-bold text-slate-950">Exam schedule</h2><p className="text-sm text-slate-500">Create the paper-wise timetable with room and invigilator details.</p></div></div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Subject" required><select className="input" value={scheduleForm.subjectId} onChange={(event) => setScheduleForm((current) => ({ ...current, subjectId: event.target.value }))}><option value="">Select subject</option>{configuredSubjects.map((item) => <option key={item._id} value={item.subjectId?._id || item.subjectId}>{item.subjectName}</option>)}</select></Field>
                  <Field label="Exam date" required><input className="input" type="date" value={scheduleForm.examDate} onChange={(event) => setScheduleForm((current) => ({ ...current, examDate: event.target.value }))} /></Field>
                  <Field label="Start time" required><input className="input" type="time" value={scheduleForm.startTime} onChange={(event) => setScheduleForm((current) => ({ ...current, startTime: event.target.value }))} /></Field>
                  <Field label="End time" required><input className="input" type="time" value={scheduleForm.endTime} onChange={(event) => setScheduleForm((current) => ({ ...current, endTime: event.target.value }))} /></Field>
                  <Field label="Duration (minutes)"><input className="input" type="number" value={scheduleForm.duration} onChange={(event) => setScheduleForm((current) => ({ ...current, duration: event.target.value }))} /></Field>
                  <Field label="Room number"><input className="input" value={scheduleForm.roomNumber} onChange={(event) => setScheduleForm((current) => ({ ...current, roomNumber: event.target.value }))} /></Field>
                  <Field label="Invigilator"><select className="input" value={scheduleForm.invigilatorId} onChange={(event) => setScheduleForm((current) => ({ ...current, invigilatorId: event.target.value }))}><option value="">Assign invigilator</option>{teachers.map((item) => <option key={item._id} value={item._id}>{item.userId?.name}</option>)}</select></Field>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700" onClick={saveSchedule}><Save className="h-4 w-4" />{scheduleForm.id ? "Update schedule" : "Add schedule"}</button>
                  {scheduleForm.id ? <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" onClick={() => setScheduleForm(emptyScheduleForm)}>Reset</button> : null}
                </div>
              </section>
            </>
          ) : null}
        </section>

        <section className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200 bg-slate-50/70 p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="text-lg font-bold text-slate-950">Preview</h2><p className="text-sm text-slate-500">Quick operational summary of the current assessment workflow.</p></div></div>
            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-500">Exam identity</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-950">{examForm.name || "Exam name pending"}</h3>
              <p className="mt-1 text-sm text-slate-600">{selectedClass ? selectedClass.name : "Class pending"} {examForm.section ? `• Section ${examForm.section}` : ""}</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{examForm.resultPublished ? "Results published" : "Results not published"} • {examForm.resultLocked ? "Locked" : "Editable"}</div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{configuredSubjects.length} subjects • {schedules.length} schedules • {results.length} result rows</div>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800"><CheckCircle2 className="h-4 w-4" />Exams and results now follow the same structured admin-panel workflow as the other upgraded modules.</div>
          </section>

          {editingExamId ? (
            <>
              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
                <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white"><BarChart3 className="h-5 w-5" /></span><div><h2 className="text-lg font-bold text-slate-950">Results entry</h2><p className="text-sm text-slate-500">Add marks, remarks, supplementary flags, and publish/lock controls.</p></div></div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Student" required><select className="input" value={resultForm.studentId} onChange={(event) => setResultForm((current) => ({ ...current, studentId: event.target.value }))}><option value="">Select student</option>{availableStudents.map((item) => <option key={item._id} value={item._id}>{item.userId?.name} {item.rollNumber ? `(${item.rollNumber})` : ""}</option>)}</select></Field>
                  <Field label="Subject" required><select className="input" value={resultForm.subjectId} onChange={(event) => setResultForm((current) => ({ ...current, subjectId: event.target.value }))}><option value="">Select subject</option>{configuredSubjects.map((item) => <option key={item._id} value={item.subjectId?._id || item.subjectId}>{item.subjectName}</option>)}</select></Field>
                  <Field label="Theory / obtained marks"><input className="input" type="number" value={resultForm.marksObtained} onChange={(event) => setResultForm((current) => ({ ...current, marksObtained: event.target.value }))} /></Field>
                  <Field label="Internal marks"><input className="input" type="number" value={resultForm.internalMarks} onChange={(event) => setResultForm((current) => ({ ...current, internalMarks: event.target.value }))} /></Field>
                  <Field label="Practical marks"><input className="input" type="number" value={resultForm.practicalMarks} onChange={(event) => setResultForm((current) => ({ ...current, practicalMarks: event.target.value }))} /></Field>
                  <Field label="Viva marks"><input className="input" type="number" value={resultForm.vivaMarks} onChange={(event) => setResultForm((current) => ({ ...current, vivaMarks: event.target.value }))} /></Field>
                  <Field label="Grace marks"><input className="input" type="number" value={resultForm.graceMarks} onChange={(event) => setResultForm((current) => ({ ...current, graceMarks: event.target.value }))} /></Field>
                  <Field label="Attendance %"><input className="input" type="number" value={resultForm.attendancePercentage} onChange={(event) => setResultForm((current) => ({ ...current, attendancePercentage: event.target.value }))} /></Field>
                  <Field label="Re-evaluation"><select className="input" value={resultForm.reEvaluationStatus} onChange={(event) => setResultForm((current) => ({ ...current, reEvaluationStatus: event.target.value }))}>{RE_EVALUATION.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={resultForm.supplementaryFlag} onChange={(event) => setResultForm((current) => ({ ...current, supplementaryFlag: event.target.checked }))} />Supplementary flag</label>
                  <div className="sm:col-span-2"><Field label="Teacher remarks"><input className="input" value={resultForm.teacherRemarks} onChange={(event) => setResultForm((current) => ({ ...current, teacherRemarks: event.target.value }))} /></Field></div>
                  <div className="sm:col-span-2"><Field label="Principal remarks"><input className="input" value={resultForm.principalRemarks} onChange={(event) => setResultForm((current) => ({ ...current, principalRemarks: event.target.value }))} /></Field></div>
                </div>
                <div className="mt-5 flex flex-col gap-3">
                  <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700" onClick={saveResult}><Save className="h-4 w-4" />Save result row</button>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" onClick={generateCards}><Award className="h-4 w-4" />Generate report cards</button>
                    <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" onClick={() => togglePublish(!examForm.resultPublished, examForm.resultLocked)}><ShieldCheck className="h-4 w-4" />{examForm.resultPublished ? "Unpublish results" : "Publish results"}</button>
                    <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:col-span-2" onClick={() => togglePublish(examForm.resultPublished, !examForm.resultLocked)}><Lock className="h-4 w-4" />{examForm.resultLocked ? "Unlock results" : "Lock results"}</button>
                  </div>
                </div>
              </section>

              <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
                <h3 className="text-lg font-bold text-slate-950">Current records</h3>
                <div className="mt-4 space-y-3">
                  {configuredSubjects.map((item) => <div key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 flex items-center justify-between gap-3"><div><p className="font-semibold text-slate-900">{item.subjectName}</p><p className="text-sm text-slate-500">{item.maxMarks} max • {item.passingMarks} pass • {item.examType}</p></div><button type="button" className="text-sm font-semibold text-rose-700" onClick={() => deleteSubjectConfig(item._id)}>Delete</button></div>)}
                  {schedules.map((item) => <div key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 flex items-center justify-between gap-3"><div><p className="font-semibold text-slate-900">{item.subjectName}</p><p className="text-sm text-slate-500">{new Date(item.examDate).toLocaleDateString()} • {item.startTime}-{item.endTime}</p></div><button type="button" className="text-sm font-semibold text-rose-700" onClick={() => deleteSchedule(item._id)}>Delete</button></div>)}
                  {results.slice(0, 6).map((item) => <div key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 flex items-center justify-between gap-3"><div><p className="font-semibold text-slate-900">{item.studentId?.userId?.name || "Student"} • {item.subject || item.subjectId?.name}</p><p className="text-sm text-slate-500">{item.marksObtained ?? item.marks}/{item.maxMarks || item.totalMarks} • Grade {item.grade}</p></div><button type="button" className="text-sm font-semibold text-rose-700" onClick={() => deleteResult(item._id)}>Delete</button></div>)}
                  {!configuredSubjects.length && !schedules.length && !results.length ? <p className="text-sm text-slate-500">No subject configs, schedules, or results added yet.</p> : null}
                </div>
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Merit list preview</p>
                  <div className="mt-3 space-y-2">
                    {meritList.slice(0, 5).map((item) => <div key={item.studentId} className="flex items-center justify-between text-sm text-slate-700"><span>#{item.rank} {item.studentName}</span><span>{item.percentage}%</span></div>)}
                    {!meritList.length ? <p className="text-sm text-slate-500">Merit list appears after saving results.</p> : null}
                  </div>
                </div>
              </section>
            </>
          ) : null}
        </section>
      </form>
    </div>
  );
}

export default ExamsResultsManagementPage;
