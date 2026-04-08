import { transportService } from "./service.js";

const makeHandlers = (key) => ({
  list: async (req, res) => {
    const data = await transportService.listModule(req.user, key, req.query);
    return res.json({ success: true, data });
  },
  getOne: async (req, res) => {
    const data = await transportService.getModule(req.user, key, req.params.id);
    return res.json({ success: true, data });
  },
  create: async (req, res) => {
    const data = await transportService.createModule(req.user, key, req.body);
    return res.status(201).json({ success: true, data });
  },
  update: async (req, res) => {
    const data = await transportService.updateModule(req.user, key, req.params.id, req.body);
    return res.json({ success: true, data });
  },
  remove: async (req, res) => {
    const data = await transportService.deleteModule(req.user, key, req.params.id);
    return res.json({ success: true, data });
  },
});

export const transportController = {
  vehicles: makeHandlers("vehicles"),
  drivers: makeHandlers("drivers"),
  conductors: makeHandlers("conductors"),
  routes: makeHandlers("routes"),
  stops: makeHandlers("stops"),
  assignments: makeHandlers("assignments"),
  studentAssignments: makeHandlers("studentAssignments"),
  fees: makeHandlers("fees"),
  attendance: makeHandlers("attendance"),
  maintenance: makeHandlers("maintenance"),
  tracking: makeHandlers("tracking"),
  notifications: makeHandlers("notifications"),
};
