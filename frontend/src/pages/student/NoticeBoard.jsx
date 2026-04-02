import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { studentService } from "../../services/studentService";
import { resolveUploadUrl } from "../../utils/apiOrigin";

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
    <FormCard title="Notice board" subtitle="Same published notices as under Notices — quick view.">
      <div className="space-y-3 text-sm">
        {notices.map((item) => (
          <div key={item._id} className="rounded border border-gray-100 bg-gray-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-semibold text-gray-900">{item.title}</div>
              {item.priority && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityClass(item.priority)}`}>{item.priority}</span>
              )}
            </div>
            <div className="mt-1 text-gray-600">{item.description || item.message}</div>
            {item.attachmentUrl && (
              <a href={resolveUploadUrl(item.attachmentUrl)} target="_blank" rel="noreferrer" className="mt-2 inline-block text-brand-600 hover:underline">
                Attachment
              </a>
            )}
            <div className="mt-1 text-gray-500">{new Date(item.createdAt).toLocaleString()}</div>
          </div>
        ))}
        {!notices.length && <div className="text-gray-500">No notice-board data.</div>}
      </div>
    </FormCard>
  );
}

export default StudentNoticeBoardPage;
