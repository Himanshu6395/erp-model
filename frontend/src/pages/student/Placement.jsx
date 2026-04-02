import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { studentService } from "../../services/studentService";

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
      <FormCard title="Placement Jobs" subtitle="Latest job updates and apply action.">
        <div className="space-y-2 text-sm">
          {jobs.map((job) => (
            <div key={job._id} className="rounded border border-gray-100 bg-gray-50 p-3">
              <div className="font-semibold text-gray-900">
                {job.title} {job.company ? `- ${job.company}` : ""}
              </div>
              <div className="text-gray-600">{job.description}</div>
              <div className="mt-2 flex gap-2">
                {job.applyLink && (
                  <a className="btn-secondary px-2 py-1 text-xs" href={job.applyLink} target="_blank" rel="noreferrer">
                    External Link
                  </a>
                )}
                <button className="btn-primary px-2 py-1 text-xs" type="button" onClick={() => apply(job._id)}>
                  Apply
                </button>
              </div>
            </div>
          ))}
          {!jobs.length && <div className="text-gray-500">No job updates available.</div>}
        </div>
      </FormCard>

      <FormCard title="Placement History" subtitle="Your application history.">
        <div className="space-y-2 text-sm">
          {history.map((item) => (
            <div key={item._id} className="rounded border border-gray-100 bg-gray-50 p-3">
              {item.jobId?.title || "-"} | {item.status} | {new Date(item.createdAt).toLocaleDateString()}
            </div>
          ))}
          {!history.length && <div className="text-gray-500">No placement history.</div>}
        </div>
      </FormCard>
    </div>
  );
}

export default StudentPlacementPage;
