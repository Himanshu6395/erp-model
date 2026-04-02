import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function cellStyle(label) {
  const s = String(label || "—");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return { backgroundColor: `hsl(${Math.abs(h) % 360} 40% 92%)` };
}

function labelSlot(row) {
  if (!row) return "—";
  if (row.isBreak) return row.subjectLabel || "Break";
  return row.subjectId?.name || row.subjectLabel || row.subject || "—";
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

function TeacherTimetablePage() {
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [filterDay, setFilterDay] = useState("");
  const [weekly, setWeekly] = useState([]);
  const [today, setToday] = useState([]);

  const params = useMemo(() => ({ academicYear, ...(filterDay ? { day: filterDay } : {}) }), [academicYear, filterDay]);

  const load = useCallback(async () => {
    try {
      const [weekData, todayData] = await Promise.all([
        teacherService.getTeacherTimetable(params),
        teacherService.getTodayTimetable({ academicYear }),
      ]);
      setWeekly(weekData);
      setToday(todayData);
    } catch (error) {
      toast.error(error.message);
    }
  }, [params, academicYear]);

  useEffect(() => {
    load();
  }, [load]);

  const grid = useMemo(() => buildGrid(weekly), [weekly]);

  const printView = () => window.print();

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <h2 className="text-2xl font-bold text-gray-900">My timetable</h2>
        <div className="flex flex-wrap gap-2">
          <input className="input w-36" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="Year" />
          <select className="input w-40" value={filterDay} onChange={(e) => setFilterDay(e.target.value)}>
            <option value="">Week (all days)</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <button type="button" className="btn-secondary" onClick={printView}>
            Print / PDF
          </button>
        </div>
      </div>

      <div className="print:hidden">
      <FormCard title="Today" subtitle="Read-only — managed by school admin.">
        <div className="space-y-2 text-sm">
          {today.map((item) => (
            <div key={item._id} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
              P{item.periodNumber ?? item.period} | {labelSlot(item)} | {item.classId?.name}-{item.classId?.section} {item.section || ""} |{" "}
              {item.startTime}-{item.endTime}
              {item.roomNumber ? ` · Room ${item.roomNumber}` : ""}
            </div>
          ))}
          {!today.length && <div className="text-gray-500">No classes today.</div>}
        </div>
      </FormCard>
      </div>

      <FormCard title="Weekly grid" subtitle="">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-gray-200 bg-gray-100 px-2 py-2 text-left">Day</th>
                {grid.periods.map((p) => (
                  <th key={p} className="border border-gray-200 bg-gray-100 px-2 py-2 text-center">
                    P{p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.filter((d) => !filterDay || d === filterDay).map((d) => (
                <tr key={d}>
                  <td className="border border-gray-200 bg-gray-50 px-2 py-2 font-medium">{d}</td>
                  {grid.periods.map((p) => {
                    const cell = grid.map[d]?.[p];
                    return (
                      <td
                        key={p}
                        className="border border-gray-200 px-1 py-2 align-top text-xs"
                        style={cell ? cellStyle(labelSlot(cell)) : undefined}
                      >
                        {cell ? (
                          <>
                            <div className="font-semibold">{labelSlot(cell)}</div>
                            <div className="text-gray-600">
                              {cell.startTime}-{cell.endTime}
                            </div>
                            <div className="text-gray-500">
                              {cell.classId?.name}-{cell.classId?.section}
                              {cell.roomNumber ? ` · ${cell.roomNumber}` : ""}
                            </div>
                          </>
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
        {!weekly.length && <p className="mt-2 text-sm text-gray-500">No timetable rows assigned to you.</p>}
      </FormCard>
    </div>
  );
}

export default TeacherTimetablePage;
