export const DEFAULT_GRADING_SCALE = [
  { grade: "A+", minPct: 90, maxPct: 100 },
  { grade: "A", minPct: 75, maxPct: 89.99 },
  { grade: "B", minPct: 60, maxPct: 74.99 },
  { grade: "C", minPct: 40, maxPct: 59.99 },
  { grade: "F", minPct: 0, maxPct: 39.99 },
];

export const normalizeScale = (scale) => (Array.isArray(scale) && scale.length ? scale : DEFAULT_GRADING_SCALE);

export const gradeFromPercentage = (pct, scale = DEFAULT_GRADING_SCALE) => {
  const s = normalizeScale(scale);
  const p = Number(pct);
  for (const band of s) {
    if (p >= band.minPct && p <= band.maxPct) return band.grade;
  }
  return "F";
};

export const applyRounding = (value, mode) => {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  if (mode === "FLOOR") return Math.floor(n);
  if (mode === "CEIL") return Math.ceil(n);
  return Math.round(n);
};

export const cap = (v, max) => {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return Math.min(Math.max(0, n), max);
};

export const sumComponentsObtained = (c) =>
  (Number(c.theory) || 0) + (Number(c.practical) || 0) + (Number(c.internal) || 0);

export const maxTotalFromComponents = (compMax) =>
  (Number(compMax.theory) || 0) + (Number(compMax.practical) || 0) + (Number(compMax.internal) || 0);

/** Weighted % when weightage sums to 100; else falls back to simple total/max */
export const computePercentage = (obtained, maxTotal, components, compMax, weightage) => {
  if (!maxTotal || maxTotal <= 0) return 0;
  const wt =
    (Number(weightage?.theory) || 0) + (Number(weightage?.practical) || 0) + (Number(weightage?.internal) || 0);
  if (wt > 0 && Math.abs(wt - 100) < 0.01 && compMax) {
    let wsum = 0;
    const t = compMax.theory > 0 ? ((Number(components.theory) || 0) / compMax.theory) * (weightage.theory || 0) : 0;
    const p = compMax.practical > 0 ? ((Number(components.practical) || 0) / compMax.practical) * (weightage.practical || 0) : 0;
    const i = compMax.internal > 0 ? ((Number(components.internal) || 0) / compMax.internal) * (weightage.internal || 0) : 0;
    wsum = t + p + i;
    return Number(Math.min(100, Math.max(0, wsum)).toFixed(2));
  }
  return Number(((obtained / maxTotal) * 100).toFixed(2));
};

export const applyGraceMarks = (obtained, maxTotal, graceEnabled, graceLimit, passingMarks) => {
  if (!graceEnabled || !graceLimit) return { total: obtained, applied: 0 };
  let t = obtained;
  let applied = 0;
  while (t < passingMarks && applied < graceLimit && t < maxTotal) {
    t += 1;
    applied += 1;
  }
  return { total: Math.min(t, maxTotal), applied };
};
