import { useEffect, useState } from "react";
import { FaSchool, FaUserShield } from "react-icons/fa";
import Loader from "../../components/Loader";
import StatCard from "../../components/StatCard";
import { superAdminService } from "../../services/superAdminService";

function SuperAdminDashboard() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await superAdminService.getSchools({ page: 1, limit: 5 });
        setSchools(response.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard icon={<FaSchool />} title="Total Schools" value={schools.length} />
        <StatCard icon={<FaUserShield />} title="Management" value="Centralized" subtitle="Role-based access enabled" />
      </div>
      <div className="card">
        <h3 className="mb-4 text-lg font-semibold">Recent Schools</h3>
        <div className="space-y-3">
          {schools.slice(0, 5).map((school) => (
            <div key={school._id} className="rounded-lg border border-gray-100 p-3">
              <p className="font-semibold text-gray-800">{school.name}</p>
              <p className="text-sm text-gray-500">Code: {school.code}</p>
            </div>
          ))}
          {!schools.length && <p className="text-sm text-gray-500">No schools yet.</p>}
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
