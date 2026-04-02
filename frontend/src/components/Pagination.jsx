function Pagination({ page, pages, total, onPageChange }) {
  const pageButtons = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, page + 2);
  for (let p = start; p <= end; p += 1) pageButtons.push(p);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-gray-600">
        Page {page} of {pages} | Total {total} records
      </p>
      <div className="flex items-center gap-2">
        <button className="btn-secondary px-3 py-1.5 text-sm" type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        {pageButtons.map((p) => (
          <button
            key={p}
            className={`rounded-lg px-3 py-1.5 text-sm ${p === page ? "bg-brand-600 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"}`}
            type="button"
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        <button className="btn-secondary px-3 py-1.5 text-sm" type="button" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
