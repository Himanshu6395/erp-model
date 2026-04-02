import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";
import { resolveUploadUrl } from "../../utils/apiOrigin";

function priorityClass(p) {
  if (p === "HIGH") return "bg-red-100 text-red-800";
  if (p === "MEDIUM") return "bg-amber-100 text-amber-900";
  return "bg-emerald-100 text-emerald-800";
}

function TeacherAnnouncementsPage() {
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      setItems(await teacherService.getTeacherNotices());
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <FormCard title="School notices" subtitle="Notices published by your school admin for teachers. Read-only.">
        <div className="space-y-3 text-sm">
          {items.map((item) => (
            <div key={item._id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-semibold text-gray-900">{item.title}</div>
                {item.priority && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityClass(item.priority)}`}>{item.priority}</span>
                )}
                <span className="text-xs text-gray-500">{item.noticeType}</span>
              </div>
              <div className="mt-2 whitespace-pre-wrap text-gray-700">{item.description || item.message}</div>
              {item.attachmentUrl && (
                <a
                  href={resolveUploadUrl(item.attachmentUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
                >
                  Download attachment
                </a>
              )}
              <div className="mt-2 text-xs text-gray-400">
                {item.publishDate ? new Date(item.publishDate).toLocaleString() : new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
          {!items.length && <div className="text-gray-500">No notices for teachers.</div>}
        </div>
      </FormCard>
    </div>
  );
}

export default TeacherAnnouncementsPage;
