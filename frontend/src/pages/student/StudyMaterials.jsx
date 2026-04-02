import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { studentService } from "../../services/studentService";
import { resolveUploadUrl } from "../../utils/apiOrigin";

const TYPE_LABELS = {
  NOTES: "Notes",
  ASSIGNMENT: "Assignment",
  HOMEWORK: "Homework",
  SYLLABUS: "Syllabus",
  QUESTION_PAPER: "Question Paper",
  REFERENCE: "Reference",
};

const PRIORITY_RING = {
  HIGH: "ring-2 ring-red-200 bg-red-50",
  MEDIUM: "ring-1 ring-amber-200 bg-amber-50",
  LOW: "ring-1 ring-gray-200 bg-gray-50",
};

function youtubeId(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "") || null;
    const v = u.searchParams.get("v");
    if (v) return v;
    const m = url.match(/youtube\.com\/embed\/([^/?]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function StudentStudyMaterialsPage() {
  const [items, setItems] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [materialType, setMaterialType] = useState("");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await studentService.getStudyMaterialsStudent({});
        const m = new Map();
        (data || []).forEach((row) => {
          if (row.subjectId) m.set(String(row.subjectId), row.subjectName);
        });
        setSubjectOptions([...m.entries()].map(([id, name]) => ({ id, name })));
      } catch {
        setSubjectOptions([]);
      }
    })();
  }, []);

  const load = useCallback(async () => {
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (subjectId) params.subjectId = subjectId;
      if (materialType) params.materialType = materialType;
      const data = await studentService.getStudyMaterialsStudent(params);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message);
    }
  }, [search, subjectId, materialType]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleDownload = async (row) => {
    if (!row.allowDownload || !row.fileUrl) {
      toast.error("Download not available for this item");
      return;
    }
    try {
      const { fileUrl } = await studentService.registerStudyMaterialDownload(row._id);
      window.open(resolveUploadUrl(fileUrl), "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <FormCard title="Study materials" subtitle="Published resources for your class and section (read-only).">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <input
            className="input min-w-[200px] flex-1"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input w-full sm:w-48" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">All subjects</option>
            {subjectOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select className="input w-full sm:w-48" value={materialType} onChange={(e) => setMaterialType(e.target.value)}>
            <option value="">All types</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {items.map((row) => {
            const yt = row.externalLink ? youtubeId(row.externalLink) : null;
            const pr = PRIORITY_RING[row.priority] || PRIORITY_RING.MEDIUM;
            return (
              <article key={row._id} className={`rounded-xl p-4 ${pr}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{row.title}</h3>
                    <p className="text-sm text-gray-600">
                      {row.subjectName}
                      {row.topic ? ` · ${row.topic}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {TYPE_LABELS[row.materialType] || row.materialType}
                  </span>
                </div>
                {row.description ? <p className="mt-2 text-sm text-gray-700">{row.description}</p> : null}
                <p className="mt-2 text-xs text-gray-500">
                  Teacher: {row.teacherName || "—"} · Uploaded:{" "}
                  {row.uploadDate ? new Date(row.uploadDate).toLocaleDateString() : "—"}
                </p>
                {yt && (
                  <div className="mt-3 aspect-video w-full overflow-hidden rounded-lg bg-black">
                    <iframe
                      title={row.title}
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${yt}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {row.externalLink && (
                    <a className="btn-primary inline-flex text-sm" href={row.externalLink} target="_blank" rel="noreferrer">
                      Open link
                    </a>
                  )}
                  {row.fileUrl && /\.pdf($|\?)/i.test(row.fileUrl) && (
                    <button
                      type="button"
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800"
                      onClick={() => setPreview(resolveUploadUrl(row.fileUrl))}
                    >
                      Preview PDF
                    </button>
                  )}
                  {row.fileUrl && row.allowDownload && (
                    <button type="button" className="btn-secondary text-sm" onClick={() => handleDownload(row)}>
                      Download file
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        {!items.length && <p className="text-center text-gray-500">No study materials match your filters.</p>}
      </FormCard>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog">
          <div className="relative flex h-[85vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-xl">
            <button
              type="button"
              className="absolute right-3 top-3 z-10 rounded-full bg-gray-200 px-3 py-1 text-sm"
              onClick={() => setPreview(null)}
            >
              Close
            </button>
            <iframe title="PDF preview" className="h-full w-full flex-1 rounded-xl" src={preview} />
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentStudyMaterialsPage;
