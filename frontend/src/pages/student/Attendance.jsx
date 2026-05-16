import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarCheck, CheckCircle2, Percent, XCircle } from "lucide-react";
import Loader from "../../components/Loader";
import { studentService } from "../../services/studentService";
import { PageHeader, GlassStat, PageCard, DataTable, EmptyState } from "./studentPageUi";

function StudentAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await studentService.getAttendance();
        setData(result);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader text="Loading attendance..." />;

  const summary = data?.summary || {};
  const rows = data?.attendance || [];

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Academics"
        title="Attendance"
        subtitle="Your daily attendance records and overall percentage."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassStat icon={CalendarCheck} label="Total days" value={summary.totalDays || 0} gradient="from-slate-600 to-slate-800" />
        <GlassStat icon={CheckCircle2} label="Present" value={summary.presentDays || 0} gradient="from-emerald-600 to-teal-600" />
        <GlassStat icon={XCircle} label="Absent" value={(summary.totalDays || 0) - (summary.presentDays || 0)} gradient="from-rose-600 to-red-600" />
        <GlassStat icon={Percent} label="Percentage" value={`${summary.percentage || 0}%`} gradient="from-brand-600 to-indigo-600" />
      </div>

      <PageCard title="Attendance log" subtitle="Subject-wise records marked by teachers." icon={CalendarCheck}>
        {!rows.length ? (
          <EmptyState icon={CalendarCheck} title="No attendance records" message="Records will appear once teachers mark your attendance." />
        ) : (
          <DataTable>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Marked by</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-800">{new Date(item.date).toLocaleDateString()}</td>
                    <td className={`px-4 py-3 font-semibold ${item.status === "PRESENT" ? "text-emerald-600" : "text-rose-600"}`}>
                      {item.status}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.subject || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{item.markedBy?.userId?.name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        )}
      </PageCard>
    </div>
  );
}

export default StudentAttendancePage;
