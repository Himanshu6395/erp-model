import jwt from "jsonwebtoken";
import AppError from "../../common/errors/AppError.js";
import { authRepository } from "./repository.js";
import LoginActivity from "../../models/LoginActivity.js";
import SecurityLog from "../../models/SecurityLog.js";
import School from "../../models/School.js";
import Subscription from "../../models/Subscription.js";

const logLoginAttempt = async ({ user, email, schoolId, ipAddress, device, status, reason }) =>
  LoginActivity.create({
    userId: user?._id || null,
    schoolId: schoolId || user?.schoolId || null,
    email: email || user?.email || "",
    role: user?.role || "",
    ipAddress: ipAddress || "",
    device: device || "",
    status,
    reason: reason || "",
    timestamp: new Date(),
  });

const blockSchoolIfSuspicious = async ({ schoolId, ipAddress }) => {
  if (!schoolId) return;
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const failedAttempts = await LoginActivity.countDocuments({
    schoolId,
    status: "FAILED",
    timestamp: { $gte: fifteenMinutesAgo },
  });
  if (failedAttempts >= 5) {
    await School.findByIdAndUpdate(schoolId, {
      "security.isBlocked": true,
      "security.blockedReason": "Auto blocked due to suspicious login failures",
      "security.blockedAt": new Date(),
      "security.loginAccess": false,
      "security.failedLoginAttempts": failedAttempts,
    });
    await SecurityLog.create({
      schoolId,
      action: "AUTO_BLOCK_SCHOOL",
      ipAddress: ipAddress || "",
      meta: { failedAttempts },
      timestamp: new Date(),
    });
  }
};

const login = async ({ email, password }, requestMeta = {}) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    await logLoginAttempt({
      email,
      ipAddress: requestMeta.ipAddress,
      device: requestMeta.device,
      status: "FAILED",
      reason: "USER_NOT_FOUND",
    });
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    if (user.schoolId) {
      await School.findByIdAndUpdate(user.schoolId, { $inc: { "security.failedLoginAttempts": 1 } });
    }
    await logLoginAttempt({
      user,
      email,
      schoolId: user.schoolId,
      ipAddress: requestMeta.ipAddress,
      device: requestMeta.device,
      status: "FAILED",
      reason: "INVALID_PASSWORD",
    });
    await blockSchoolIfSuspicious({ schoolId: user.schoolId, ipAddress: requestMeta.ipAddress });
    throw new AppError("Invalid email or password", 401);
  }

  if (user.schoolId) {
    const school = await School.findById(user.schoolId);
    if (!school) throw new AppError("School not found", 404);

    if (school.security?.isBlocked) {
      await logLoginAttempt({
        user,
        schoolId: user.schoolId,
        ipAddress: requestMeta.ipAddress,
        device: requestMeta.device,
        status: "FAILED",
        reason: "SCHOOL_BLOCKED",
      });
      throw new AppError("School is blocked. Please contact Super Admin.", 403);
    }
    if (school.security?.loginAccess === false || school.security?.isActive === false) {
      await logLoginAttempt({
        user,
        schoolId: user.schoolId,
        ipAddress: requestMeta.ipAddress,
        device: requestMeta.device,
        status: "FAILED",
        reason: "LOGIN_DISABLED",
      });
      throw new AppError("Login is disabled for this school.", 403);
    }
    if (Array.isArray(school.security?.allowedIPs) && school.security.allowedIPs.length) {
      if (!school.security.allowedIPs.includes(requestMeta.ipAddress)) {
        await logLoginAttempt({
          user,
          schoolId: user.schoolId,
          ipAddress: requestMeta.ipAddress,
          device: requestMeta.device,
          status: "FAILED",
          reason: "IP_NOT_ALLOWED",
        });
        throw new AppError("This IP is not allowed for login.", 403);
      }
    }

    const subscription = await Subscription.findOne({ schoolId: user.schoolId }).populate("planId");
    if (subscription) {
      const now = new Date();
      if (["ACTIVE", "TRIAL"].includes(subscription.status) && subscription.endDate && new Date(subscription.endDate) < now) {
        subscription.status = "EXPIRED";
        await subscription.save();
      }
      if (subscription.status === "EXPIRED") {
        await logLoginAttempt({
          user,
          schoolId: user.schoolId,
          ipAddress: requestMeta.ipAddress,
          device: requestMeta.device,
          status: "FAILED",
          reason: "SUBSCRIPTION_EXPIRED",
        });
        throw new AppError("Subscription expired. Please renew to continue.", 403);
      }
    }
    await School.findByIdAndUpdate(user.schoolId, { "security.failedLoginAttempts": 0 });
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      schoolId: user.schoolId ? user.schoolId.toString() : null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

  await logLoginAttempt({
    user,
    email,
    schoolId: user.schoolId,
    ipAddress: requestMeta.ipAddress,
    device: requestMeta.device,
    status: "SUCCESS",
    reason: "",
  });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
    },
  };
};

export const authService = {
  login,
};
