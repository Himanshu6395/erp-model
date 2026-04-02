import { useState } from "react";
import toast from "react-hot-toast";
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
    <div className="card max-w-lg">
      <h2 className="text-2xl font-bold text-gray-900">Admit Card</h2>
      <p className="mt-2 text-sm text-gray-600">Generate and open your admit card PDF.</p>
      <button className="btn-primary mt-5" type="button" onClick={handleDownload} disabled={loading}>
        {loading ? "Generating..." : "Generate Admit Card"}
      </button>
    </div>
  );
}

export default StudentAdmitCardPage;
