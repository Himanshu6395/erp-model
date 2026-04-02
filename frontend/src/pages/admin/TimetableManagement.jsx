import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { adminService } from "../../services/adminService";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function subjectBg(label) {
  const s = String(label || "—");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  const hue = Math.abs(h) % 360;
  return { backgroundColor: `hsl(${hue} 45% 92%)` };
}

function slotLabel(row) {
  if (!row) return "—";
  if (row.isBreak) return row.subjectLabel || "Break";
  if (row.subjectId?.name) return row.subjectId.name;
  if (row.subjectLabel) return row.subjectLabel;
  return row.subject || "—";
}

function buildGrid(rows) {
  const periodSet = new Set();
  for (const r of rows || []) {
    const p = r.periodNumber ?? r.period;
    if (p != null) periodSet.add(Number(p));
  }
  const periods = [...periodSet].sort((a, b) => a - b);
  const map = {};
  for (const r of rows || []) {
    const d = r.day;
    const p = Number(r.periodNumber ?? r.period);
    if (!map[d]) map[d] = {};
    map[d][p] = r;
  }
  return { periods, map };
}

function TimetableManagementPage() {
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [list, setList] = useState([]);
  const [dash, setDash] = useState(null);
  const [filters, setFilters] = useState({ classId: "", section: "", teacherId: "", day: "" });

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
    try {
      const [cls, subj, teach] = await Promise.all([
        adminService.getClasses(),
        adminService.getSubjects(),
        adminService.getTeachers({ page: 1, limit: 200 }),
      ]);
      setClasses(cls || []);
      setSubjects(subj || []);
      setTeachers(teach.items || []);
    } catch (e) {
      toast.error(e.message);
    }
  }, []);

  const loadList = useCallback(async () => {
    try {
      const params = {
        academicYear,
        ...(filters.classId ? { classId: filters.classId } : {}),
        ...(filters.section ? { section: filters.section } : {}),
        ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
        ...(filters.day ? { day: filters.day } : {}),
      };
      const [rows, d] = await Promise.all([adminService.listTimetable(params), adminService.timetableDashboard({ academicYear })]);
      setList(rows);
      setDash(d);
    } catch (e) {
      toast.error(e.message);
    }
  }, [academicYear, filters]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);
  useEffect(() => {
    loadList();
  }, [loadList]);

  const filteredSubjects = useMemo(
    () => subjects.filter((s) => !form.classId || String(s.classId?._id || s.classId) === String(form.classId)),
    [subjects, form.classId]
  );

  const grid = useMemo(() => buildGrid(list), [list]);

  const submitOne = async (e) => {
    e.preventDefault();
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
          toast.error("Select a subject or mark as break");
          return;
        }
        payload.subjectId = form.subjectId;
        if (!form.teacherId) {
          toast.error("Teacher required for teaching periods");
          return;
        }
        payload.teacherId = form.teacherId;
      }
      await adminService.createTimetableEntry(payload);
      toast.success("Period added");
      loadList();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const submitBulk = async () => {
    try {
      let entries = [];
      try {
        entries = JSON.parse(bulkJson);
      } catch {
        toast.error("Bulk JSON invalid");
        return;
      }
      if (!form.classId) {
        toast.error("Select class for bulk upload");
        return;
      }
      const body = {
        academicYear,
        classId: form.classId,
        section: form.section,
        entries,
      };
      if (dupFrom.classId) {
        body.duplicateFrom = { classId: dupFrom.classId, section: dupFrom.section || "" };
        delete body.entries;
      }
      if (copyDay.from && copyDay.targets.trim()) {
        body.copyFromDay = copyDay.from;
        body.targetDays = copyDay.targets.split(",").map((s) => s.trim()).filter(Boolean);
      }
      const res = await adminService.bulkTimetable(body);
      toast.success(`Created ${res.created} slots`);
      loadList();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeRow = async (id) => {
    if (!window.confirm("Delete this slot?")) return;
    try {
      await adminService.deleteTimetableEntry(id);
      toast.success("Deleted");
      loadList();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Timetable management</h2>

      {dash && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <p className="text-sm text-gray-500">Classes scheduled</p>
            <p className="text-2xl font-bold">{dash.totalClassesScheduled}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Total slots</p>
            <p className="text-2xl font-bold">{dash.totalSlots}</p>
          </div>
          <div className="card sm:col-span-2">
            <p className="text-sm font-semibold text-gray-700">Conflict alerts</p>
            <ul className="mt-2 max-h-28 list-disc space-y-1 overflow-auto pl-4 text-sm text-red-700">
              {(dash.conflictAlerts || []).map((a, i) => (
                <li key={i}>{a.message}</li>
              ))}
              {!dash.conflictAlerts?.length && <li className="list-none text-gray-500">No conflicts detected.</li>}
            </ul>
          </div>
        </div>
      )}

      <FormCard title="Filters & academic year" subtitle=" scoped to your school.">
        <div className="flex flex-wrap gap-2">
          <input className="input w-40" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="Academic year" />
          <select className="input w-44" value={filters.classId} onChange={(e) => setFilters((f) => ({ ...f, classId: e.target.value }))}>
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}-{c.section}
              </option>
            ))}
          </select>
          <input className="input w-28" placeholder="Section" value={filters.section} onChange={(e) => setFilters((f) => ({ ...f, section: e.target.value }))} />
          <select className="input w-48" value={filters.teacherId} onChange={(e) => setFilters((f) => ({ ...f, teacherId: e.target.value }))}>
            <option value="">All teachers</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.userId?.name}
              </option>
            ))}
          </select>
          <select className="input w-36" value={filters.day} onChange={(e) => setFilters((f) => ({ ...f, day: e.target.value }))}>
            <option value="">All days</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </FormCard>

      <FormCard title="Add period" subtitle="Validations block class clashes, teacher double-booking, overlaps, and duplicate period numbers.">
        <form className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" onSubmit={submitOne}>
          <input className="input" value={form.academicYear} onChange={(e) => setForm((p) => ({ ...p, academicYear: e.target.value }))} />
          <select className="input sm:col-span-2" value={form.classId} onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))} required>
            <option value="">Class *</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}-{c.section}
              </option>
            ))}
          </select>
          <input className="input" placeholder="Section (e.g. A)" value={form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))} />
          <select className="input" value={form.day} onChange={(e) => setForm((p) => ({ ...p, day: e.target.value }))}>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input className="input" type="number" min={1} value={form.periodNumber} onChange={(e) => setForm((p) => ({ ...p, periodNumber: e.target.value }))} />
          <input className="input" type="time" value={form.startTime} onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))} />
          <input className="input" type="time" value={form.endTime} onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.isBreak} onChange={(e) => setForm((p) => ({ ...p, isBreak: e.target.checked }))} />
            Break period
          </label>
          {!form.isBreak && (
            <>
              <select className="input sm:col-span-2" value={form.subjectId} onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}>
                <option value="">Subject</option>
                {filteredSubjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select className="input sm:col-span-2" value={form.teacherId} onChange={(e) => setForm((p) => ({ ...p, teacherId: e.target.value }))}>
                <option value="">Teacher</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.userId?.name}
                  </option>
                ))}
              </select>
            </>
          )}
          <input className="input" placeholder="Room" value={form.roomNumber} onChange={(e) => setForm((p) => ({ ...p, roomNumber: e.target.value }))} />
          <input className="input sm:col-span-2" placeholder="Notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          <button className="btn-primary w-fit sm:col-span-4" type="submit">
            Save entry
          </button>
        </form>
      </FormCard>

      <FormCard title="Bulk create" subtitle="JSON array of entries, or duplicate from another class/section; optional copyFromDay + targetDays (comma days).">
        <div className="grid gap-2 sm:grid-cols-2">
          <select className="input" value={dupFrom.classId} onChange={(e) => setDupFrom((p) => ({ ...p, classId: e.target.value }))}>
            <option value="">Duplicate from class…</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}-{c.section}
              </option>
            ))}
          </select>
          <input className="input" placeholder="Source section" value={dupFrom.section} onChange={(e) => setDupFrom((p) => ({ ...p, section: e.target.value }))} />
          <input className="input" value={copyDay.from} onChange={(e) => setCopyDay((p) => ({ ...p, from: e.target.value }))} placeholder="Copy from day" />
          <input className="input" value={copyDay.targets} onChange={(e) => setCopyDay((p) => ({ ...p, targets: e.target.value }))} placeholder="Target days CSV" />
        </div>
        <textarea className="input mt-2 min-h-36 font-mono text-sm" value={bulkJson} onChange={(e) => setBulkJson(e.target.value)} />
        <button className="btn-secondary mt-2" type="button" onClick={submitBulk}>
          Run bulk / duplicate
        </button>
      </FormCard>

      {dash?.teacherLoad?.length > 0 && (
        <FormCard title="Teacher load (periods)" subtitle="Teaching slots only (excludes breaks).">
          <div className="overflow-x-auto text-sm">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-2 pr-4">Teacher</th>
                  <th className="py-2">Periods</th>
                </tr>
              </thead>
              <tbody>
                {dash.teacherLoad.map((t) => (
                  <tr key={t.teacherId} className="border-b border-gray-100">
                    <td className="py-2 pr-4">{t.name}</td>
                    <td className="py-2">{t.periods}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FormCard>
      )}

      <FormCard title="Grid view" subtitle="Filtered list as week × period matrix.">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-gray-200 bg-gray-50 px-2 py-2 text-left">Day</th>
                {grid.periods.map((p) => (
                  <th key={p} className="border border-gray-200 bg-gray-50 px-2 py-2 text-center">
                    P{p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.filter((d) => !filters.day || d === filters.day).map((d) => (
                <tr key={d}>
                  <td className="border border-gray-200 bg-gray-50 px-2 py-2 font-medium">{d}</td>
                  {grid.periods.map((p) => {
                    const cell = grid.map[d]?.[p];
                    return (
                      <td key={p} className="border border-gray-200 px-1 py-1 align-top text-xs" style={cell ? subjectBg(slotLabel(cell)) : undefined}>
                        {cell ? (
                          <div>
                            <div className="font-semibold">{slotLabel(cell)}</div>
                            <div className="text-gray-600">
                              {cell.startTime}-{cell.endTime}
                            </div>
                            {!cell.isBreak && (
                              <div className="text-gray-500">
                                {cell.teacherId?.userId?.name || "—"} {cell.roomNumber ? `· ${cell.roomNumber}` : ""}
                              </div>
                            )}
                            <button type="button" className="mt-1 text-red-600 hover:underline" onClick={() => removeRow(cell._id)}>
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!list.length && <p className="mt-2 text-sm text-gray-500">No rows match filters.</p>}
      </FormCard>
    </div>
  );
}

export default TimetableManagementPage;
