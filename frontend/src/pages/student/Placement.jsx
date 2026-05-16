import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Briefcase, ExternalLink, History } from "lucide-react";
import { studentService } from "../../services/studentService";
import { PageHeader, PageCard, EmptyState, btnPrimary, btnSecondary } from "./studentPageUi";

function StudentPlacementPage() {
  const [jobs, setJobs] = useState([]);
  const [history, setHistory] = useState([]);

  const load = async () => {
    try {
      const [jobRows, historyRows] = await Promise.all([studentService.getPlacementJobs(), studentService.getPlacementHistory()]);
      setJobs(jobRows);
      setHistory(historyRows);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const apply = async (jobId) => {
    try {
      await studentService.applyPlacement({ jobId });
      toast.success("Applied successfully");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader badge="Career" title="Placement" subtitle="Browse job openings and track your applications." />

      <PageCard title="Placement jobs" subtitle="Latest job updates and apply action." icon={Briefcase}>
        {!jobs.length ? (
          <EmptyState icon={Briefcase} title="No job updates" message="New placement opportunities will appear here." />
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job._id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="font-semibold text-slate-900">
                  {job.title}
                  {job.company ? ` — ${job.company}` : ""}
                </div>
                <p className="mt-1 text-sm text-slate-600">{job.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.applyLink && (
                    <a className={btnSecondary} href={job.applyLink} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      External link
                    </a>
                  )}
                  <button className={btnPrimary} type="button" onClick={() => apply(job._id)}>
                    Apply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageCard>

      <PageCard title="Placement history" subtitle="Your application history." icon={History}>
        {!history.length ? (
          <EmptyState icon={History} title="No placement history" message="Your job applications will appear here." />
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item._id} className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-700">
                {item.jobId?.title || "—"} · {item.status} · {new Date(item.createdAt).toLocaleDateString()}
              </div>
            ))}
          </div>
        )}
      </PageCard>
    </div>
  );
}

export default StudentPlacementPage;
