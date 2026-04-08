import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, CalendarDays, Clock3, GraduationCap, Search, Trash2, UserRound } from "lucide-react";
import { adminService } from "../../services/adminService";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function subjectBg(label) {
  const source = String(label || "-");
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = source.charCodeAt(index) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return { backgroundColor: `hsl(${hue} 58% 95%)` };
}

function slotLabel(row) {
  if (!row) return "-";
  if (row.isBreak) return row.subjectLabel || "Break";
  if (row.subjectId?.name) return row.subjectId.name;
  if (row.subjectLabel) return row.subjectLabel;
  return row.subject || "-";
}

function buildGrid(rows) {
  const periodSet = new Set();
  const map = {};

  for (const row of rows || []) {
    const period = Number(row.periodNumber ?? row.period);
    if (!Number.isNaN(period)) periodSet.add(period);
    if (!map[row.day]) map[row.day] = {};
    map[row.day][period] = row;
  }

  return { periods: [...periodSet].sort((a, b) => a - b), map };
}

function TimetableDirectoryPanel() {
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [list, setList] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ classId: "", section: "", teacherId: "", day: "", query: "" });

  const loadMeta = useCallback(async () => {
    try {
      const [classData, teacherData] = await Promise.all([
        adminService.getClasses(),
        adminService.getTeachers({ page: 1, limit: 200 }),
      ]);
      setClasses(Array.isArray(classData) ? classData : []);
      setTeachers(teacherData.items || []);
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  const loadDirectory = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        academicYear,
        ...(filters.classId ? { classId: filters.classId } : {}),
        ...(filters.section ? { section: filters.section } : {}),
        ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
        ...(filters.day ? { day: filters.day } : {}),
      };
      const [rows, dash] = await Promise.all([
        adminService.listTimetable(params),
        adminService.timetableDashboard({ academicYear }),
      ]);
      setList(Array.isArray(rows) ? rows : []);
      setDashboard(dash || null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [academicYear, filters.classId, filters.day, filters.section, filters.teacherId]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  const visibleRows = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    if (!query) return list;
    return list.filter((row) => {
      const haystack = [
        row.classId?.name,
        row.section,
        row.subjectId?.name,
        row.subjectLabel,
        row.teacherId?.userId?.name,
        row.roomNumber,
        row.day,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [filters.query, list]);

  const grid = useMemo(() => buildGrid(visibleRows), [visibleRows]);

  const removeRow = async (id) => {
    if (!window.confirm("Delete this timetable slot?")) return;
    try {
      await adminService.deleteTimetableEntry(id);
      toast.success("Timetable slot deleted");
      loadDirectory();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 via-brand-950 to-cyan-700 px-6 py-6 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-cyan-100">Schedule directory</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Registered timetable slots</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">
                Review weekly schedules, filter by class or teacher, and keep the school timetable organized from one place.
              </p>
            </div>
            <div className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm lg:min-w-[240px] lg:w-auto">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-cyan-100">
                <span>Academic year</span>
                <span>{visibleRows.length} slots</span>
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <CalendarDays className="h-5 w-5 text-cyan-200" />
                <input
                  className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-300"
                  value={academicYear}
                  onChange={(event) => setAcademicYear(event.target.value)}
                  placeholder="2025-2026"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
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
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em]">Conflicts</p>
            </div>
            <p className="mt-3 text-3xl font-bold text-amber-900">{dashboard?.conflictAlerts?.length ?? 0}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-700">Filters</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Find timetable rows quickly</h2>
            <p className="mt-1 text-sm text-slate-500">Search by subject, class, room, or assigned teacher.</p>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-11"
              placeholder="Search class, teacher, subject, room"
              value={filters.query}
              onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <select className="input" value={filters.classId} onChange={(event) => setFilters((current) => ({ ...current, classId: event.target.value }))}>
            <option value="">All classes</option>
            {classes.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}-{item.section}
              </option>
            ))}
          </select>
          <input className="input" placeholder="Section" value={filters.section} onChange={(event) => setFilters((current) => ({ ...current, section: event.target.value }))} />
          <select className="input" value={filters.teacherId} onChange={(event) => setFilters((current) => ({ ...current, teacherId: event.target.value }))}>
            <option value="">All teachers</option>
            {teachers.map((item) => (
              <option key={item._id} value={item._id}>
                {item.userId?.name}
              </option>
            ))}
          </select>
          <select className="input" value={filters.day} onChange={(event) => setFilters((current) => ({ ...current, day: event.target.value }))}>
            <option value="">All days</option>
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={() => setFilters({ classId: "", section: "", teacherId: "", day: "", query: "" })}
          >
            Reset filters
          </button>
        </div>
      </section>

      {dashboard?.conflictAlerts?.length ? (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-amber-950">Conflict alerts</h2>
              <p className="text-sm text-amber-800">These overlaps need review before the timetable is considered final.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {dashboard.conflictAlerts.map((alert, index) => (
              <div key={`${alert.message}-${index}`} className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-700">
                {alert.message}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-700">Weekly matrix</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Grid view</h2>
            <p className="mt-1 text-sm text-slate-500">A clean week-by-period matrix for quick review.</p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            {loading ? "Refreshing" : `${visibleRows.length} rows`}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="rounded-l-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left font-semibold text-slate-600">Day</th>
                {grid.periods.map((period, index) => (
                  <th
                    key={period}
                    className={`border border-slate-200 bg-slate-50 px-4 py-3 text-center font-semibold text-slate-600 ${
                      index === grid.periods.length - 1 ? "rounded-r-2xl" : ""
                    }`}
                  >
                    P{period}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.filter((day) => !filters.day || day === filters.day).map((day) => (
                <tr key={day}>
                  <td className="border border-slate-200 bg-slate-50 px-4 py-4 font-semibold text-slate-800">{day}</td>
                  {grid.periods.map((period) => {
                    const cell = grid.map[day]?.[period];
                    return (
                      <td key={`${day}-${period}`} className="border border-slate-200 px-2 py-2 align-top">
                        {cell ? (
                          <div className="min-w-[180px] rounded-2xl border border-white/60 p-3 shadow-sm" style={subjectBg(slotLabel(cell))}>
                            <p className="text-sm font-bold text-slate-900">{slotLabel(cell)}</p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                              <Clock3 className="h-3.5 w-3.5" />
                              {cell.startTime} - {cell.endTime}
                            </p>
                            {!cell.isBreak ? (
                              <p className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                                <UserRound className="h-3.5 w-3.5" />
                                {cell.teacherId?.userId?.name || "Teacher not assigned"}
                              </p>
                            ) : null}
                            <button
                              type="button"
                              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 transition hover:text-rose-700"
                              onClick={() => removeRow(cell._id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        ) : (
                          <div className="min-w-[180px] rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-xs font-medium text-slate-400">
                            No slot
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16)] ring-1 ring-slate-100/90 sm:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-brand-700">Detailed rows</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Timetable slot cards</h2>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            {visibleRows.length} listed
          </div>
        </div>

        {visibleRows.length ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {visibleRows.map((row) => (
              <article key={row._id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <CalendarDays className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-slate-950">{slotLabel(row)}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {row.day} • Period {row.periodNumber ?? row.period}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
                    {row.classId?.name || "Class"} - {row.section || row.classId?.section || "-"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Assigned teacher</p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-800">
                      <UserRound className="h-4 w-4 text-slate-400" />
                      {row.teacherId?.userId?.name || "Teacher not assigned"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Academic group</p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-800">
                      <GraduationCap className="h-4 w-4 text-slate-400" />
                      {row.classId?.name || "-"} - {row.section || row.classId?.section || "-"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Timing</p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-800">
                      <Clock3 className="h-4 w-4 text-slate-400" />
                      {row.startTime} - {row.endTime}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">Room</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">{row.roomNumber || "Room not added"}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 sm:w-auto"
                    onClick={() => removeRow(row._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete slot
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-700">No timetable entries match the current filters.</p>
            <p className="mt-2 text-sm text-slate-500">Create a timetable slot from the create tab, then review it here.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default TimetableDirectoryPanel;
