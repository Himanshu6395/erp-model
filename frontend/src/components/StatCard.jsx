function StatCard({ icon, title, value, subtitle }) {
  return (
    <div className="card transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-500">{title}</p>
        <div className="rounded-lg bg-brand-50 p-2 text-brand-600">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
    </div>
  );
}

export default StatCard;
