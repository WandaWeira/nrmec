const jwt = require("jsonwebtoken");
const { User, PendingAction } = require("../models");

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error("No token provided");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ where: { id: decoded.userId } });
    if (!user) {
      throw new Error("User not found");
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        error: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    } else {
      res.status(401).json({
        error: "Invalid token. Please authenticate.",
        code: "INVALID_TOKEN",
      });
    }
  }
};

const checkPermission = (requiredRole) => {
  return async (req, res, next) => {
    const userRole = req.user.role;

    if (userRole === "SuperAdmin") {
      return next();
    }

    // Add Accountant role with view permissions
    if (userRole === "Accountant" && req.method === "GET") {
      return next();
    }

    if (userRole === "PEO" && req.method === "GET") {
      return next();
    }

    if (userRole === "RegionalCoordinator" || userRole === "DistrictRegistra") {
      if (req.method === "GET") {
        return next();
      }

      if (
        req.method === "POST" ||
        req.method === "PUT" ||
        req.method === "DELETE"
      ) {
        const pendingAction = await PendingAction.create({
          actionType:
            req.method === "POST"
              ? "CREATE"
              : req.method === "PUT"
              ? "UPDATE"
              : "DELETE",
          entityType: req.baseUrl.split("/")[1],
          entityId: req.params.id,
          data: req.body,
          actionBy: req.user.id,
          requestedBy: req.user.id,
          status: "PENDING",
        });
        return res
          .status(202)
          .json({
            message: "Action submitted for approval",
            pendingActionId: pendingAction.id,
          });
      }
    }

    res.status(403).json({ message: "Access denied" });
  };
};

module.exports = { authMiddleware, checkPermission };
