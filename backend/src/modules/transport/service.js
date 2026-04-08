import AppError from "../../common/errors/AppError.js";
import { ROLES } from "../../common/constants/roles.js";
import { transportRepository } from "./repository.js";

const ensureSchoolAdmin = (user) => {
  if (!user?.schoolId) throw new AppError("School context missing", 400);
  if (user.role !== ROLES.SCHOOL_ADMIN) throw new AppError("Only school admin can manage transport", 403);
  return user.schoolId;
};

const toDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const moduleConfigs = {
  vehicles: {
    searchFields: ["vehicleNumber", "model", "manufacturer", "registrationNumber"],
  },
  drivers: {
    searchFields: ["driverName", "phoneNumber", "email", "licenseNumber"],
  },
  conductors: {
    searchFields: ["name", "phone", "address"],
    populate: "assignedVehicleId",
  },
  routes: {
    searchFields: ["routeName", "routeCode", "startLocation", "endLocation"],
  },
  stops: {
    searchFields: ["stopName", "stopAddress", "pickupTime", "dropTime"],
    populate: "routeId",
  },
  assignments: {
    searchFields: ["shift", "startTime", "endTime"],
    populate: "routeId vehicleId driverId conductorId",
  },
  studentAssignments: {
    searchFields: ["pickupPoint", "dropPoint"],
    populate: [
      { path: "studentId", populate: { path: "userId classId" } },
      { path: "routeId" },
      { path: "stopId" },
    ],
  },
  fees: {
    searchFields: ["receiptNumber"],
    populate: [{ path: "studentId", populate: { path: "userId classId" } }, { path: "routeId" }],
  },
  attendance: {
    searchFields: ["remarks"],
    populate: [{ path: "studentId", populate: { path: "userId classId" } }],
  },
  maintenance: {
    searchFields: ["serviceType", "description"],
    populate: "vehicleId",
  },
  tracking: {
    searchFields: [],
    populate: "vehicleId",
  },
  notifications: {
    searchFields: ["title", "message"],
  },
};

const buildSearchFilter = (config, query) => {
  const filter = {};
  const search = String(query.search || "").trim();
  if (search && config.searchFields?.length) {
    filter.$or = config.searchFields.map((field) => ({ [field]: { $regex: search, $options: "i" } }));
  }
  return filter;
};

const normalizePayload = (key, payload) => {
  const body = { ...payload };
  switch (key) {
    case "vehicles":
      return {
        vehicleNumber: body.vehicleNumber?.trim(),
        vehicleType: String(body.vehicleType || "").toUpperCase(),
        capacity: Number(body.capacity || 0),
        model: body.model || "",
        manufacturer: body.manufacturer || "",
        registrationNumber: body.registrationNumber || "",
        insuranceNumber: body.insuranceNumber || "",
        insuranceExpiryDate: toDate(body.insuranceExpiryDate),
        fitnessCertificateNumber: body.fitnessCertificateNumber || "",
        fitnessExpiryDate: toDate(body.fitnessExpiryDate),
        pollutionCertificateNumber: body.pollutionCertificateNumber || "",
        pollutionExpiryDate: toDate(body.pollutionExpiryDate),
        gpsEnabled: body.gpsEnabled === true || body.gpsEnabled === "true",
        status: String(body.status || "ACTIVE").toUpperCase(),
      };
    case "drivers":
      return {
        driverName: body.driverName?.trim(),
        phoneNumber: body.phoneNumber?.trim(),
        alternatePhone: body.alternatePhone || "",
        email: String(body.email || "").trim().toLowerCase(),
        address: body.address || "",
        licenseNumber: body.licenseNumber?.trim(),
        licenseExpiryDate: toDate(body.licenseExpiryDate),
        experienceYears: Number(body.experienceYears || 0),
        joiningDate: toDate(body.joiningDate),
        salary: Number(body.salary || 0),
        status: String(body.status || "ACTIVE").toUpperCase(),
      };
    case "conductors":
      return {
        name: body.name?.trim(),
        phone: body.phone?.trim(),
        address: body.address || "",
        assignedVehicleId: body.assignedVehicleId || null,
        status: String(body.status || "ACTIVE").toUpperCase(),
      };
    case "routes":
      return {
        routeName: body.routeName?.trim(),
        routeCode: body.routeCode?.trim(),
        startLocation: body.startLocation?.trim(),
        endLocation: body.endLocation?.trim(),
        totalDistance: Number(body.totalDistance || 0),
        estimatedTime: Number(body.estimatedTime || 0),
        description: body.description || "",
        status: String(body.status || "ACTIVE").toUpperCase(),
      };
    case "stops":
      return {
        routeId: body.routeId,
        stopName: body.stopName?.trim(),
        stopAddress: body.stopAddress || "",
        latitude: body.latitude === "" || body.latitude == null ? null : Number(body.latitude),
        longitude: body.longitude === "" || body.longitude == null ? null : Number(body.longitude),
        stopOrder: Number(body.stopOrder || 0),
        pickupTime: body.pickupTime || "",
        dropTime: body.dropTime || "",
      };
    case "assignments":
      return {
        routeId: body.routeId,
        vehicleId: body.vehicleId,
        driverId: body.driverId,
        conductorId: body.conductorId || null,
        shift: String(body.shift || "").toUpperCase(),
        startTime: body.startTime?.trim(),
        endTime: body.endTime?.trim(),
        status: String(body.status || "ACTIVE").toUpperCase(),
      };
    case "studentAssignments":
      return {
        studentId: body.studentId,
        routeId: body.routeId,
        stopId: body.stopId,
        pickupPoint: body.pickupPoint || "",
        dropPoint: body.dropPoint || "",
        assignedDate: toDate(body.assignedDate) || new Date(),
        status: String(body.status || "ACTIVE").toUpperCase(),
      };
    case "fees":
      return {
        studentId: body.studentId,
        routeId: body.routeId,
        amount: Number(body.amount || 0),
        paymentFrequency: String(body.paymentFrequency || "").toUpperCase(),
        dueDate: toDate(body.dueDate),
        paymentStatus: String(body.paymentStatus || "UNPAID").toUpperCase(),
        paymentDate: toDate(body.paymentDate),
        paymentMode: String(body.paymentMode || "CASH").toUpperCase(),
        receiptNumber: body.receiptNumber || "",
      };
    case "attendance":
      return {
        studentId: body.studentId,
        date: toDate(body.date),
        pickupStatus: String(body.pickupStatus || "").toUpperCase(),
        dropStatus: String(body.dropStatus || "").toUpperCase(),
        remarks: body.remarks || "",
      };
    case "maintenance":
      return {
        vehicleId: body.vehicleId,
        serviceType: body.serviceType?.trim(),
        serviceDate: toDate(body.serviceDate),
        cost: Number(body.cost || 0),
        description: body.description || "",
        nextServiceDate: toDate(body.nextServiceDate),
        status: String(body.status || "SCHEDULED").toUpperCase(),
      };
    case "tracking":
      return {
        vehicleId: body.vehicleId,
        latitude: Number(body.latitude),
        longitude: Number(body.longitude),
        speed: Number(body.speed || 0),
        timestamp: toDate(body.timestamp) || new Date(),
      };
    case "notifications":
      return {
        title: body.title?.trim(),
        message: body.message?.trim(),
        type: String(body.type || "").toUpperCase(),
        sentTo: String(body.sentTo || "").toUpperCase(),
        date: toDate(body.date) || new Date(),
      };
    default:
      return body;
  }
};

const validateRelationships = async (schoolId, key, payload) => {
  const ensureExists = async (moduleKey, id, label) => {
    if (!id) return;
    const exists = await transportRepository.exists({ key: moduleKey, schoolId, id });
    if (!exists) throw new AppError(`${label} not found`, 404);
  };

  if (key === "conductors" && payload.assignedVehicleId) await ensureExists("vehicles", payload.assignedVehicleId, "Assigned vehicle");
  if (key === "stops") await ensureExists("routes", payload.routeId, "Route");
  if (key === "assignments") {
    await ensureExists("routes", payload.routeId, "Route");
    await ensureExists("vehicles", payload.vehicleId, "Vehicle");
    await ensureExists("drivers", payload.driverId, "Driver");
    if (payload.conductorId) await ensureExists("conductors", payload.conductorId, "Conductor");
  }
  if (key === "studentAssignments") {
    const student = await transportRepository.findStudentById({ schoolId, studentId: payload.studentId });
    if (!student) throw new AppError("Student not found", 404);
    await ensureExists("routes", payload.routeId, "Route");
    await ensureExists("stops", payload.stopId, "Stop");
  }
  if (key === "fees") {
    const student = await transportRepository.findStudentById({ schoolId, studentId: payload.studentId });
    if (!student) throw new AppError("Student not found", 404);
    await ensureExists("routes", payload.routeId, "Route");
  }
  if (key === "attendance") {
    const student = await transportRepository.findStudentById({ schoolId, studentId: payload.studentId });
    if (!student) throw new AppError("Student not found", 404);
  }
  if (key === "maintenance" || key === "tracking") await ensureExists("vehicles", payload.vehicleId, "Vehicle");
};

const listModule = async (user, key, query) => {
  const schoolId = ensureSchoolAdmin(user);
  const config = moduleConfigs[key];
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const filter = buildSearchFilter(config, query);

  if (query.status) filter.status = String(query.status).toUpperCase();
  if (key === "stops" && query.routeId) filter.routeId = query.routeId;
  if (key === "assignments") {
    if (query.routeId) filter.routeId = query.routeId;
    if (query.vehicleId) filter.vehicleId = query.vehicleId;
    if (query.driverId) filter.driverId = query.driverId;
    if (query.shift) filter.shift = String(query.shift).toUpperCase();
  }
  if (key === "studentAssignments" || key === "fees") {
    if (query.studentId) filter.studentId = query.studentId;
    if (query.routeId) filter.routeId = query.routeId;
  }
  if (key === "attendance") {
    if (query.studentId) filter.studentId = query.studentId;
    if (query.date) filter.date = toDate(query.date);
  }
  if (key === "maintenance" || key === "tracking") {
    if (query.vehicleId) filter.vehicleId = query.vehicleId;
  }
  if (key === "notifications" && query.type) filter.type = String(query.type).toUpperCase();

  const { items, total } = await transportRepository.list({ key, schoolId, filter, populate: config.populate, page, limit });
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getModule = async (user, key, id) => {
  const schoolId = ensureSchoolAdmin(user);
  const config = moduleConfigs[key];
  const item = await transportRepository.findById({ key, schoolId, id, populate: config.populate });
  if (!item) throw new AppError("Resource not found", 404);
  return item;
};

const createModule = async (user, key, body) => {
  const schoolId = ensureSchoolAdmin(user);
  const payload = normalizePayload(key, body);
  await validateRelationships(schoolId, key, payload);
  return transportRepository.create({ key, payload: { schoolId, ...payload } });
};

const updateModule = async (user, key, id, body) => {
  const schoolId = ensureSchoolAdmin(user);
  const config = moduleConfigs[key];
  const existing = await transportRepository.findById({ key, schoolId, id });
  if (!existing) throw new AppError("Resource not found", 404);
  const payload = normalizePayload(key, { ...existing.toObject(), ...body });
  await validateRelationships(schoolId, key, payload);
  return transportRepository.update({ key, schoolId, id, payload, populate: config.populate });
};

const deleteModule = async (user, key, id) => {
  const schoolId = ensureSchoolAdmin(user);
  const removed = await transportRepository.remove({ key, schoolId, id });
  if (!removed) throw new AppError("Resource not found", 404);
  return { deleted: true };
};

export const transportService = {
  listModule,
  getModule,
  createModule,
  updateModule,
  deleteModule,
};
