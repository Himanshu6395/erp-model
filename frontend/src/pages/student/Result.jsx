import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Award, GraduationCap, Percent } from "lucide-react";
import Loader from "../../components/Loader";
import { studentService } from "../../services/studentService";
import { PageHeader, GlassStat, PageCard, DataTable, EmptyState } from "./studentPageUi";

function StudentResultPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await studentService.getResult();
        setData(result);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader text="Loading result..." />;

  const subjects = data?.subjects || [];

  return (
    <div className="space-y-6">
      <PageHeader badge="Academics" title="Exam results" subtitle="Subject-wise marks and overall performance." />

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassStat icon={Award} label="Total marks" value={data?.totalMarks || 0} gradient="from-brand-600 to-indigo-600" />
        <GlassStat icon={Percent} label="Percentage" value={`${data?.percentage || 0}%`} gradient="from-emerald-600 to-teal-600" />
      </div>

      <PageCard title="Subject breakdown" subtitle="Marks and grades per subject." icon={GraduationCap}>
        {!subjects.length ? (
          <EmptyState icon={GraduationCap} title="No results found" message="Results will appear after exams are published." />
        ) : (
          <DataTable>
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Marks</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((item) => (
                  <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900">{item.subject}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {item.marks}/{item.totalMarks || 100}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.grade || "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{item.percentage || 0}%</td>
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

export default StudentResultPage;
