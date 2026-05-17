import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BookOpen, BookOpenCheck, CircleDollarSign, Clock3, LayoutGrid, ShieldAlert } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Loader from "../../../components/Loader";
import { adminService } from "../../../services/adminService";
import { LibraryEmptyState, LibraryPageHero, LibrarySectionCard, LibraryStatCard } from "./libraryShared";

const PIE_COLORS = ["#2563eb", "#0f766e", "#7c3aed", "#f59e0b", "#ef4444", "#334155"];

function LibraryDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        setDashboard(await adminService.getLibraryDashboard());
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <Loader text="Loading library dashboard..." />;

  const stats = dashboard?.stats || {};
  const charts = dashboard?.charts || {};

  return (
    <div className="space-y-6">
      <LibraryPageHero
        title="Library operations dashboard"
        subtitle="Track inventory, borrowing patterns, overdue items, student requests, and collected fines from one premium control surface."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <LibraryStatCard icon={BookOpen} label="Total books" value={stats.totalBooks || 0} hint="Titles catalogued" tone="brand" />
        <LibraryStatCard icon={BookOpenCheck} label="Available copies" value={stats.availableBooks || 0} hint="Ready to issue" tone="emerald" />
        <LibraryStatCard icon={Clock3} label="Issued books" value={stats.issuedBooks || 0} hint="Currently out" tone="slate" />
        <LibraryStatCard icon={ShieldAlert} label="Overdue books" value={stats.overdueBooks || 0} hint="Needs follow-up" tone="rose" />
        <LibraryStatCard icon={LayoutGrid} label="Categories" value={stats.totalCategories || 0} hint="Shelf groups" tone="amber" />
        <LibraryStatCard icon={CircleDollarSign} label="Fine collected" value={`Rs ${stats.fineCollected || 0}`} hint="Recovered amount" tone="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <LibrarySectionCard title="Monthly issued books" subtitle="Issue volume across recent months." className="lg:col-span-7">
          {charts.monthlyIssuedBooks?.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyIssuedBooks}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <LibraryEmptyState title="No issue data yet" message="Issue history will populate this chart once borrowing begins." />
          )}
        </LibrarySectionCard>

        <LibrarySectionCard title="Category distribution" subtitle="How catalogued books are spread across categories." className="lg:col-span-5">
          {charts.categoryDistribution?.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={charts.categoryDistribution} dataKey="booksCount" nameKey="name" innerRadius={68} outerRadius={104} paddingAngle={4}>
                    {charts.categoryDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <LibraryEmptyState title="No categories yet" message="Create categories to start seeing shelf distribution insights." />
          )}
        </LibrarySectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <LibrarySectionCard title="Most borrowed books" subtitle="Top performers by borrowing volume." className="lg:col-span-6">
          {!charts.mostBorrowedBooks?.length ? (
            <LibraryEmptyState title="No borrowing records" message="Popular books will appear here after a few issue cycles." />
          ) : (
            <div className="space-y-3">
              {charts.mostBorrowedBooks.map((book, index) => (
                <div key={book._id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-900">{book.title}</p>
                    <p className="text-xs text-slate-500">{book.bookCode || "No code"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-950">{book.borrowCount}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Rank {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </LibrarySectionCard>

        <LibrarySectionCard title="Student borrowing analytics" subtitle="Most active student readers." className="lg:col-span-6">
          {!charts.studentBorrowingAnalytics?.length ? (
            <LibraryEmptyState title="No student borrowing yet" message="Student activity will appear as soon as books are issued." />
          ) : (
            <div className="space-y-3">
              {charts.studentBorrowingAnalytics.map((student) => (
                <div key={student.studentId} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.className || "Class not assigned"}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-bold text-white">{student.borrowCount} books</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </LibrarySectionCard>
      </div>
    </div>
  );
}

export default LibraryDashboardPage;
