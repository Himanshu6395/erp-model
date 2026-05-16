import { useState } from "react";
import toast from "react-hot-toast";
import { Download, IdCard } from "lucide-react";
import { PageHeader, PageCard, btnPrimary } from "./studentPageUi";
import { studentService } from "../../services/studentService";

function StudentAdmitCardPage() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await studentService.getAdmitCard();
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      window.open(url, "_blank");
      toast.success("Admit card opened");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader badge="Exams" title="Admit card" subtitle="Generate and open your admit card PDF for upcoming examinations." />

      <PageCard title="Download admit card" subtitle="Your admit card will open in a new browser tab as a PDF." icon={IdCard} className="max-w-lg">
        <button className={btnPrimary} type="button" onClick={handleDownload} disabled={loading}>
          <Download className="h-4 w-4" />
          {loading ? "Generating…" : "Generate admit card"}
        </button>
      </PageCard>
    </div>
  );
}

export default StudentAdmitCardPage;
