const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const jwt = require('jsonwebtoken')

const authenticate = (secret) => async (req, res, next) => {
  try {
    const token = req?.session?.token || req?.cookies?.token || req?.headers?.authorization?.split(' ')[1];

    if (!token) {
      console.error("[Auth Middleware] No token found!");
      return next(new AppError(401, "Unauthorized! Please log in."));
    }

    const decoded = jwt.verify(token, secret || process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decoded.userId })

    if (!user) return next(new AppError(404, 'Unauthorized!' ))

    req.user = decoded;
    next();
  } catch (err) {
    console.error("[Auth Middleware Error]:", err);
    return next(new AppError(401, "Invalid token"));
  }
};

exports.auth = (req, res, next) => {
  authenticate()(req, res, () => {
    if (req?.user) {
      next();
    } else {
      res.status(403).json({ status: "error", msg: "You are not allowed to do that!" });
    }
  });
};
