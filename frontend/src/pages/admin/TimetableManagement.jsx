import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CalendarClock,
  CalendarRange,
  CheckCircle2,
  Clock3,
  CopyPlus,
  Layers3,
  Save,
  ShieldCheck,
  UserSquare2,
} from "lucide-react";
import { adminService } from "../../services/adminService";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function Field({ label, hint, required, children }) {
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

function TimetableManagementPage() {
  const navigate = useNavigate();
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const [form, setForm] = useState({
    academicYear: "2025-2026",
    classId: "",
    section: "",
    day: "Monday",
    periodNumber: "1",
    startTime: "09:00",
    endTime: "09:45",
    subjectId: "",
    teacherId: "",
    roomNumber: "",
    isBreak: false,
    notes: "",
  });
  const [bulkJson, setBulkJson] = useState(
    '[\n  { "day": "Monday", "periodNumber": 1, "startTime": "09:00", "endTime": "09:45", "subjectId": "", "teacherId": "", "isBreak": false }\n]'
  );
  const [dupFrom, setDupFrom] = useState({ classId: "", section: "" });
  const [copyDay, setCopyDay] = useState({ from: "Monday", targets: "Tuesday,Wednesday" });

  const loadMeta = useCallback(async () => {
    setBootstrapLoading(true);
    try {
      const [classData, subjectData, teacherData] = await Promise.all([
        adminService.getClasses(),
        adminService.getSubjects(),
        adminService.getTeachers({ page: 1, limit: 200 }),
      ]);
      setClasses(Array.isArray(classData) ? classData : []);
      setSubjects(Array.isArray(subjectData) ? subjectData : []);
      setTeachers(teacherData.items || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBootstrapLoading(false);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const data = await adminService.timetableDashboard({ academicYear });
      setDashboard(data || null);
    } catch (error) {
      toast.error(error.message);
    }
  }, [academicYear]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const filteredSubjects = useMemo(
    () => subjects.filter((item) => !form.classId || String(item.classId?._id || item.classId) === String(form.classId)),
    [subjects, form.classId]
  );

  const completion = useMemo(() => {
    const checks = [
      Boolean(form.classId),
      Boolean(form.section.trim()),
      Boolean(form.day),
      Boolean(form.periodNumber),
      Boolean(form.startTime),
      Boolean(form.endTime),
      form.isBreak ? true : Boolean(form.subjectId),
      form.isBreak ? true : Boolean(form.teacherId),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form]);

  const submitOne = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        academicYear: form.academicYear,
        classId: form.classId,
        section: form.section,
        day: form.day,
        periodNumber: Number(form.periodNumber),
        startTime: form.startTime,
        endTime: form.endTime,
        isBreak: form.isBreak,
        roomNumber: form.roomNumber || undefined,
        notes: form.notes || undefined,
      };

      if (form.isBreak) {
        payload.subjectLabel = "Break";
      } else {
        if (!form.subjectId) {
          toast.error("Select a subject or mark this slot as break.");
          return;
        }
        if (!form.teacherId) {
          toast.error("Assign a teacher for teaching periods.");
          return;
        }
        payload.subjectId = form.subjectId;
        payload.teacherId = form.teacherId;
      }

      await adminService.createTimetableEntry(payload);
      toast.success("Timetable slot created");
      setForm((current) => ({
        ...current,
        periodNumber: String(Number(current.periodNumber || "1") + 1),
        subjectId: "",
        teacherId: "",
        roomNumber: "",
        isBreak: false,
        notes: "",
      }));
      loadDashboard();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitBulk = async () => {
    setLoading(true);
    try {
      let entries = [];
      try {
        entries = JSON.parse(bulkJson);
      } catch {
        toast.error("Bulk JSON is not valid.");
        return;
      }

      if (!form.classId) {
        toast.error("Select a class before running bulk actions.");
        return;
      }

      const payload = {
        academicYear,
        classId: form.classId,
        section: form.section,
        entries,
      };

      if (dupFrom.classId) {
        payload.duplicateFrom = { classId: dupFrom.classId, section: dupFrom.section || "" };
        delete payload.entries;
      }

      if (copyDay.from && copyDay.targets.trim()) {
        payload.copyFromDay = copyDay.from;
        payload.targetDays = copyDay.targets
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }

      const response = await adminService.bulkTimetable(payload);
      toast.success(`Created ${response.created} timetable slots`);
      loadDashboard();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (bootstrapLoading) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)]">
        Loading timetable tools...
      </div>
    );
  }

  const selectedClass = classes.find((item) => item._id === form.classId);
  const selectedSubject = filteredSubjects.find((item) => item._id === form.subjectId);
  const selectedTeacher = teachers.find((item) => item._id === form.teacherId);

  return (
    <form onSubmit={submitOne} className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-brand-950 to-cyan-700 px-6 py-6 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-cyan-100">Schedule planning</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Create timetable slots</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
                Build a clean academic timetable with period-level control, teacher assignment, and bulk duplication tools for the school admin panel.
              </p>
            </div>
            <div className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm lg:min-w-[240px] lg:w-auto">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
                <span>Form completion</span>
                <span>{completion}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-teal-300 transition-all" style={{ width: `${completion}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-200">Class, timing, subject, and teacher define the main slot.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-b border-slate-100 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Classes scheduled</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{dashboard?.totalClassesScheduled ?? 0}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Total slots</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{dashboard?.totalSlots ?? 0}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Teacher load rows</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{dashboard?.teacherLoad?.length ?? 0}</p>
          </div>
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-amber-700">Conflict alerts</p>
            <p className="mt-3 text-3xl font-bold text-amber-900">{dashboard?.conflictAlerts?.length ?? 0}</p>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1.25fr,0.75fr]">
          <section className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <CalendarClock className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Slot details</h2>
                  <p className="text-sm text-slate-500">Set the academic year, class, timing, and assigned period owner.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Academic year" required>
                  <input
                    className="input"
                    value={form.academicYear}
                    onChange={(event) => {
                      setForm((current) => ({ ...current, academicYear: event.target.value }));
                      setAcademicYear(event.target.value);
                    }}
                    placeholder="2025-2026"
                    required
                  />
                </Field>
                <Field label="Class" required>
                  <select className="input" value={form.classId} onChange={(event) => setForm((current) => ({ ...current, classId: event.target.value }))} required>
                    <option value="">Select class</option>
                    {classes.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}-{item.section}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Section" required hint="Use the section exactly as mapped in class setup.">
                  <input className="input" value={form.section} onChange={(event) => setForm((current) => ({ ...current, section: event.target.value }))} required />
                </Field>
                <Field label="Day" required>
                  <select className="input" value={form.day} onChange={(event) => setForm((current) => ({ ...current, day: event.target.value }))}>
                    {DAYS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Period number" required>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    value={form.periodNumber}
                    onChange={(event) => setForm((current) => ({ ...current, periodNumber: event.target.value }))}
                    required
                  />
                </Field>
                <Field label="Room number" hint="Optional room or lab reference.">
                  <input className="input" value={form.roomNumber} onChange={(event) => setForm((current) => ({ ...current, roomNumber: event.target.value }))} />
                </Field>
                <Field label="Start time" required>
                  <input className="input" type="time" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} />
                </Field>
                <Field label="End time" required>
                  <input className="input" type="time" value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} />
                </Field>
                <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <label className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={form.isBreak}
                      onChange={(event) => setForm((current) => ({ ...current, isBreak: event.target.checked, subjectId: "", teacherId: "" }))}
                    />
                    Mark this slot as a break period
                  </label>
                  <p className="mt-2 text-xs text-slate-500">Break slots skip subject and teacher assignment.</p>
                </div>
                {!form.isBreak ? (
                  <>
                    <Field label="Subject" required>
                      <select className="input" value={form.subjectId} onChange={(event) => setForm((current) => ({ ...current, subjectId: event.target.value }))}>
                        <option value="">Select subject</option>
                        {filteredSubjects.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Teacher" required>
                      <select className="input" value={form.teacherId} onChange={(event) => setForm((current) => ({ ...current, teacherId: event.target.value }))}>
                        <option value="">Assign teacher</option>
                        {teachers.map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.userId?.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </>
                ) : null}
                <Field label="Notes" hint="Optional internal remarks for coordinators.">
                  <input className="input" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
                </Field>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-600 text-white">
                  <CopyPlus className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Bulk create and duplication</h2>
                  <p className="text-sm text-slate-500">Paste timetable JSON, duplicate another section, or copy one day into many.</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Duplicate from class">
                  <select className="input" value={dupFrom.classId} onChange={(event) => setDupFrom((current) => ({ ...current, classId: event.target.value }))}>
                    <option value="">Select source class</option>
                    {classes.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}-{item.section}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Source section">
                  <input className="input" value={dupFrom.section} onChange={(event) => setDupFrom((current) => ({ ...current, section: event.target.value }))} />
                </Field>
                <Field label="Copy from day">
                  <input className="input" value={copyDay.from} onChange={(event) => setCopyDay((current) => ({ ...current, from: event.target.value }))} />
                </Field>
                <Field label="Target days CSV">
                  <input className="input" value={copyDay.targets} onChange={(event) => setCopyDay((current) => ({ ...current, targets: event.target.value }))} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Bulk JSON" hint="Use an array of timetable entries with day, periodNumber, startTime, endTime, subjectId, and teacherId.">
                    <textarea className="input min-h-40 font-mono text-sm" value={bulkJson} onChange={(event) => setBulkJson(event.target.value)} />
                  </Field>
                </div>
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                  type="button"
                  onClick={submitBulk}
                  disabled={loading}
                >
                  <Layers3 className="h-4 w-4" />
                  Run bulk action
                </button>
              </div>
            </section>
          </section>

          <section className="space-y-5 rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Preview</h2>
                <p className="text-sm text-slate-500">Quick schedule summary before saving the slot.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <CalendarRange className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-500">Slot summary</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-950">{form.isBreak ? "Break period" : selectedSubject?.name || "Subject pending"}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedClass ? `${selectedClass.name} - ${form.section || selectedClass.section}` : "Class and section pending"}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Assigned teacher</p>
                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <UserSquare2 className="h-4 w-4 text-slate-400" />
                  <span>{form.isBreak ? "No teacher needed for break" : selectedTeacher?.userId?.name || "Teacher pending"}</span>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Timing</p>
                <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  <span>
                    {form.day} • {form.startTime} - {form.endTime}
                  </span>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Operational notes</p>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  {form.roomNumber ? `Room ${form.roomNumber}` : "Room pending"} {form.notes ? `• ${form.notes}` : ""}
                </p>
              </div>
            </div>

            {dashboard?.teacherLoad?.length ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Teacher load snapshot</p>
                <div className="mt-4 space-y-3">
                  {dashboard.teacherLoad.slice(0, 5).map((item) => (
                    <div key={item.teacherId} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <span className="text-sm font-medium text-slate-700">{item.name}</span>
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
                        {item.periods} periods
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="inline-flex items-center gap-2 rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-800">
              <CheckCircle2 className="h-4 w-4" />
              Use the timetable directory tab to review weekly and card-based timetable listings.
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-5 sm:flex-row sm:justify-between sm:px-6">
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            onClick={() => navigate("/admin/timetable/registered")}
          >
            <CalendarRange className="h-4 w-4" />
            View timetable directory
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : "Create timetable slot"}
          </button>
        </div>
      </section>
    </form>
  );
}

export default TimetableManagementPage;
