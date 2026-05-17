import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";
import Loader from "../../../components/Loader";
import { OnlineExamHero, OnlineExamSection } from "../../../components/onlineExams/onlineExamUi";
import { teacherService } from "../../../services/teacherService";

const COLORS = ["#2563eb", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];

function TeacherOnlineExamAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setAnalytics(await teacherService.getOnlineExamAnalytics());
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader text="Loading analytics..." />;

  return (
    <div className="space-y-8">
      <OnlineExamHero
        badge="Analytics"
        title="See how students perform across your online exams"
        subtitle="Understand score distribution, pass/fail movement, and the top performers from your digital assessments."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <OnlineExamSection title="Marks distribution" subtitle="Performance buckets based on student percentage.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.marksDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </OnlineExamSection>

        <OnlineExamSection title="Pass / fail ratio" subtitle="A quick reading of classroom mastery from submitted attempts.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics?.passFailRatio || []} dataKey="count" nameKey="label" innerRadius={70} outerRadius={110}>
                  {(analytics?.passFailRatio || []).map((item, index) => (
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

export default TeacherOnlineExamAnalyticsPage;
