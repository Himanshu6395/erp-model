import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";

const currentMonthStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

function isFutureLocalDate(y, m, day) {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const d = new Date(y, m - 1, day, 0, 0, 0, 0);
  return d > t;
}

function CellSymbol({ status }) {
  if (!status) return <span className="text-gray-200">·</span>;
  if (status === "present") return <span className="text-green-600">✔</span>;
  if (status === "absent") return <span className="text-red-600">❌</span>;
  if (status === "leave") return <span className="rounded bg-yellow-100 px-0.5 text-yellow-800">L</span>;
  if (status === "late") return <span className="text-orange-600">⏰</span>;
  return <span>—</span>;
}

function todayDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

const STATUS_BTNS = [
  { value: "PRESENT", icon: "✔", title: "Present", active: "bg-green-600 text-white ring-2 ring-green-800 shadow", idle: "bg-green-50 text-green-800 hover:bg-green-100" },
  { value: "ABSENT", icon: "❌", title: "Absent", active: "bg-red-600 text-white ring-2 ring-red-800 shadow", idle: "bg-red-50 text-red-800 hover:bg-red-100" },
  { value: "LEAVE", icon: "L", title: "Leave", active: "bg-yellow-500 text-white ring-2 ring-yellow-700 shadow", idle: "bg-yellow-50 text-yellow-900 hover:bg-yellow-100" },
  { value: "LATE", icon: "⏰", title: "Late", active: "bg-orange-500 text-white ring-2 ring-orange-700 shadow", idle: "bg-orange-50 text-orange-900 hover:bg-orange-100" },
];

function TeacherAttendancePage() {
  const [viewMode, setViewMode] = useState("daily");
  const [assigned, setAssigned] = useState([]);
  const [dailyDate, setDailyDate] = useState(todayDateStr);
  const [roster, setRoster] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [rosterLoading, setRosterLoading] = useState(false);
  const [saveAllLoading, setSaveAllLoading] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [reportQuery, setReportQuery] = useState({ from: "", to: "", day: "" });
  const [report, setReport] = useState(null);

  const [gridClassId, setGridClassId] = useState("");
  const [gridSection, setGridSection] = useState("");
  const [gridMonth, setGridMonth] = useState(currentMonthStr);
  const [gridPage, setGridPage] = useState(1);
  const [gridLimit] = useState(50);
  const [gridData, setGridData] = useState(null);
  const [gridLoading, setGridLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editPayload, setEditPayload] = useState({ studentId: "", date: "", status: "PRESENT", remark: "", studentName: "", dayNum: "" });

  useEffect(() => {
    (async () => {
      try {
        const rows = await teacherService.getAssignedClassesWithSubjects();
        setAssigned(Array.isArray(rows) ? rows : []);
        if (rows?.length && !gridClassId) {
          const first = rows[0];
          setGridClassId(String(first.classId));
          setGridSection(String(first.section || ""));
        }
      } catch (e) {
        toast.error(e.message);
      }
    })();
  }, []);

  const classOptions = useMemo(() => {
    const map = new Map();
    assigned.forEach((r) => {
      const key = `${r.classId}|${r.section || ""}`;
      if (!map.has(key)) map.set(key, { classId: String(r.classId), section: String(r.section || ""), label: r.label || `${r.className} — Sec ${r.section}` });
    });
    return [...map.values()];
  }, [assigned]);

  const loadGrid = useCallback(async () => {
    if (!gridClassId || !gridSection || !gridMonth) return;
    setGridLoading(true);
    try {
      const data = await teacherService.getMonthlyAttendanceGrid({
        classId: gridClassId,
        section: gridSection,
        month: gridMonth,
        page: gridPage,
        limit: gridLimit,
      });
      setGridData(data);
    } catch (e) {
      toast.error(e.message);
      setGridData(null);
    } finally {
      setGridLoading(false);
    }
  }, [gridClassId, gridSection, gridMonth, gridPage, gridLimit]);

  useEffect(() => {
    if (viewMode === "monthly") loadGrid();
  }, [viewMode, loadGrid]);

  const loadDailyRoster = useCallback(async () => {
    if (!gridClassId || !gridSection) return;
    setRosterLoading(true);
    try {
      const data = await teacherService.getDailyAttendanceRoster({
        classId: gridClassId,
        section: gridSection,
        date: dailyDate,
      });
      setRoster(data.students || []);
      const m = {};
      for (const s of data.students || []) {
        const id = String(s.studentId);
        m[id] = s.status ? String(s.status).toUpperCase() : "PRESENT";
      }
      setStatusMap(m);
    } catch (e) {
      toast.error(e.message);
      setRoster([]);
      setStatusMap({});
    } finally {
      setRosterLoading(false);
    }
  }, [gridClassId, gridSection, dailyDate]);

  useEffect(() => {
    if (viewMode === "daily" && gridClassId && gridSection) loadDailyRoster();
  }, [viewMode, gridClassId, gridSection, dailyDate, loadDailyRoster]);

  const setStudentStatus = (studentId, status) => {
    setStatusMap((p) => ({ ...p, [String(studentId)]: status }));
  };

  const markAllPresent = () => {
    const m = { ...statusMap };
    roster.forEach((s) => {
      m[String(s.studentId)] = "PRESENT";
    });
    setStatusMap(m);
  };

  const markAllAbsent = () => {
    const m = { ...statusMap };
    roster.forEach((s) => {
      m[String(s.studentId)] = "ABSENT";
    });
    setStatusMap(m);
  };

  const saveAllAttendance = async () => {
    if (!roster.length) {
      toast.error("No students to save");
      return;
    }
    if (dailyDate > todayDateStr()) {
      toast.error("Cannot save attendance for a future date");
      return;
    }
    setSaveAllLoading(true);
    try {
      const entries = roster.map((s) => ({
        studentId: s.studentId,
        status: statusMap[String(s.studentId)] || "PRESENT",
      }));
      await teacherService.saveDailyAttendanceBatch({
        classId: gridClassId,
        section: gridSection,
        date: dailyDate,
        entries,
      });
      toast.success(`Saved attendance for ${entries.length} students`);
      loadDailyRoster();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaveAllLoading(false);
    }
  };

  const maxDateStr = todayDateStr();

  const dayColumns = useMemo(() => {
    const n = gridData?.daysInMonth || 31;
    return Array.from({ length: n }, (_, i) => i + 1);
  }, [gridData?.daysInMonth]);

  const openCellEdit = (row, day) => {
    if (!gridData) return;
    const y = gridData.year;
    const m = gridData.month;
    if (isFutureLocalDate(y, m, day)) {
      toast.error("Cannot mark attendance for a future date");
      return;
    }
    const iso = `${y}-${pad2(m)}-${pad2(day)}`;
    const key = row.attendance[String(day)];
    let status = "PRESENT";
    if (key === "absent") status = "ABSENT";
    else if (key === "leave") status = "LEAVE";
    else if (key === "late") status = "LATE";
    else if (key === "present") status = "PRESENT";
    setEditPayload({
      studentId: String(row.studentId),
      date: iso,
      status,
      remark: "",
      studentName: row.name,
      dayNum: String(day),
    });
    setEditOpen(true);
  };

  const saveCell = async () => {
    try {
      await teacherService.markAttendance({
        studentId: editPayload.studentId,
        date: editPayload.date,
        status: editPayload.status,
        remark: editPayload.remark,
      });
      toast.success("Attendance saved");
      setEditOpen(false);
      loadGrid();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const exportCsv = () => {
    if (!gridData?.rows?.length) {
      toast.error("No rows to export");
      return;
    }
    const days = dayColumns;
    const header = ["Roll", "Name", ...days.map(String), "TotalDays", "Present", "Absent", "Leave", "Late", "%"];
    const lines = [header.join(",")];
    for (const row of gridData.rows) {
      const cells = days.map((d) => row.attendance[String(d)] || "");
      lines.push(
        [JSON.stringify(row.rollNumber || ""), JSON.stringify(row.name || ""), ...cells, row.totalDays, row.presentCount, row.absentCount, row.leaveCount, row.lateCount, row.percentage].join(
          ","
        )
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `attendance-${gridData.monthLabel}-${gridSection}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("CSV downloaded");
  };

  const printSheet = () => window.print();

  const submitBulk = async () => {
    try {
      const entries = bulkText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [studentId, date, status, remark] = line.split(",").map((item) => item.trim());
          return { studentId, date, status, remark: remark || "" };
        });
      const data = await teacherService.bulkMarkAttendance(entries);
      toast.success(`Bulk attendance marked: ${data.markedCount}`);
      setBulkText("");
      if (viewMode === "monthly") loadGrid();
      if (viewMode === "daily") loadDailyRoster();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadReport = async () => {
    try {
      const data = await teacherService.getAttendanceReports(reportQuery);
      setReport(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const summary = gridData?.summary;
  const fromIdx = gridData ? (gridData.page - 1) * gridData.limit + 1 : 0;
  const toIdx = gridData ? Math.min(gridData.page * gridData.limit, gridData.totalStudents) : 0;

  return (
    <div className="space-y-6 print:space-y-2">
      <div className="no-print flex flex-wrap gap-2">
        <button
          type="button"
          className={viewMode === "daily" ? "btn-primary" : "btn-secondary"}
          onClick={() => setViewMode("daily")}
        >
          Daily view
        </button>
        <button
          type="button"
          className={viewMode === "monthly" ? "btn-primary" : "btn-secondary"}
          onClick={() => setViewMode("monthly")}
        >
          Monthly grid (register)
        </button>
      </div>

      {viewMode === "daily" && (
        <>
          <FormCard
            title="Daily attendance"
            subtitle="Students load from your assigned class. Tap a status per student — everyone defaults to Present until you change them. One save updates the whole class for the selected date."
          >
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">Class &amp; section</span>
                <select
                  className="input max-w-md"
                  value={`${gridClassId}|${gridSection}`}
                  onChange={(e) => {
                    const opt = classOptions.find((o) => `${o.classId}|${o.section}` === e.target.value);
                    if (opt) {
                      setGridClassId(opt.classId);
                      setGridSection(opt.section);
                      setGridPage(1);
                    }
                  }}
                >
                  {classOptions.map((o) => (
                    <option key={`${o.classId}|${o.section}`} value={`${o.classId}|${o.section}`}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">Date</span>
                <input className="input w-44" type="date" max={maxDateStr} value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} />
              </div>
              <button type="button" className="btn-secondary" onClick={() => loadDailyRoster()} disabled={rosterLoading || !gridClassId}>
                {rosterLoading ? "Loading…" : "Refresh list"}
              </button>
              <button type="button" className="rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-900 hover:bg-green-200" onClick={markAllPresent}>
                Mark all present
              </button>
              <button type="button" className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-900 hover:bg-red-200" onClick={markAllAbsent}>
                Mark all absent
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={saveAllAttendance}
                disabled={saveAllLoading || rosterLoading || !roster.length || dailyDate > maxDateStr}
              >
                {saveAllLoading ? "Saving…" : "Save all attendance"}
              </button>
            </div>

            {!classOptions.length && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                No class is assigned to your profile. Ask the school admin to map you as class teacher or assign subjects.
              </p>
            )}

            <div className="mt-4 max-h-[min(70vh,720px)] overflow-auto rounded-lg border border-gray-200">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <th className="sticky left-0 top-0 z-20 min-w-[4.5rem] border-r border-gray-200 bg-gray-100 px-3 py-3">Roll</th>
                    <th className="sticky left-[4.5rem] top-0 z-20 min-w-[11rem] border-r border-gray-200 bg-gray-100 px-3 py-3">Student</th>
                    <th className="sticky top-0 z-10 bg-gray-100 px-2 py-3 text-center">Present ✔</th>
                    <th className="sticky top-0 z-10 bg-gray-100 px-2 py-3 text-center">Absent ❌</th>
                    <th className="sticky top-0 z-10 bg-gray-100 px-2 py-3 text-center">Leave L</th>
                    <th className="sticky top-0 z-10 bg-gray-100 px-2 py-3 text-center">Late ⏰</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((s) => {
                    const id = String(s.studentId);
                    const cur = statusMap[id] || "PRESENT";
                    return (
                      <tr key={id} className="border-b border-gray-100 hover:bg-gray-50/80">
                        <td className="sticky left-0 z-10 border-r border-gray-100 bg-white px-3 py-2 font-medium">{s.rollNumber}</td>
                        <td className="sticky left-[4.5rem] z-10 border-r border-gray-100 bg-white px-3 py-2">{s.name}</td>
                        {STATUS_BTNS.map((b) => (
                          <td key={b.value} className="p-1 text-center">
                            <button
                              type="button"
                              title={b.title}
                              onClick={() => setStudentStatus(s.studentId, b.value)}
                              className={`h-10 w-full min-w-[2.75rem] rounded-lg text-base font-medium transition ${cur === b.value ? b.active : b.idle}`}
                            >
                              {b.icon}
                            </button>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {!rosterLoading && classOptions.length > 0 && roster.length === 0 && (
                <p className="p-6 text-center text-gray-500">No students in this class and section.</p>
              )}
            </div>
          </FormCard>

          <FormCard title="Advanced: CSV import" subtitle="Optional — one line per row: studentId,date,status,remark">
            <button type="button" className="btn-secondary mb-2 text-sm" onClick={() => setShowCsvImport((v) => !v)}>
              {showCsvImport ? "Hide" : "Show"} CSV paste
            </button>
            {showCsvImport && (
              <>
                <textarea className="input min-h-28" value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder="studentId,2026-03-29,PRESENT," />
                <button className="btn-secondary mt-3 w-fit" type="button" onClick={submitBulk}>
                  Submit bulk (legacy)
                </button>
              </>
            )}
          </FormCard>

          <FormCard title="Attendance Reports" subtitle="Daily, monthly and class-wise summaries.">
            <div className="grid gap-3 sm:grid-cols-4">
              <input className="input" type="date" value={reportQuery.from} onChange={(e) => setReportQuery((p) => ({ ...p, from: e.target.value }))} />
              <input className="input" type="date" value={reportQuery.to} onChange={(e) => setReportQuery((p) => ({ ...p, to: e.target.value }))} />
              <input className="input" type="date" value={reportQuery.day} onChange={(e) => setReportQuery((p) => ({ ...p, day: e.target.value }))} />
              <button className="btn-secondary" type="button" onClick={loadReport}>
                Load Reports
              </button>
            </div>
            {report && (
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div className="rounded border border-gray-100 bg-gray-50 p-3 text-sm">Daily records: {report.daily?.length || 0}</div>
                <div className="rounded border border-gray-100 bg-gray-50 p-3 text-sm">Monthly records: {report.monthly?.length || 0}</div>
                <div className="rounded border border-gray-100 bg-gray-50 p-3 text-sm">Class groups: {Object.keys(report.classWise || {}).length}</div>
              </div>
            )}
          </FormCard>
        </>
      )}

      {viewMode === "monthly" && (
        <div id="attendance-print-root">
          <FormCard
            title="Monthly attendance register"
            subtitle="Scroll horizontally for all days. Click a cell to edit. ✔ present · ❌ absent · L leave · ⏰ late."
          >
            <div className="no-print mb-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
              <select
                className="input max-w-md"
                value={`${gridClassId}|${gridSection}`}
                onChange={(e) => {
                  const opt = classOptions.find((o) => `${o.classId}|${o.section}` === e.target.value);
                  if (opt) {
                    setGridClassId(opt.classId);
                    setGridSection(opt.section);
                    setGridPage(1);
                  }
                }}
              >
                {classOptions.map((o) => (
                  <option key={`${o.classId}|${o.section}`} value={`${o.classId}|${o.section}`}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input className="input w-44" type="month" value={gridMonth} onChange={(e) => { setGridMonth(e.target.value); setGridPage(1); }} />
              <button className="btn-secondary" type="button" onClick={() => loadGrid()} disabled={gridLoading}>
                {gridLoading ? "Loading…" : "Refresh"}
              </button>
              <button className="btn-secondary" type="button" onClick={exportCsv} disabled={!gridData?.rows?.length}>
                Export CSV
              </button>
              <button className="btn-secondary" type="button" onClick={printSheet} disabled={!gridData?.rows?.length}>
                Print / Save PDF
              </button>
            </div>

            {summary && (
              <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-medium text-gray-500">Total students (class)</div>
                  <div className="text-2xl font-bold text-gray-900">{summary.totalStudents}</div>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm">
                  <div className="text-xs font-medium text-green-800">Present today</div>
                  <div className="text-2xl font-bold text-green-900">{summary.presentToday}</div>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
                  <div className="text-xs font-medium text-red-800">Absent today</div>
                  <div className="text-2xl font-bold text-red-900">{summary.absentToday}</div>
                </div>
                <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 shadow-sm">
                  <div className="text-xs font-medium text-brand-800">Attendance % (today)</div>
                  <div className="text-2xl font-bold text-brand-900">{summary.attendancePercentToday}%</div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-gray-200 print:border-0">
              <table className="min-w-max border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <th className="sticky left-0 z-30 min-w-[4rem] border-b border-r border-gray-200 bg-gray-100 px-2 py-2 print:static">Roll</th>
                    <th className="sticky left-[4rem] z-30 min-w-[10rem] border-b border-r border-gray-200 bg-gray-100 px-2 py-2 print:static">
                      Name
                    </th>
                    {dayColumns.map((d) => (
                      <th
                        key={d}
                        className="sticky top-0 z-20 min-w-[2.25rem] border-b border-gray-200 bg-gray-100 px-0.5 py-2 text-center print:static"
                      >
                        {d}
                      </th>
                    ))}
                    <th className="sticky top-0 z-20 min-w-[3.5rem] border-b border-gray-200 bg-gray-100 px-1 py-2 text-center">Σ</th>
                    <th className="sticky top-0 z-20 min-w-[3rem] border-b border-gray-200 bg-gray-100 px-1 py-2 text-center">P</th>
                    <th className="sticky top-0 z-20 min-w-[3rem] border-b border-gray-200 bg-gray-100 px-1 py-2 text-center">A</th>
                    <th className="sticky top-0 z-20 min-w-[3rem] border-b border-gray-200 bg-gray-100 px-1 py-2 text-center">%</th>
                  </tr>
                </thead>
                <tbody>
                  {gridData?.rows?.map((row) => (
                    <tr key={row.studentId} className="border-b border-gray-100 hover:bg-gray-50/80">
                      <td className="sticky left-0 z-10 border-r border-gray-100 bg-white px-2 py-1 font-medium print:static">{row.rollNumber}</td>
                      <td className="sticky left-[4rem] z-10 border-r border-gray-100 bg-white px-2 py-1 print:static">{row.name}</td>
                      {dayColumns.map((d) => {
                        const st = row.attendance[String(d)];
                        const fut = gridData && isFutureLocalDate(gridData.year, gridData.month, d);
                        return (
                          <td key={d} className="border-r border-gray-50 px-0 py-0 text-center">
                            <button
                              type="button"
                              disabled={fut}
                              className={`h-8 w-full text-xs disabled:cursor-not-allowed disabled:opacity-40 ${st ? "bg-gray-50" : ""}`}
                              onClick={() => openCellEdit(row, d)}
                              title={fut ? "Future date" : "Click to edit"}
                            >
                              <CellSymbol status={st} />
                            </button>
                          </td>
                        );
                      })}
                      <td className="bg-gray-50/50 px-1 text-center text-xs text-gray-700">{row.totalDays}</td>
                      <td className="bg-green-50/50 px-1 text-center text-xs font-medium text-green-800">{row.presentCount}</td>
                      <td className="bg-red-50/50 px-1 text-center text-xs font-medium text-red-800">{row.absentCount}</td>
                      <td className="bg-brand-50/50 px-1 text-center text-xs font-medium">{row.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!gridLoading && (!gridData?.rows || gridData.rows.length === 0) && (
                <p className="p-6 text-center text-gray-500">No students on this page or no class selected.</p>
              )}
            </div>

            {gridData && gridData.totalPages > 1 && (
              <div className="no-print mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
                <span>
                  Showing {fromIdx}–{toIdx} of {gridData.totalStudents} students
                </span>
                <div className="flex gap-2">
                  <button type="button" className="btn-secondary px-3 py-1 text-xs" disabled={gridPage <= 1} onClick={() => setGridPage((p) => p - 1)}>
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn-secondary px-3 py-1 text-xs"
                    disabled={gridPage >= gridData.totalPages}
                    onClick={() => setGridPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </FormCard>
        </div>
      )}

      {editOpen && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog">
          <div className="card max-w-md">
            <h3 className="text-lg font-bold text-gray-900">Edit attendance</h3>
            <p className="mt-1 text-sm text-gray-600">
              {editPayload.studentName} · {editPayload.date}
            </p>
            <select className="input mt-3" value={editPayload.status} onChange={(e) => setEditPayload((p) => ({ ...p, status: e.target.value }))}>
              <option value="PRESENT">PRESENT</option>
              <option value="ABSENT">ABSENT</option>
              <option value="LEAVE">LEAVE</option>
              <option value="LATE">LATE</option>
            </select>
            <input
              className="input mt-2"
              placeholder="Remark"
              value={editPayload.remark}
              onChange={(e) => setEditPayload((p) => ({ ...p, remark: e.target.value }))}
            />
            <div className="mt-4 flex gap-2">
              <button type="button" className="btn-primary" onClick={saveCell}>
                Save
              </button>
              <button type="button" className="btn-secondary" onClick={() => setEditOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          #attendance-print-root { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}

export default TeacherAttendancePage;
