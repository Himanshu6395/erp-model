# Transport Module

## Folder Structure

- `backend/src/models/TransportVehicle.js`
- `backend/src/models/TransportDriver.js`
- `backend/src/models/TransportConductor.js`
- `backend/src/models/TransportRoute.js`
- `backend/src/models/TransportStop.js`
- `backend/src/models/TransportRouteAssignment.js`
- `backend/src/models/StudentTransportAssignment.js`
- `backend/src/models/TransportFee.js`
- `backend/src/models/TransportAttendance.js`
- `backend/src/models/VehicleMaintenance.js`
- `backend/src/models/VehicleTracking.js`
- `backend/src/models/TransportNotification.js`
- `backend/src/modules/transport/repository.js`
- `backend/src/modules/transport/service.js`
- `backend/src/modules/transport/controller.js`
- `backend/src/modules/transport/routes.js`

## Sample Endpoints

- `GET /api/school-admin/transport/vehicles?page=1&limit=10&search=MH`
- `POST /api/school-admin/transport/vehicles`
- `PUT /api/school-admin/transport/vehicles/:id`
- `DELETE /api/school-admin/transport/vehicles/:id`
- `GET /api/school-admin/transport/drivers`
- `GET /api/school-admin/transport/conductors`
- `GET /api/school-admin/transport/routes`
- `GET /api/school-admin/transport/stops?routeId=:routeId`
- `GET /api/school-admin/transport/assignments?vehicleId=:vehicleId`
- `GET /api/school-admin/transport/student-assignments?studentId=:studentId`
- `GET /api/school-admin/transport/fees?routeId=:routeId`
- `GET /api/school-admin/transport/attendance?studentId=:studentId&date=2026-04-07`
- `GET /api/school-admin/transport/maintenance?vehicleId=:vehicleId`
- `GET /api/school-admin/transport/tracking?vehicleId=:vehicleId`
- `GET /api/school-admin/transport/notifications?type=DELAY`

## Notes

- All transport endpoints are protected for `SCHOOL_ADMIN`.
- List APIs support pagination with `page` and `limit`.
- Search is supported where applicable through `search`.
- Relationship validation is enforced in the service layer before writes.
