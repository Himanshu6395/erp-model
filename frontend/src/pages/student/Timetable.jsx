import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { studentService } from "../../services/studentService";

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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">My timetable</h2>
      <div className="mb-2 flex flex-wrap gap-2 print:hidden">
        <input className="input w-40" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
        <select className="input w-44" value={filterDay} onChange={(e) => setFilterDay(e.target.value)}>
          <option value="">All days (weekly)</option>
          {DAYS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <button type="button" className="btn-secondary" onClick={() => window.print()}>
          Print
        </button>
      </div>

      <FormCard title="Class schedule" subtitle="Based on your class and section. Read-only.">
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
                            <div className="text-gray-500">{teacherName(cell)}</div>
                            {cell.roomNumber && <div className="text-gray-400">Room {cell.roomNumber}</div>}
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
        {!items.length && <div className="text-sm text-gray-500">No timetable data available.</div>}
      </FormCard>
    </div>
  );
}

export default StudentTimetablePage;
