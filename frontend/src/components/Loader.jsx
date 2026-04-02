import { ImSpinner2 } from "react-icons/im";

function Loader({ text = "Loading..." }) {
  return (
    <div className="flex min-h-[160px] items-center justify-center gap-3 text-gray-600">
      <ImSpinner2 className="animate-spin text-xl" />
      <span>{text}</span>
    </div>
  );
}

export default Loader;
