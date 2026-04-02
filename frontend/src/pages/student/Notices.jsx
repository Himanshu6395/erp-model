import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { studentService } from "../../services/studentService";
import { resolveUploadUrl } from "../../utils/apiOrigin";

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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Notices</h2>
      <p className="text-sm text-gray-600">Published notices for students in your class. Read-only.</p>
      <div className="grid gap-4">
        {notices.map((item) => (
          <div key={item._id} className="card">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-semibold text-gray-900">{item.title}</p>
              {item.priority && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityClass(item.priority)}`}>{item.priority}</span>
              )}
              <span className="text-xs text-gray-500">{item.noticeType}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{item.description || item.message}</p>
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
            <p className="mt-2 text-xs text-gray-400">
              {item.publishDate ? new Date(item.publishDate).toLocaleString() : new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        {!notices.length && <p className="text-sm text-gray-500">No notices for you right now.</p>}
      </div>
    </div>
  );
}

export default StudentNoticesPage;
