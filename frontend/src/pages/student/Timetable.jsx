import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Calendar, Printer } from "lucide-react";
import { studentService } from "../../services/studentService";
import { PageHeader, PageCard, EmptyState, inputClass, btnSecondary } from "./studentPageUi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function cellStyle(label) {
  const s = String(label || "—");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return { backgroundColor: `hsl(${Math.abs(h) % 360} 42% 92%)` };
}

function labelSlot(row) {
  if (!row) return "—";
  if (row.isBreak) return row.subjectLabel || "Break";
  return row.subjectId?.name || row.subjectLabel || row.subject || "—";
}

function teacherName(row) {
  if (!row || row.isBreak) return "—";
  return row.teacherId?.userId?.name || "—";
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

function StudentTimetablePage() {
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [filterDay, setFilterDay] = useState("");
  const [items, setItems] = useState([]);

  const load = useCallback(async () => {
    try {
      const data = await studentService.getTimetableStudent({
        academicYear,
        ...(filterDay ? { day: filterDay } : {}),
      });
      setItems(data);
    } catch (error) {
      toast.error(error.message);
    }
  }, [academicYear, filterDay]);

  useEffect(() => {
    load();
  }, [load]);

  const grid = useMemo(() => buildGrid(items), [items]);

  return (
    <div className="space-y-6">
      <PageHeader badge="Academics" title="My timetable" subtitle="Weekly class schedule based on your class and section." />

      <div className="flex flex-wrap gap-2 print:hidden">
        <input className={`${inputClass} w-40`} value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
        <select className={`${inputClass} w-44`} value={filterDay} onChange={(e) => setFilterDay(e.target.value)}>
          <option value="">All days (weekly)</option>
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <button type="button" className={btnSecondary} onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print
        </button>
      </div>

      <PageCard title="Class schedule" subtitle="Based on your class and section. Read-only." icon={Calendar}>
        {!items.length ? (
          <EmptyState icon={Calendar} title="No timetable data" message="Your schedule will appear once published by the school." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-slate-200 bg-slate-50 px-3 py-2 text-left font-bold text-slate-600">Day</th>
                  {grid.periods.map((p) => (
                    <th key={p} className="border border-slate-200 bg-slate-50 px-2 py-2 text-center font-bold text-slate-600">
                      P{p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.filter((d) => !filterDay || d === filterDay).map((d) => (
                  <tr key={d}>
                    <td className="border border-slate-200 bg-slate-50/80 px-3 py-2 font-semibold text-slate-800">{d}</td>
                    {grid.periods.map((p) => {
                      const cell = grid.map[d]?.[p];
                      return (
                        <td
                          key={p}
                          className="border border-slate-200 px-1 py-2 align-top text-xs"
                          style={cell ? cellStyle(labelSlot(cell)) : undefined}
                        >
                          {cell ? (
                            <>
                              <div className="font-semibold text-slate-900">{labelSlot(cell)}</div>
                              <div className="text-slate-600">
                                {cell.startTime}-{cell.endTime}
                              </div>
                              <div className="text-slate-500">{teacherName(cell)}</div>
                              {cell.roomNumber && <div className="text-slate-400">Room {cell.roomNumber}</div>}
                            </>
                          ) : (
                            <span className="text-slate-300">—</span>
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

export default StudentTimetablePage;
