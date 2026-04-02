import AppError from "../../common/errors/AppError.js";
import {
  sumBreakdown,
  applyDiscount,
  buildInstallments,
  computeLateFine,
  deriveStudentFeeStatus,
} from "../../common/utils/feeCalculations.js";

export function normalizeFeesBreakdown(input = {}) {
  const src = input.feesBreakdown || input;
  const other = Array.isArray(input.otherCharges)
    ? input.otherCharges
    : Array.isArray(src.otherCharges)
      ? src.otherCharges
      : [];
  return {
    tuitionFee: Number(src.tuitionFee ?? 0),
    admissionFee: Number(src.admissionFee ?? 0),
    transportFee: Number(src.transportFee ?? 0),
    hostelFee: Number(src.hostelFee ?? 0),
    examFee: Number(src.examFee ?? 0),
    libraryFee: Number(src.libraryFee ?? 0),
    sportsFee: Number(src.sportsFee ?? 0),
    otherCharges: other.map((o) => ({
      label: String(o.label || "Other").slice(0, 80),
      amount: Math.max(Number(o.amount || 0), 0),
    })),
  };
}

export function computeStructureTotalsFromBody(body) {
  const feesBreakdown = normalizeFeesBreakdown(body);
  const subtotal = sumBreakdown(feesBreakdown);
  const discountType = body.discountType || "NONE";
  const discountValue = Number(body.discountValue ?? 0);
  const { discountAmount, afterDiscount } = applyDiscount(subtotal, discountType, discountValue);
  return {
    feesBreakdown,
    subtotal,
    structureDiscountAmount: discountAmount,
    totalAmount: Number(afterDiscount.toFixed(2)),
  };
}

export function buildStudentFeeDocument(structure, student, manualDiscount = 0) {
  const subtotal = sumBreakdown(structure.feesBreakdown || {});
  const gross = subtotal > 0 ? subtotal : Number(structure.amount || 0);
  const { discountAmount } = applyDiscount(gross, structure.discountType, structure.discountValue);
  const structureNet = Number(structure.totalAmount || structure.amount || 0);
  const manual = Math.max(Number(manualDiscount || 0), 0);
  const finalAmt = Math.max(structureNet - manual, 0);
  const dueDate = structure.dueDate ? new Date(structure.dueDate) : structure.applicableTo ? new Date(structure.applicableTo) : new Date();
  const installments = buildInstallments(
    finalAmt,
    structure.installmentEnabled ? Math.max(Number(structure.numberOfInstallments || 1), 1) : 1,
    dueDate,
    Boolean(structure.installmentEnabled && Number(structure.numberOfInstallments) > 1)
  );

  return {
    schoolId: structure.schoolId,
    studentId: student._id,
    classId: student.classId?._id || student.classId,
    feeStructureId: structure._id,
    academicYear: structure.academicYear || "",
    feesBreakdownSnapshot: structure.feesBreakdown || {},
    totalAmount: gross,
    structureDiscountAmount: discountAmount,
    manualDiscountAmount: manual,
    finalAmount: finalAmt,
    paidAmount: 0,
    remainingAmount: finalAmt,
    fineAmount: 0,
    status: "UNPAID",
    dueDate,
    installmentDetails: installments,
    amount: finalAmt,
  };
}

export function mergeFineAndStatus(assignment, structure) {
  if (assignment.status === "PAID") {
    return { fineAmount: Number(assignment.fineAmount || 0), status: "PAID" };
  }
  const fine = computeLateFine({
    dueDate: assignment.dueDate,
    graceDays: structure?.gracePeriodDays ?? 0,
    fineType: structure?.fineType || "NONE",
    fineAmount: structure?.fineAmount ?? 0,
  });
  const outstandingBase = Math.max(Number(assignment.finalAmount || 0) - Number(assignment.paidAmount || 0), 0);
  const appliedFine = outstandingBase > 0 ? fine : 0;
  const statusBase = deriveStudentFeeStatus({
    finalAmount: assignment.finalAmount,
    fineAmount: appliedFine,
    paidAmount: assignment.paidAmount,
  });
  let status = statusBase;
  if (status !== "PAID" && appliedFine > 0 && new Date() > new Date(assignment.dueDate || 0)) {
    status = "OVERDUE";
  }
  return { fineAmount: appliedFine, status };
}

export async function persistAssignmentBalances(assignmentDoc, structure, adminRepo) {
  const { fineAmount, status } = mergeFineAndStatus(assignmentDoc, structure);
  const dueTotal = Number(assignmentDoc.finalAmount || 0) + Number(fineAmount || 0);
  const paid = Number(assignmentDoc.paidAmount || 0);
  const remaining = Math.max(dueTotal - paid, 0);
  return adminRepo.updateFeeAssignmentById({
    schoolId: assignmentDoc.schoolId,
    assignmentId: assignmentDoc._id,
    payload: { fineAmount, status, remainingAmount: remaining },
  });
}

export async function generateReceiptNumber(schoolId) {
  const y = new Date().getFullYear();
  const short = String(schoolId).slice(-4).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RCP-${short}-${y}-${Date.now().toString(36).toUpperCase()}-${rnd}`;
}

export function validatePayAmount(assignment, structure, payAmount) {
  const { fineAmount, status: _s } = mergeFineAndStatus(assignment, structure);
  const dueTotal = Number(assignment.finalAmount || 0) + Number(fineAmount || 0);
  const paid = Number(assignment.paidAmount || 0);
  const remaining = Math.max(dueTotal - paid, 0);
  const pay = Number(payAmount);
  if (pay <= 0) throw new AppError("Pay amount must be positive", 400);
  if (pay > remaining + 0.01) throw new AppError("Pay amount exceeds remaining balance", 400);
  return { remaining, fineAmount, dueTotal, pay };
}

export async function applyPaymentToAssignment({
  assignment,
  structure,
  payAmount,
  adminRepo,
  paymentPayload,
}) {
  const { fineAmount, remaining } = validatePayAmount(assignment, structure, payAmount);
  const pay = Number(payAmount);
  const newPaid = Number(assignment.paidAmount || 0) + pay;
  const dueTotal = Number(assignment.finalAmount || 0) + Number(fineAmount || 0);
  const newRemaining = Math.max(dueTotal - newPaid, 0);
  const status = deriveStudentFeeStatus({
    finalAmount: assignment.finalAmount,
    fineAmount,
    paidAmount: newPaid,
  });
  let finalStatus = status;
  if (finalStatus !== "PAID" && fineAmount > 0 && new Date() > new Date(assignment.dueDate || 0)) {
    finalStatus = newRemaining <= 0.01 ? "PAID" : "OVERDUE";
  }
  if (newRemaining <= 0.01) finalStatus = "PAID";

  const payment = await adminRepo.createFeePayment(paymentPayload);

  await adminRepo.updateFeeAssignmentById({
    schoolId: assignment.schoolId,
    assignmentId: assignment._id,
    payload: {
      paidAmount: newPaid,
      remainingAmount: newRemaining,
      fineAmount,
      status: finalStatus,
    },
  });

  return payment;
}

export function structureMatchesStudent(structure, student) {
  const cid = String(structure.classId?._id || structure.classId);
  const sid = String(student.classId?._id || student.classId);
  if (cid !== sid) return false;
  const sec = (structure.section || "").trim();
  if (!sec) return true;
  return sec === (student.section || "").trim();
}
