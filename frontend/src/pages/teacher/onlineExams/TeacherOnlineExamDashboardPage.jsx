import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BookCopy, Clock3, FileCheck2, Users } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";
import Loader from "../../../components/Loader";
import { OnlineExamHero, OnlineExamSection, OnlineExamStatCard } from "../../../components/onlineExams/onlineExamUi";
import { teacherService } from "../../../services/teacherService";

const PIE_COLORS = ["#2563eb", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];

function TeacherOnlineExamDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [examRows, setExamRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardData, analyticsData, examList] = await Promise.all([
          teacherService.getOnlineExamDashboard(),
          teacherService.getOnlineExamAnalytics(),
          teacherService.getOnlineExams({ limit: 100 }),
        ]);
        setDashboard(dashboardData);
        setAnalytics(analyticsData);
        setExamRows(examList.data || []);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader text="Loading online exam dashboard..." />;

  const now = new Date();
  const upcomingCount = examRows.filter((exam) => new Date(exam.startDateTime) > now).length;
  const completedCount = examRows.filter((exam) => new Date(exam.endDateTime) < now).length;

  return (
    <div className="space-y-8">
      <OnlineExamHero
        badge="Teacher online exams"
        title="Run professional CBT exams from one control center"
        subtitle="Create class-linked exams, manage question sets, monitor live activity, and review performance from a premium teacher workspace."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <OnlineExamStatCard icon={BookCopy} label="Total Exams" value={dashboard?.stats?.totalExams || 0} hint="Created by you" />
        <OnlineExamStatCard icon={Clock3} label="Live Exams" value={dashboard?.stats?.liveExams || 0} hint="Running right now" tone="teal" />
        <OnlineExamStatCard icon={FileCheck2} label="Upcoming Exams" value={upcomingCount} hint="Scheduled next" tone="amber" />
        <OnlineExamStatCard icon={FileCheck2} label="Completed Exams" value={completedCount} hint="Already closed" tone="slate" />
        <OnlineExamStatCard
          icon={Users}
          label="Students Appeared"
          value={(analytics?.topRankings || []).length}
          hint="Top visible attempts"
          tone="rose"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <OnlineExamSection title="Exam creation trend" subtitle="Monthly online exam creation activity for your assigned classes.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard?.charts?.monthlyExamActivity || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </OnlineExamSection>

        <OnlineExamSection title="Question bank mix" subtitle="Question type distribution across your reusable online exam bank.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dashboard?.charts?.questionTypeMix || []} dataKey="count" nameKey="type" innerRadius={70} outerRadius={110} paddingAngle={3}>
                  {(dashboard?.charts?.questionTypeMix || []).map((entry, index) => (
                    <Cell key={entry.type} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </OnlineExamSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <OnlineExamSection title="Pass / fail ratio" subtitle="Result quality snapshot from submitted student attempts.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.passFailRatio || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#14b8a6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </OnlineExamSection>

        <OnlineExamSection title="Top student performances" subtitle="Highest visible scores from your recent online exams.">
          <div className="space-y-3">
            {(analytics?.topRankings || []).slice(0, 6).map((row, index) => (
              <div key={`${row.student}-${row.exam}-${index}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">{row.student}</p>
                  <p className="text-sm text-slate-500">{row.exam}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-brand-700">{row.obtainedMarks} marks</p>
                  <p className="text-sm text-slate-500">{row.percentage}%</p>
                </div>
              </div>
            ))}
            {!analytics?.topRankings?.length ? <p className="text-sm text-slate-500">Student attempts will appear here once exams are submitted.</p> : null}
          </div>
        </OnlineExamSection>
      </div>
    </div>
  );
}

export default TeacherOnlineExamDashboardPage;
