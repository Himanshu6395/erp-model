import { useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { teacherService } from "../../services/teacherService";

function TeacherSalaryPage() {
  const [data, setData] = useState(null);

  const load = async () => {
    try {
      setData(await teacherService.getSalaryPayslip());
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <FormCard title="Salary & Payslip" subtitle="Optional salary visibility for teacher panel.">
      <button className="btn-secondary w-fit" type="button" onClick={load}>
        Load Salary Details
      </button>
      {data && (
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>Salary: {data.salary}</div>
          <div>Bonus: {data.bonus}</div>
          <div>Deductions: {data.deductions}</div>
          <div>Net Salary: {data.netSalary}</div>
          <div>Payment Status: {data.paymentStatus}</div>
          <div>Payslip URL: {data.payslipUrl || "-"}</div>
        </div>
      )}
    </FormCard>
  );
}

export default TeacherSalaryPage;
