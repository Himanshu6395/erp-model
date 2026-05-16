import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LayoutGrid, Megaphone, Paperclip } from "lucide-react";
import { studentService } from "../../services/studentService";
import { resolveUploadUrl } from "../../utils/apiOrigin";
import { PageHeader, PageCard, EmptyState } from "./studentPageUi";

function priorityClass(p) {
  if (p === "HIGH") return "bg-red-100 text-red-800";
  if (p === "MEDIUM") return "bg-amber-100 text-amber-900";
  return "bg-emerald-100 text-emerald-800";
}

function StudentNoticeBoardPage() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const run = async () => {
      try {
        setNotices(await studentService.getNoticeBoard());
      } catch (error) {
        toast.error(error.message);
      }
    };
    run();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader badge="Announcements" title="Notice board" subtitle="Quick view of published notices — same as under Notices." />

      <PageCard title="All notices" subtitle="Latest announcements at a glance." icon={LayoutGrid}>
        {!notices.length ? (
          <EmptyState icon={Megaphone} title="No notice-board data" message="Notices from your school will appear here." />
        ) : (
          <div className="space-y-3">
            {notices.map((item) => (
              <article key={item._id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  {item.priority && (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityClass(item.priority)}`}>{item.priority}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.description || item.message}</p>
                {item.attachmentUrl && (
                  <a
                    href={resolveUploadUrl(item.attachmentUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
                  >
                    <Paperclip className="h-4 w-4" />
                    Attachment
                  </a>
                )}
                <p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
              </article>
            ))}
          </div>
        )}
      </PageCard>
    </div>
  );
}

export default StudentNoticeBoardPage;
