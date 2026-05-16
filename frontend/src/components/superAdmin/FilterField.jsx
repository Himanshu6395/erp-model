import { SA_FIELD_LABEL } from "../../pages/superAdmin/superAdminUi";

export default function FilterField({ label, children, className = "" }) {
  return (
    <div className={className}>
      {label ? <label className={SA_FIELD_LABEL}>{label}</label> : null}
      {children}
    </div>
  );
}
