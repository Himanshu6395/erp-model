/** Shared inquiry admin UI tokens for consistent polish across pages */

export const FILTER_FIELD_SX = {
  minWidth: 0,
  "& .MuiOutlinedInput-root": {
    bgcolor: "#fff",
    borderRadius: 1,
    "& fieldset": { borderColor: "rgba(15, 23, 42, 0.1)" },
    "&:hover fieldset": { borderColor: "rgba(29, 78, 216, 0.35)" },
  },
};

export const TABLE_CONTAINER_SX = {
  borderRadius: 2,
  border: "1px solid rgba(15, 23, 42, 0.08)",
  overflow: "hidden",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
};

export const CHART_CARD_SX = {
  p: 2.5,
  borderRadius: 2,
  border: "1px solid rgba(15, 23, 42, 0.08)",
  overflow: "hidden",
};
