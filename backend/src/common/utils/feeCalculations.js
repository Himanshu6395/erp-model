/** Pure helpers for fee structures and student fee rows */

export const DISCOUNT_TYPES = ["NONE", "FIXED", "PERCENTAGE"];
export const FEE_FREQUENCIES = ["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"];
export const FINE_TYPES = ["NONE", "FIXED", "PER_DAY"];
export const STRUCTURE_STATUS = ["ACTIVE", "INACTIVE"];
export const STUDENT_FEE_STATUS = ["UNPAID", "PARTIAL", "PAID", "OVERDUE"];
export const PAYMENT_MODES = ["CASH", "UPI", "CARD", "NET_BANKING"];

export function sumBreakdown(breakdown = {}) {
  const b = breakdown || {};
  const other = Array.isArray(b.otherCharges) ? b.otherCharges.reduce((s, o) => s + Number(o.amount || 0), 0) : 0;
  return (
    Number(b.tuitionFee || 0) +
    Number(b.admissionFee || 0) +
    Number(b.transportFee || 0) +
    Number(b.hostelFee || 0) +
    Number(b.examFee || 0) +
    Number(b.libraryFee || 0) +
    Number(b.sportsFee || 0) +
    other
  );
}

export function applyDiscount(subtotal, discountType, discountValue) {
  const t = discountType || "NONE";
  const v = Number(discountValue || 0);
  if (t === "NONE" || v <= 0) return { discountAmount: 0, afterDiscount: subtotal };
  if (t === "FIXED") {
    const d = Math.min(v, subtotal);
    return { discountAmount: d, afterDiscount: Math.max(subtotal - d, 0) };
  }
  if (t === "PERCENTAGE") {
    const pct = Math.min(Math.max(v, 0), 100);
    const d = Number(((subtotal * pct) / 100).toFixed(2));
    return { discountAmount: d, afterDiscount: Math.max(subtotal - d, 0) };
  }
  return { discountAmount: 0, afterDiscount: subtotal };
}

export function buildInstallments(finalAmount, count, baseDue, enabled) {
  if (!enabled || !count || count < 2) {
    return [
      {
        index: 0,
        label: "Full",
        amount: Number(finalAmount.toFixed(2)),
        dueDate: baseDue,
        paidAmount: 0,
        status: "PENDING",
      },
    ];
  }
  const each = Number((finalAmount / count).toFixed(2));
  const remainder = Number((finalAmount - each * (count - 1)).toFixed(2));
  const base = baseDue instanceof Date ? new Date(baseDue) : new Date(baseDue);
  const list = [];
  for (let i = 0; i < count; i += 1) {
    const due = new Date(base);
    due.setMonth(due.getMonth() + i);
    list.push({
      index: i,
      label: `Installment ${i + 1}/${count}`,
      amount: i === count - 1 ? remainder : each,
      dueDate: due,
      paidAmount: 0,
      status: "PENDING",
    });
  }
  return list;
}

export function daysBetween(start, end) {
  const a = new Date(start);
  const b = new Date(end);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((b - a) / 86400000));
}

export function computeLateFine({ dueDate, graceDays, fineType, fineAmount, asOf = new Date() }) {
  if (!dueDate || fineType === "NONE" || !fineAmount) return 0;
  const due = new Date(dueDate);
  due.setHours(23, 59, 59, 999);
  const graceEnd = new Date(due);
  graceEnd.setDate(graceEnd.getDate() + Number(graceDays || 0));
  const now = new Date(asOf);
  if (now <= graceEnd) return 0;
  if (fineType === "FIXED") return Number(fineAmount);
  if (fineType === "PER_DAY") {
    const lateDays = daysBetween(graceEnd, now);
    return Number(fineAmount) * lateDays;
  }
  return 0;
}

export function deriveStudentFeeStatus({ finalAmount, fineAmount, paidAmount }) {
  const dueTotal = Number(finalAmount || 0) + Number(fineAmount || 0);
  const paid = Number(paidAmount || 0);
  if (dueTotal <= 0) return "PAID";
  if (paid <= 0) return "UNPAID";
  if (paid >= dueTotal - 0.01) return "PAID";
  return "PARTIAL";
}
