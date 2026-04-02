function FormCard({ title, subtitle, children }) {
  return (
    <div className="card ">
      <h2 className="mb-1 text-2xl font-bold text-gray-900">{title}</h2>
      {subtitle ? <p className="mb-6 text-sm text-gray-500">{subtitle}</p> : null}
      {children}
    </div>
  );
}

export default FormCard;
