import { subscriptionService } from "./service.js";

const listPlans = async (req, res) => res.json({ success: true, data: await subscriptionService.listPlans() });
const createPlan = async (req, res) => res.status(201).json({ success: true, data: await subscriptionService.createPlan(req.body) });
const updatePlan = async (req, res) =>
  res.json({ success: true, data: await subscriptionService.updatePlan(req.params.planId, req.body) });
const deletePlan = async (req, res) =>
  res.json({ success: true, data: await subscriptionService.deletePlan(req.params.planId) });

const listSubscriptions = async (req, res) =>
  res.json({ success: true, data: await subscriptionService.listSubscriptions() });
const changePlan = async (req, res) =>
  res.json({ success: true, data: await subscriptionService.changePlan(req.params.subscriptionId, req.body.planId) });
const extendSubscription = async (req, res) =>
  res.json({ success: true, data: await subscriptionService.extendSubscription(req.params.subscriptionId, req.body) });

const listPayments = async (req, res) => res.json({ success: true, data: await subscriptionService.listPayments() });
const recordPayment = async (req, res) =>
  res.status(201).json({ success: true, data: await subscriptionService.recordPayment(req.body) });

export const subscriptionController = {
  listPlans,
  createPlan,
  updatePlan,
  deletePlan,
  listSubscriptions,
  changePlan,
  extendSubscription,
  listPayments,
  recordPayment,
};
