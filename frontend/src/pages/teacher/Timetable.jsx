import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, Clock, Printer, Sparkles } from "lucide-react";
import { teacherService } from "../../services/teacherService";
import { EmptyState, inputClass, labelClass, PageCard, PageHeader } from "./teacherPageUi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SUBJECT_COLORS = [
  "bg-blue-50 border-blue-200 text-blue-900",
  "bg-emerald-50 border-emerald-200 text-emerald-900",
  "bg-violet-50 border-violet-200 text-violet-900",
  "bg-amber-50 border-amber-200 text-amber-900",
  "bg-rose-50 border-rose-200 text-rose-900",
  "bg-cyan-50 border-cyan-200 text-cyan-900",
];

const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50";

function labelSlot(item) {
  return item.subjectId?.name || item.subject || "Period";
}

function cellStyle(subjectLabel) {
  let h = 0;
  for (let i = 0; i < subjectLabel.length; i++) h = (h + subjectLabel.charCodeAt(i)) % SUBJECT_COLORS.length;
  return SUBJECT_COLORS[h];
}

function TeacherTimetablePage() {
  const [weekly, setWeekly] = useState([]);
  const [today, setToday] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [filterDay, setFilterDay] = useState("");

  const load = async () => {
    try {
      const params = {};
      if (academicYear.trim()) params.academicYear = academicYear.trim();
      const [w, t] = await Promise.all([teacherService.getTimetable(params), teacherService.getTodayTimetable()]);
      setWeekly(w);
      setToday(t);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const grid = useMemo(() => {
    const map = {};
    let maxPeriod = 0;
    for (const row of weekly) {
      const day = row.dayOfWeek;
      const p = row.periodNumber ?? row.period ?? 1;
      maxPeriod = Math.max(maxPeriod, p);
      if (!map[day]) map[day] = {};
      map[day][p] = row;
    }
    const periods = [];
    for (let i = 1; i <= maxPeriod; i++) periods.push(i);
    return { map, periods };
  }, [weekly]);

  const printView = () => window.print();

  return (
    <div className="space-y-8 print:space-y-4">
      <PageHeader
        badge="Schedule"
        title="My timetable"
        subtitle="Weekly grid and today’s classes — read-only, managed by school admin."
        actions={
          <>
            <input className={`${inputClass} w-36`} value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="Academic year" />
            <select className={`${inputClass} w-44`} value={filterDay} onChange={(e) => setFilterDay(e.target.value)}>
              <option value="">All days</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <button type="button" className={btnSecondary} onClick={load}>
              Refresh
            </button>
            <button type="button" className={btnSecondary} onClick={printView}>
              <Printer className="h-4 w-4" /> Print / PDF
            </button>
          </>
        }
      />

      <div className="print:hidden">
        <PageCard title="Today" subtitle="Your classes for today" icon={Sparkles}>
          {!today.length ? (
            <EmptyState icon={CalendarDays} title="No classes today" message="Enjoy your free day or check the weekly grid below." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {today.map((item) => (
                <div
                  key={item._id}
                  className={`rounded-2xl border p-4 shadow-sm ${cellStyle(labelSlot(item))}`}
                >
                  <p className="text-xs font-bold uppercase tracking-wide opacity-70">Period {item.periodNumber ?? item.period}</p>
                  <p className="mt-1 text-lg font-bold">{labelSlot(item)}</p>
                  <p className="mt-1 text-sm opacity-80">
                    {item.classId?.name}-{item.classId?.section} {item.section || ""}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    {item.startTime} – {item.endTime}
                    {item.roomNumber ? ` · Room ${item.roomNumber}` : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </PageCard>
      </div>

      <PageCard title="Weekly grid" subtitle="Color-coded by subject" icon={CalendarDays}>
        {!weekly.length ? (
          <EmptyState icon={CalendarDays} title="No timetable" message="No periods are assigned to you yet." />
        ) : (
          <div className="teacher-table-scroll overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-slate-200 bg-slate-100 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600">Day</th>
                  {grid.periods.map((p) => (
                    <th key={p} className="border border-slate-200 bg-slate-100 px-2 py-3 text-center text-xs font-bold text-slate-600">
                      P{p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.filter((d) => !filterDay || d === filterDay).map((d) => (
                  <tr key={d}>
                    <td className="border border-slate-200 bg-slate-50 px-3 py-3 font-semibold text-slate-800">{d}</td>
                    {grid.periods.map((p) => {
                      const cell = grid.map[d]?.[p];
                      return (
                        <td key={p} className="border border-slate-200 px-1 py-2 align-top">
                          {cell ? (
                            <div className={`rounded-xl border p-2 text-xs ${cellStyle(labelSlot(cell))}`}>
                              <div className="font-bold">{labelSlot(cell)}</div>
                              <div className="mt-0.5 opacity-80">
                                {cell.startTime}–{cell.endTime}
                              </div>
                              <div className="mt-0.5 opacity-70">
                                {cell.classId?.name}-{cell.classId?.section}
                                {cell.roomNumber ? ` · ${cell.roomNumber}` : ""}
                              </div>
                            </div>
                          ) : (
                            <span className="block py-4 text-center text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageCard>
    </div>
  );
}

export default TeacherTimetablePage;
