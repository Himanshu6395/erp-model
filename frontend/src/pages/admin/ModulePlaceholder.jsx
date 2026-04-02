function ModulePlaceholder({ title, description }) {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
        This module is scaffolded in the navigation and architecture. Extend this page with role-based APIs and UI workflows as needed.
      </div>
    </div>
  );
}

export default ModulePlaceholder;
