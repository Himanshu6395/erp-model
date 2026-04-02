import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FormCard from "../../components/FormCard";
import { studentService } from "../../services/studentService";

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
    <FormCard title="Links / Registration" subtitle="Exam registration, course registration and external links.">
      <div className="space-y-3 text-sm">
        {links.map((item) => (
          <div key={item._id} className="rounded border border-gray-100 bg-gray-50 p-3">
            <div className="font-semibold text-gray-900">{item.title}</div>
            <div className="text-gray-600">{item.type}</div>
            <a className="text-brand-700 underline" href={item.url} target="_blank" rel="noreferrer">
              Open Link
            </a>
          </div>
        ))}
        {!links.length && <div className="text-gray-500">No registration links available.</div>}
      </div>
    </FormCard>
  );
}

export default StudentLinksRegistrationPage;
