import {
  BellRing,
  Bus,
  ClipboardCheck,
  Coins,
  GitBranch,
  LocateFixed,
  MapPinned,
  ShieldCheck,
  UserCog,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";

export const transportModules = [
  {
    key: "vehicles",
    label: "Vehicles",
    singular: "vehicle",
    icon: Bus,
    description: "Register buses and vans with compliance, capacity, and operating status.",
    searchPlaceholder: "Search vehicle number, model, manufacturer",
    accent: "from-cyan-600 via-sky-600 to-brand-700",
    fields: [
      { name: "vehicleNumber", label: "Vehicle number", type: "text", required: true, placeholder: "MH-12-AB-1234" },
      {
        name: "vehicleType",
        label: "Vehicle type",
        type: "select",
        required: true,
        options: [
          { value: "BUS", label: "Bus" },
          { value: "VAN", label: "Van" },
        ],
      },
      { name: "capacity", label: "Capacity", type: "number", required: true, min: 1, placeholder: "52" },
      { name: "model", label: "Model", type: "text", placeholder: "Traveller XL" },
      { name: "manufacturer", label: "Manufacturer", type: "text", placeholder: "Tata / Ashok Leyland" },
      { name: "registrationNumber", label: "Registration number", type: "text", placeholder: "Registration reference" },
      { name: "insuranceNumber", label: "Insurance number", type: "text", placeholder: "Insurance ID" },
      { name: "insuranceExpiryDate", label: "Insurance expiry", type: "date" },
      { name: "fitnessCertificateNumber", label: "Fitness certificate", type: "text", placeholder: "Fitness certificate number" },
      { name: "fitnessExpiryDate", label: "Fitness expiry", type: "date" },
      { name: "pollutionCertificateNumber", label: "Pollution certificate", type: "text", placeholder: "PUC reference" },
      { name: "pollutionExpiryDate", label: "Pollution expiry", type: "date" },
      { name: "gpsEnabled", label: "GPS enabled", type: "checkbox" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ACTIVE", label: "Active" },
          { value: "INACTIVE", label: "Inactive" },
          { value: "MAINTENANCE", label: "Maintenance" },
        ],
      },
    ],
  },
  {
    key: "drivers",
    label: "Drivers",
    singular: "driver",
    icon: UserCog,
    description: "Track driver profiles, compliance validity, payroll context, and active duty status.",
    searchPlaceholder: "Search driver, phone, email, license",
    accent: "from-slate-900 via-brand-950 to-blue-800",
    fields: [
      { name: "driverName", label: "Driver name", type: "text", required: true, placeholder: "Rakesh Sharma" },
      { name: "phoneNumber", label: "Phone number", type: "text", required: true, placeholder: "9876543210" },
      { name: "alternatePhone", label: "Alternate phone", type: "text", placeholder: "Backup contact" },
      { name: "email", label: "Email", type: "email", placeholder: "driver@school.com" },
      { name: "address", label: "Address", type: "textarea", placeholder: "Residential address" },
      { name: "licenseNumber", label: "License number", type: "text", required: true, placeholder: "DL-04-2023-0001234" },
      { name: "licenseExpiryDate", label: "License expiry", type: "date" },
      { name: "experienceYears", label: "Experience (years)", type: "number", min: 0, placeholder: "8" },
      { name: "joiningDate", label: "Joining date", type: "date" },
      { name: "salary", label: "Salary", type: "number", min: 0, placeholder: "24000" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ACTIVE", label: "Active" },
          { value: "INACTIVE", label: "Inactive" },
        ],
      },
    ],
  },
  {
    key: "conductors",
    label: "Conductors",
    singular: "conductor",
    icon: Users,
    description: "Manage helpers and assign them to fleet operations with clear availability status.",
    searchPlaceholder: "Search conductor, phone, address",
    accent: "from-emerald-700 via-teal-700 to-cyan-700",
    fields: [
      { name: "name", label: "Conductor name", type: "text", required: true, placeholder: "Sunil Kumar" },
      { name: "phone", label: "Phone", type: "text", required: true, placeholder: "9876543210" },
      { name: "address", label: "Address", type: "textarea", placeholder: "Current address" },
      { name: "assignedVehicleId", label: "Assigned vehicle", type: "select", optionSource: "vehicles", placeholder: "Select vehicle" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ACTIVE", label: "Active" },
          { value: "INACTIVE", label: "Inactive" },
        ],
      },
    ],
  },
  {
    key: "routes",
    label: "Routes",
    singular: "route",
    icon: GitBranch,
    description: "Define the school transport corridors, route codes, travel timing, and active coverage.",
    searchPlaceholder: "Search route, code, start, end",
    accent: "from-violet-700 via-blue-800 to-brand-900",
    fields: [
      { name: "routeName", label: "Route name", type: "text", required: true, placeholder: "North Campus Main Loop" },
      { name: "routeCode", label: "Route code", type: "text", required: true, placeholder: "RT-101" },
      { name: "startLocation", label: "Start location", type: "text", required: true, placeholder: "Civil Lines" },
      { name: "endLocation", label: "End location", type: "text", required: true, placeholder: "Main Campus Gate" },
      { name: "totalDistance", label: "Total distance (km)", type: "number", min: 0, placeholder: "18" },
      { name: "estimatedTime", label: "Estimated time (min)", type: "number", min: 0, placeholder: "50" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Coverage notes, traffic comments, operational notes" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ACTIVE", label: "Active" },
          { value: "INACTIVE", label: "Inactive" },
        ],
      },
    ],
  },
  {
    key: "stops",
    label: "Stops",
    singular: "stop",
    icon: MapPinned,
    description: "Organize pickup and drop points, order them by route, and keep timing references aligned.",
    searchPlaceholder: "Search stop name, address, pickup time",
    accent: "from-fuchsia-700 via-rose-700 to-orange-600",
    fields: [
      { name: "routeId", label: "Route", type: "select", required: true, optionSource: "routes", placeholder: "Select route" },
      { name: "stopName", label: "Stop name", type: "text", required: true, placeholder: "Sector 12 Chowk" },
      { name: "stopAddress", label: "Stop address", type: "textarea", placeholder: "Landmark or full stop address" },
      { name: "latitude", label: "Latitude", type: "number", min: -90, max: 90, step: "any", placeholder: "28.6139" },
      { name: "longitude", label: "Longitude", type: "number", min: -180, max: 180, step: "any", placeholder: "77.2090" },
      { name: "stopOrder", label: "Stop order", type: "number", required: true, min: 1, placeholder: "1" },
      { name: "pickupTime", label: "Pickup time", type: "time" },
      { name: "dropTime", label: "Drop time", type: "time" },
    ],
  },
  {
    key: "assignments",
    label: "Assignments",
    singular: "assignment",
    icon: ShieldCheck,
    description: "Assign routes to vehicles, drivers, and helpers for reliable shift planning.",
    searchPlaceholder: "Search shift, timing, route assignment",
    accent: "from-amber-600 via-orange-600 to-rose-700",
    fields: [
      { name: "routeId", label: "Route", type: "select", required: true, optionSource: "routes", placeholder: "Select route" },
      { name: "vehicleId", label: "Vehicle", type: "select", required: true, optionSource: "vehicles", placeholder: "Select vehicle" },
      { name: "driverId", label: "Driver", type: "select", required: true, optionSource: "drivers", placeholder: "Select driver" },
      { name: "conductorId", label: "Conductor", type: "select", optionSource: "conductors", placeholder: "Select conductor" },
      {
        name: "shift",
        label: "Shift",
        type: "select",
        required: true,
        options: [
          { value: "MORNING", label: "Morning" },
          { value: "AFTERNOON", label: "Afternoon" },
        ],
      },
      { name: "startTime", label: "Start time", type: "time", required: true },
      { name: "endTime", label: "End time", type: "time", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ACTIVE", label: "Active" },
          { value: "INACTIVE", label: "Inactive" },
        ],
      },
    ],
  },
  {
    key: "studentAssignments",
    label: "Student Mapping",
    singular: "student assignment",
    icon: UserRound,
    description: "Map students to routes and stops with pickup and drop point details.",
    searchPlaceholder: "Search pickup point, route, or student",
    accent: "from-teal-700 via-cyan-700 to-sky-700",
    fields: [
      { name: "studentId", label: "Student", type: "select", required: true, optionSource: "students", placeholder: "Select student" },
      { name: "routeId", label: "Route", type: "select", required: true, optionSource: "routes", placeholder: "Select route" },
      { name: "stopId", label: "Stop", type: "select", required: true, optionSource: "stops", placeholder: "Select stop" },
      { name: "pickupPoint", label: "Pickup point", type: "text", placeholder: "Pickup landmark" },
      { name: "dropPoint", label: "Drop point", type: "text", placeholder: "Drop landmark" },
      { name: "assignedDate", label: "Assigned date", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "ACTIVE", label: "Active" },
          { value: "INACTIVE", label: "Inactive" },
        ],
      },
    ],
  },
  {
    key: "fees",
    label: "Transport Fees",
    singular: "fee record",
    icon: Coins,
    description: "Create transport fee plans, due dates, payment status, and receipt references.",
    searchPlaceholder: "Search receipt number or payment records",
    accent: "from-green-700 via-emerald-700 to-teal-700",
    fields: [
      { name: "studentId", label: "Student", type: "select", required: true, optionSource: "students", placeholder: "Select student" },
      { name: "routeId", label: "Route", type: "select", required: true, optionSource: "routes", placeholder: "Select route" },
      { name: "amount", label: "Amount", type: "number", required: true, min: 0, placeholder: "1500" },
      {
        name: "paymentFrequency",
        label: "Payment frequency",
        type: "select",
        required: true,
        options: [
          { value: "MONTHLY", label: "Monthly" },
          { value: "QUARTERLY", label: "Quarterly" },
          { value: "YEARLY", label: "Yearly" },
        ],
      },
      { name: "dueDate", label: "Due date", type: "date", required: true },
      {
        name: "paymentStatus",
        label: "Payment status",
        type: "select",
        options: [
          { value: "UNPAID", label: "Unpaid" },
          { value: "PAID", label: "Paid" },
          { value: "PARTIAL", label: "Partial" },
        ],
      },
      { name: "paymentDate", label: "Payment date", type: "date" },
      {
        name: "paymentMode",
        label: "Payment mode",
        type: "select",
        options: [
          { value: "CASH", label: "Cash" },
          { value: "ONLINE", label: "Online" },
        ],
      },
      { name: "receiptNumber", label: "Receipt number", type: "text", placeholder: "Receipt reference" },
    ],
  },
  {
    key: "attendance",
    label: "Transport Attendance",
    singular: "attendance record",
    icon: ClipboardCheck,
    description: "Track daily pickup and drop fulfilment with remarks for missed movements.",
    searchPlaceholder: "Search attendance remarks or student",
    accent: "from-indigo-700 via-slate-800 to-brand-900",
    fields: [
      { name: "studentId", label: "Student", type: "select", required: true, optionSource: "students", placeholder: "Select student" },
      { name: "date", label: "Date", type: "date", required: true },
      {
        name: "pickupStatus",
        label: "Pickup status",
        type: "select",
        required: true,
        options: [
          { value: "PICKED", label: "Picked" },
          { value: "MISSED", label: "Missed" },
        ],
      },
      {
        name: "dropStatus",
        label: "Drop status",
        type: "select",
        required: true,
        options: [
          { value: "DROPPED", label: "Dropped" },
          { value: "MISSED", label: "Missed" },
        ],
      },
      { name: "remarks", label: "Remarks", type: "textarea", placeholder: "Pickup delay, absent student, emergency note" },
    ],
  },
  {
    key: "maintenance",
    label: "Maintenance",
    singular: "maintenance record",
    icon: Wrench,
    description: "Plan vehicle servicing, capture cost, and monitor the next maintenance cycle.",
    searchPlaceholder: "Search service type or maintenance notes",
    accent: "from-red-700 via-orange-700 to-amber-600",
    fields: [
      { name: "vehicleId", label: "Vehicle", type: "select", required: true, optionSource: "vehicles", placeholder: "Select vehicle" },
      { name: "serviceType", label: "Service type", type: "text", required: true, placeholder: "Oil change / Brake inspection" },
      { name: "serviceDate", label: "Service date", type: "date", required: true },
      { name: "cost", label: "Cost", type: "number", min: 0, placeholder: "4500" },
      { name: "description", label: "Description", type: "textarea", placeholder: "Maintenance notes" },
      { name: "nextServiceDate", label: "Next service date", type: "date" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "SCHEDULED", label: "Scheduled" },
          { value: "IN_PROGRESS", label: "In progress" },
          { value: "COMPLETED", label: "Completed" },
        ],
      },
    ],
  },
  {
    key: "tracking",
    label: "GPS Tracking",
    singular: "tracking record",
    icon: LocateFixed,
    description: "Capture live location snapshots, movement speed, and timestamp history for vehicles.",
    searchPlaceholder: "Search vehicle tracking records",
    accent: "from-sky-700 via-cyan-700 to-emerald-700",
    fields: [
      { name: "vehicleId", label: "Vehicle", type: "select", required: true, optionSource: "vehicles", placeholder: "Select vehicle" },
      { name: "latitude", label: "Latitude", type: "number", required: true, min: -90, max: 90, step: "any", placeholder: "28.6139" },
      { name: "longitude", label: "Longitude", type: "number", required: true, min: -180, max: 180, step: "any", placeholder: "77.2090" },
      { name: "speed", label: "Speed (km/h)", type: "number", min: 0, placeholder: "35" },
      { name: "timestamp", label: "Timestamp", type: "datetime-local" },
    ],
  },
  {
    key: "notifications",
    label: "Alerts",
    singular: "notification",
    icon: BellRing,
    description: "Publish transport alerts for delays, emergencies, and general route communication.",
    searchPlaceholder: "Search title, message, alert type",
    accent: "from-brand-700 via-fuchsia-700 to-rose-700",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, placeholder: "Route delay due to rain" },
      { name: "message", label: "Message", type: "textarea", required: true, placeholder: "Bus 03 will arrive 20 minutes late today." },
      {
        name: "type",
        label: "Type",
        type: "select",
        required: true,
        options: [
          { value: "DELAY", label: "Delay" },
          { value: "EMERGENCY", label: "Emergency" },
          { value: "GENERAL", label: "General" },
        ],
      },
      {
        name: "sentTo",
        label: "Sent to",
        type: "select",
        required: true,
        options: [
          { value: "STUDENTS", label: "Students" },
          { value: "PARENTS", label: "Parents" },
          { value: "ALL", label: "All" },
        ],
      },
      { name: "date", label: "Alert date", type: "date" },
    ],
  },
];

export const transportModuleMap = Object.fromEntries(transportModules.map((module) => [module.key, module]));

export const transportSourceLabels = {
  vehicles: "fleet",
  drivers: "drivers",
  conductors: "conductors",
  routes: "routes",
  stops: "stops",
  students: "students",
};

export function defaultTransportForm(moduleKey) {
  const config = transportModuleMap[moduleKey];
  if (!config) return {};

  return config.fields.reduce((acc, field) => {
    if (field.type === "checkbox") {
      acc[field.name] = false;
    } else if (field.type === "select") {
      acc[field.name] = field.options?.[0]?.value && !field.required ? field.options[0].value : "";
    } else {
      acc[field.name] = "";
    }
    return acc;
  }, {});
}

export function sanitizeTransportPayload(moduleKey, form) {
  const config = transportModuleMap[moduleKey];
  if (!config) return { ...form };

  return config.fields.reduce((acc, field) => {
    const value = form[field.name];

    if (field.type === "checkbox") {
      acc[field.name] = Boolean(value);
      return acc;
    }

    if (value == null) return acc;

    if (typeof value === "string" && value.trim() === "") {
      if (field.required) acc[field.name] = value;
      return acc;
    }

    acc[field.name] = value;
    return acc;
  }, {});
}

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.toISOString().slice(0, 10)}T${date.toISOString().slice(11, 16)}`;
};

export function itemLabelForOption(sourceKey, item) {
  if (!item) return "";
  switch (sourceKey) {
    case "vehicles":
      return [item.vehicleNumber, item.vehicleType].filter(Boolean).join(" • ");
    case "drivers":
      return [item.driverName, item.licenseNumber].filter(Boolean).join(" • ");
    case "conductors":
      return [item.name, item.phone].filter(Boolean).join(" • ");
    case "routes":
      return [item.routeName, item.routeCode].filter(Boolean).join(" • ");
    case "stops":
      return [item.stopName, item.routeId?.routeName].filter(Boolean).join(" • ");
    case "students":
      return [item.userId?.name, item.studentCode || item.rollNumber].filter(Boolean).join(" • ");
    default:
      return item.name || item.title || item._id;
  }
}

export function normalizeItemToForm(moduleKey, item) {
  const defaults = defaultTransportForm(moduleKey);
  const config = transportModuleMap[moduleKey];
  if (!config || !item) return defaults;

  return config.fields.reduce((acc, field) => {
    let value = item[field.name];

    if (value && typeof value === "object" && "_id" in value) {
      value = value._id;
    }

    if (field.type === "checkbox") {
      acc[field.name] = Boolean(value);
    } else if (field.type === "date") {
      acc[field.name] = formatDate(value);
    } else if (field.type === "datetime-local") {
      acc[field.name] = formatDateTimeLocal(value);
    } else if (value == null) {
      acc[field.name] = "";
    } else {
      acc[field.name] = String(value);
    }
    return acc;
  }, defaults);
}

export function getTransportItemTitle(moduleKey, item) {
  if (!item) return "Pending transport record";

  switch (moduleKey) {
    case "vehicles":
      return item.vehicleNumber || "Vehicle";
    case "drivers":
      return item.driverName || "Driver";
    case "conductors":
      return item.name || "Conductor";
    case "routes":
      return item.routeName || "Route";
    case "stops":
      return item.stopName || "Stop";
    case "assignments":
      return item.routeId?.routeName || "Route assignment";
    case "studentAssignments":
      return item.studentId?.userId?.name || "Student mapping";
    case "fees":
      return item.studentId?.userId?.name || "Transport fee";
    case "attendance":
      return item.studentId?.userId?.name || "Attendance record";
    case "maintenance":
      return item.serviceType || "Maintenance";
    case "tracking":
      return item.vehicleId?.vehicleNumber || "Tracking record";
    case "notifications":
      return item.title || "Transport alert";
    default:
      return "Transport record";
  }
}

export function getTransportItemMeta(moduleKey, item) {
  if (!item) return [];

  switch (moduleKey) {
    case "vehicles":
      return [
        ["Type", item.vehicleType || "Not set"],
        ["Capacity", item.capacity ? `${item.capacity} seats` : "Not set"],
        ["Status", item.status || "Unknown"],
      ];
    case "drivers":
      return [
        ["Phone", item.phoneNumber || "Not set"],
        ["License", item.licenseNumber || "Not set"],
        ["Status", item.status || "Unknown"],
      ];
    case "conductors":
      return [
        ["Phone", item.phone || "Not set"],
        ["Vehicle", item.assignedVehicleId?.vehicleNumber || "Not assigned"],
        ["Status", item.status || "Unknown"],
      ];
    case "routes":
      return [
        ["Code", item.routeCode || "Not set"],
        ["Coverage", [item.startLocation, item.endLocation].filter(Boolean).join(" to ") || "Not set"],
        ["Status", item.status || "Unknown"],
      ];
    case "stops":
      return [
        ["Route", item.routeId?.routeName || "Not mapped"],
        ["Order", item.stopOrder || "Not set"],
        ["Pickup", item.pickupTime || "Not set"],
      ];
    case "assignments":
      return [
        ["Vehicle", item.vehicleId?.vehicleNumber || "Not mapped"],
        ["Driver", item.driverId?.driverName || "Not mapped"],
        ["Shift", item.shift || "Not set"],
      ];
    case "studentAssignments":
      return [
        ["Student", item.studentId?.userId?.name || "Not mapped"],
        ["Route", item.routeId?.routeName || "Not mapped"],
        ["Stop", item.stopId?.stopName || "Not mapped"],
      ];
    case "fees":
      return [
        ["Amount", item.amount != null ? `Rs ${item.amount}` : "Not set"],
        ["Status", item.paymentStatus || "Unknown"],
        ["Receipt", item.receiptNumber || "Pending"],
      ];
    case "attendance":
      return [
        ["Date", formatDate(item.date) || "Not set"],
        ["Pickup", item.pickupStatus || "Not set"],
        ["Drop", item.dropStatus || "Not set"],
      ];
    case "maintenance":
      return [
        ["Vehicle", item.vehicleId?.vehicleNumber || "Not mapped"],
        ["Service date", formatDate(item.serviceDate) || "Not set"],
        ["Status", item.status || "Unknown"],
      ];
    case "tracking":
      return [
        ["Vehicle", item.vehicleId?.vehicleNumber || "Not mapped"],
        ["Speed", item.speed != null ? `${item.speed} km/h` : "Not set"],
        ["Recorded", formatDate(item.timestamp) || "Not set"],
      ];
    case "notifications":
      return [
        ["Type", item.type || "Not set"],
        ["Audience", item.sentTo || "Not set"],
        ["Date", formatDate(item.date) || "Not set"],
      ];
    default:
      return [];
  }
}
