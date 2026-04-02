import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaSearch } from "react-icons/fa";
import { superAdminOpsService } from "../../services/superAdminOpsService";

function LoginActivityPage() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "", role: "", status: "" });

  const load = async (nextFilters = filters) => {
    try {
      const params = Object.fromEntries(
        Object.entries(nextFilters).filter(([, v]) => v)
      );
      setRows(await superAdminOpsService.getLoginActivity(params));
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Login Activity</h2>
        <p className="text-sm text-gray-500">
          Monitor all authentication events across the platform
        </p>
      </div>

      {/* FILTER CARD */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">

        <div className="flex items-center gap-2 text-gray-700 font-medium">
          🔽 Filters
        </div>

        <div className="grid md:grid-cols-4 gap-4">

          <div>
            <label className="text-xs text-gray-500">From Date</label>
            <input
              type="date"
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.from}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">To Date</label>
            <input
              type="date"
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.to}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Role</label>
            <input
              placeholder="Search by role..."
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.role}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, role: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Status</label>
            <select
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

        </div>

        {/* APPLY BUTTON */}
        <button
          onClick={() => load(filters)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition"
        >
          <FaSearch /> Apply Filters
        </button>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">

            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">School</th>
                <th className="px-4 py-3 text-left">IP</th>
                <th className="px-4 py-3 text-left">Device</th>
                <th className="px-4 py-3 text-left">Login Time</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-t hover:bg-gray-50">

                  <td className="px-4 py-4 font-medium text-gray-800">
                    {row.userId?.name || row.email || "-"}
                  </td>

                  <td className="px-4 py-4">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded-md">
                      {row.role || "-"}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {row.schoolId?.name || "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {row.ipAddress || "-"}
                  </td>

                  <td className="px-4 py-4 max-w-[220px] truncate text-gray-600">
                    {row.device || "-"}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {row.timestamp
                      ? new Date(row.timestamp).toLocaleString()
                      : "-"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        row.status === "SUCCESS"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                </tr>
              ))}

              {!rows.length && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    No login activity found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
}

export default LoginActivityPage;