import { authService } from "./service.js";

const login = async (req, res) => {
  const data = await authService.login(req.body, {
    ipAddress: req.ip,
    device: req.headers["user-agent"] || "",
  });
  return res.json({ success: true, data });
};

export const authController = {
  login,
};
