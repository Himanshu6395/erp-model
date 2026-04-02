import jwt from "jsonwebtoken";
import AppError from "../errors/AppError.js";
import { userRepository } from "../../modules/user/repository.js";
import School from "../../models/School.js";
import Subscription from "../../models/Subscription.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return next(new AppError("Unauthorized: token missing", 401));
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userRepository.findById(payload.userId);

    if (!user) {
      return next(new AppError("Unauthorized: user not found", 401));
    }

    if (user.schoolId) {
      const school = await School.findById(user.schoolId);
      if (!school) {
        return next(new AppError("Unauthorized: school not found", 401));
      }
      if (school.security?.isBlocked || school.security?.loginAccess === false || school.security?.isActive === false) {
        return next(new AppError("Access disabled for this school", 403));
      }

      if (school.security?.forceLogoutAt && payload.iat) {
        const issuedAtMs = payload.iat * 1000;
        const forcedAtMs = new Date(school.security.forceLogoutAt).getTime();
        if (issuedAtMs < forcedAtMs) {
          return next(new AppError("Session expired. Please login again.", 401));
        }
      }

      const subscription = await Subscription.findOne({ schoolId: user.schoolId });
      if (subscription) {
        const now = new Date();
        if (["ACTIVE", "TRIAL"].includes(subscription.status) && subscription.endDate && new Date(subscription.endDate) < now) {
          subscription.status = "EXPIRED";
          await subscription.save();
        }
        if (subscription.status === "EXPIRED") {
          return next(new AppError("Subscription expired. Access restricted.", 403));
        }
      }
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      schoolId: user.schoolId?.toString() || null,
      email: user.email,
      tokenIssuedAt: payload.iat || null,
    };

    return next();
  } catch (error) {
    return next(new AppError("Unauthorized: invalid token", 401));
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError("Forbidden: insufficient permissions", 403));
  }
  return next();
};
