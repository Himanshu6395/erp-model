import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";
import Loader from "../../../components/Loader";
import { OnlineExamHero, OnlineExamSection } from "../../../components/onlineExams/onlineExamUi";
import { studentService } from "../../../services/studentService";

const COLORS = ["#2563eb", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];

function StudentOnlineExamPerformancePage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setRows(await studentService.getOnlineExamResults());
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const subjectPerformance = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const key = row.examId?.subjectName || "General";
      const current = map.get(key) || { subject: key, exams: 0, average: 0 };
      current.exams += 1;
      current.average += Number(row.percentage || 0);
      map.set(key, current);
    });
    return [...map.values()].map((item) => ({ ...item, average: Number((item.average / item.exams).toFixed(2)) }));
  }, [rows]);

  const passFail = useMemo(() => {
    const passed = rows.filter((row) => row.passed).length;
    return [
      { label: "Passed", count: passed },
      { label: "Failed", count: rows.length - passed },
    ];
  }, [rows]);

  if (loading) return <Loader text="Loading performance analytics..." />;

  return (
    <div className="space-y-8">
      <OnlineExamHero badge="Performance" title="Understand how you are doing across online exams" subtitle="Track subject averages, pass ratio, and progress trends from your published CBT results." />
      <div className="grid gap-6 xl:grid-cols-2">
        <OnlineExamSection title="Subject-wise performance" subtitle="Average percentage per subject from published exam results.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="#2563eb" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </OnlineExamSection>
        <OnlineExamSection title="Pass / fail ratio" subtitle="Overall result quality from all visible online exam attempts.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={passFail} dataKey="count" nameKey="label" innerRadius={70} outerRadius={110}>
                  {passFail.map((item, index) => (
                    <Cell key={item.label} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </OnlineExamSection>
      </div>
    </div>
  );
}

export default StudentOnlineExamPerformancePage;
