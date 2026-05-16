import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { applyErpTheme, readStoredErpTheme } from "../theme/applyErpTheme";
import { loadErpTheme } from "../store/erpThemeSlice";

export default function ErpThemeProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const stored = readStoredErpTheme();
    if (stored) applyErpTheme(stored);
    dispatch(loadErpTheme());
  }, [dispatch]);

  return children;
}
