const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

const { authLimiter } = require("../middleware/rateLimit.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

/* =====================================================
   🔐 PUBLIC AUTH ROUTES
===================================================== */

// ⭐ Login with rate limiter (ALL ROLES)
router.post("/login", authLimiter, authController.login);


/* =====================================================
   🧑‍💼 SIGNUP ROUTES (ROLE PROTECTED)
===================================================== */

// SUPER ADMIN → create HOTEL_ADMIN
router.post(
  "/signup/admin",
  authMiddleware,
  roleMiddleware(["SUPER_ADMIN"]),
  authController.signup
);

// HOTEL ADMIN → create STAFF USER
router.post(
  "/signup/user",
  authMiddleware,
  roleMiddleware(["HOTEL_ADMIN"]),
  authController.signup
);

module.exports = router;