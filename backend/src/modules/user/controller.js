import { userService } from "./service.js";

const createSchoolAdmin = async (req, res) => {
  const data = await userService.createSchoolAdmin(req.body);
  return res.status(201).json({ success: true, data });
};
console.log("fjnfg");
export const userController = {
  createSchoolAdmin,
};
