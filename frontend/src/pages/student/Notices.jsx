import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Megaphone, Paperclip } from "lucide-react";
import Loader from "../../components/Loader";
import { studentService } from "../../services/studentService";
import { resolveUploadUrl } from "../../utils/apiOrigin";
import { PageHeader, PageCard, EmptyState } from "./studentPageUi";

function priorityClass(p) {
  if (p === "HIGH") return "bg-red-100 text-red-800";
  if (p === "MEDIUM") return "bg-amber-100 text-amber-900";
  return "bg-emerald-100 text-emerald-800";
}

function StudentNoticesPage() {
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setNotices(await studentService.getNoticesStudent());
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader text="Loading notices..." />;

  return (
    <div className="space-y-6">
      <PageHeader badge="Announcements" title="Notices" subtitle="Published notices for students in your class. Read-only." />

      {!notices.length ? (
        <EmptyState icon={Megaphone} title="No notices right now" message="Important announcements from your school will appear here." />
      ) : (
        <div className="grid gap-4">
          {notices.map((item) => (
            <PageCard key={item._id} title={item.title} icon={Megaphone}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {item.priority && (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityClass(item.priority)}`}>{item.priority}</span>
                )}
                <span className="text-xs font-medium text-slate-500">{item.noticeType}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{item.description || item.message}</p>
              {item.attachmentUrl && (
                <a
                  href={resolveUploadUrl(item.attachmentUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
                >
                  <Paperclip className="h-4 w-4" />
                  Download attachment
                </a>
              )}
              <p className="mt-3 text-xs text-slate-400">
                {item.publishDate ? new Date(item.publishDate).toLocaleString() : new Date(item.createdAt).toLocaleString()}
              </p>
            </PageCard>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentNoticesPage;
