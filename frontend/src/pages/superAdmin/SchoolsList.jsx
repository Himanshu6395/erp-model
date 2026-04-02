import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import SearchInput from "../../components/SearchInput";
import Pagination from "../../components/Pagination";
import { superAdminService } from "../../services/superAdminService";
import { debounce } from "../../utils/debounce";

function SchoolsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";
  const schoolType = searchParams.get("schoolType") || "";
  const board = searchParams.get("board") || "";
  const status = searchParams.get("status") || "";

  const updateQuery = (updates) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    if (!next.get("limit")) next.set("limit", "10");
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        updateQuery({ search: value, page: 1 });
      }, 400),
    [searchParams.toString()]
  );

  useEffect(() => {
    debouncedSearch(searchInput);
    return () => debouncedSearch.cancel();
  }, [searchInput, debouncedSearch]);

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      try {
        const response = await superAdminService.getSchools({
          page,
          limit,
          search,
          schoolType,
          board,
          status,
        });
        setSchools(response.data || []);
        setPagination({
          total: response.total || 0,
          page: response.page || 1,
          pages: response.pages || 1,
        });
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, [page, limit, search, schoolType, board, status]);

  if (loading) return <Loader text="Loading schools..." />;

  return (
    <div className="card overflow-hidden">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Schools List</h2>
        <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search by school name, code, city..." />
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <select className="input" value={schoolType} onChange={(e) => updateQuery({ schoolType: e.target.value, page: 1 })}>
          <option value="">All School Types</option>
          <option value="Private">Private</option>
          <option value="Government">Government</option>
          <option value="Semi-Govt">Semi-Govt</option>
        </select>
        <select className="input" value={board} onChange={(e) => updateQuery({ board: e.target.value, page: 1 })}>
          <option value="">All Boards</option>
          <option value="CBSE">CBSE</option>
          <option value="ICSE">ICSE</option>
          <option value="State Board">State Board</option>
          <option value="IB">IB</option>
        </select>
        <select className="input" value={status} onChange={(e) => updateQuery({ status: e.target.value, page: 1 })}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="input" value={limit} onChange={(e) => updateQuery({ limit: e.target.value, page: 1 })}>
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b text-left text-gray-600">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Code</th>
              <th className="py-3 pr-4">City</th>
              <th className="py-3 pr-4">Type</th>
              <th className="py-3 pr-4">Board</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school._id} className="border-b last:border-0">
                <td className="py-3 pr-4 font-medium text-gray-900">{school.name}</td>
                <td className="py-3 pr-4">{school.code}</td>
                <td className="py-3 pr-4">{school.addressDetails?.city || "-"}</td>
                <td className="py-3 pr-4">{school.basicInfo?.schoolType || "-"}</td>
                <td className="py-3 pr-4">{school.basicInfo?.affiliationBoard || "-"}</td>
                <td className="py-3 pr-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${school.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                    {school.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <Link to={`/super-admin/schools/${school._id}`} className="btn-secondary px-2 py-1 text-xs">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!schools.length && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={pagination.page}
        pages={pagination.pages}
        total={pagination.total}
        onPageChange={(nextPage) => updateQuery({ page: nextPage })}
      />
    </div>
  );
}

export default SchoolsListPage;
