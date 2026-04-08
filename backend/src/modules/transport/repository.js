import TransportVehicle from "../../models/TransportVehicle.js";
import TransportDriver from "../../models/TransportDriver.js";
import TransportConductor from "../../models/TransportConductor.js";
import TransportRoute from "../../models/TransportRoute.js";
import TransportStop from "../../models/TransportStop.js";
import TransportRouteAssignment from "../../models/TransportRouteAssignment.js";
import StudentTransportAssignment from "../../models/StudentTransportAssignment.js";
import TransportFee from "../../models/TransportFee.js";
import TransportAttendance from "../../models/TransportAttendance.js";
import VehicleMaintenance from "../../models/VehicleMaintenance.js";
import VehicleTracking from "../../models/VehicleTracking.js";
import TransportNotification from "../../models/TransportNotification.js";
import Student from "../../models/Student.js";

export const transportModels = {
  vehicles: TransportVehicle,
  drivers: TransportDriver,
  conductors: TransportConductor,
  routes: TransportRoute,
  stops: TransportStop,
  assignments: TransportRouteAssignment,
  studentAssignments: StudentTransportAssignment,
  fees: TransportFee,
  attendance: TransportAttendance,
  maintenance: VehicleMaintenance,
  tracking: VehicleTracking,
  notifications: TransportNotification,
};

const sortDefaults = {
  vehicles: { createdAt: -1 },
  drivers: { createdAt: -1 },
  conductors: { createdAt: -1 },
  routes: { createdAt: -1 },
  stops: { stopOrder: 1, createdAt: 1 },
  assignments: { createdAt: -1 },
  studentAssignments: { createdAt: -1 },
  fees: { dueDate: -1, createdAt: -1 },
  attendance: { date: -1, createdAt: -1 },
  maintenance: { serviceDate: -1, createdAt: -1 },
  tracking: { timestamp: -1, createdAt: -1 },
  notifications: { date: -1, createdAt: -1 },
};

export const transportRepository = {
  getModel: (key) => transportModels[key],
  findById: ({ key, schoolId, id, populate }) => {
    let query = transportModels[key].findOne({ schoolId, _id: id });
    if (populate) query = query.populate(populate);
    return query;
  },
  list: async ({ key, schoolId, filter, populate, page, limit }) => {
    let query = transportModels[key].find({ schoolId, ...filter });
    if (populate) query = query.populate(populate);
    query = query.sort(sortDefaults[key] || { createdAt: -1 });
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      query.skip(skip).limit(limit),
      transportModels[key].countDocuments({ schoolId, ...filter }),
    ]);
    return { items, total };
  },
  create: ({ key, payload }) => transportModels[key].create(payload),
  update: ({ key, schoolId, id, payload, populate }) => {
    let query = transportModels[key].findOneAndUpdate({ schoolId, _id: id }, payload, { new: true, runValidators: true });
    if (populate) query = query.populate(populate);
    return query;
  },
  remove: ({ key, schoolId, id }) => transportModels[key].findOneAndDelete({ schoolId, _id: id }),
  exists: ({ key, schoolId, id }) => transportModels[key].exists({ schoolId, _id: id }),
  findStudentById: ({ schoolId, studentId }) => Student.findOne({ schoolId, _id: studentId }).populate("userId classId"),
};
