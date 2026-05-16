import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ExternalLink, Link2 } from "lucide-react";
import { studentService } from "../../services/studentService";
import { PageHeader, PageCard, EmptyState, btnSecondary } from "./studentPageUi";

function StudentLinksRegistrationPage() {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    const run = async () => {
      try {
        setLinks(await studentService.getLinksRegistration());
      } catch (error) {
        toast.error(error.message);
      }
    };
    run();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader badge="Resources" title="Links & registration" subtitle="Exam registration, course registration, and external links." />

      <PageCard title="Available links" subtitle="Open links in a new tab to complete registration." icon={Link2}>
        {!links.length ? (
          <EmptyState icon={Link2} title="No registration links" message="Links from your school will appear here when available." />
        ) : (
          <div className="space-y-3">
            {links.map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900">{item.title}</div>
                  <div className="text-sm text-slate-600">{item.type}</div>
                </div>
                <a className={btnSecondary} href={item.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open link
                </a>
              </div>
            ))}
          </div>
        )}
      </PageCard>
    </div>
  );
}

export default StudentLinksRegistrationPage;
