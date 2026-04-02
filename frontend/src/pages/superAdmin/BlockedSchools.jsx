import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { superAdminOpsService } from "../../services/superAdminOpsService";

function BlockedSchoolsPage() {
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      const res = await superAdminOpsService.getBlockedSchools();
      setRows(res?.data || res); // handle both formats
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unblock = async (schoolId) => {
    try {
      await superAdminOpsService.unblockSchool(schoolId);
      toast.success("School unblocked");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h2 className="text-2xl font-bold text-gray-800">Blocked Schools</h2>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">

            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="py-3 px-4">School</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Admin</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Blocked At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-t hover:bg-gray-50">

                  {/* School */}
                  <td className="py-4 px-4">
                    <p className="font-semibold text-gray-800">
                      {row.basicInfo?.schoolName || row.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Code: {row.basicInfo?.schoolCode || row.code}
                    </p>
                  </td>

                  {/* Location */}
                  <td className="py-4 px-4 text-gray-600">
                    {row.addressDetails?.city}, {row.addressDetails?.state}
                  </td>

                  {/* Admin */}
                  <td className="py-4 px-4">
                    <p className="text-gray-800 text-sm">
                      {row.schoolAdmin?.adminName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {row.schoolAdmin?.adminEmail}
                    </p>
                  </td>

                  {/* Reason */}
                  <td className="py-4 px-4 text-gray-600">
                    {row.security?.blockedReason || "Manual"}
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-gray-600">
                    {row.security?.blockedAt
                      ? new Date(row.security.blockedAt).toLocaleString()
                      : "-"}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600 font-medium">
                      Blocked
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => unblock(row._id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                    >
                      Unblock
                    </button>
                  </td>

                </tr>
              ))}

              {!rows.length && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    No blocked schools found.
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

export default BlockedSchoolsPage;