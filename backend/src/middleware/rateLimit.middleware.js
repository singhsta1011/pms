const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

/* ======================================================
   ⭐ GLOBAL API SHIELD
====================================================== */

exports.apiLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,

  max: (req) => {
    if (req.user?.role === "SUPER_ADMIN") return 500;
    return 200;
  },

  keyGenerator: (req) => {

    // ⭐ SAFE IPV6 SUPPORT
    const ipKey = ipKeyGenerator(req);

    return req.user?.id
      ? `USER_${req.user.id}`
      : ipKey;
  },

  message: {
    message: "Too many requests. Please slow down.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});


/* ======================================================
   🔐 AUTH SHIELD
====================================================== */

exports.authLimiter = rateLimit({

  windowMs: 15 * 60 * 1000,
  max: 10,

  keyGenerator: (req) => {

    const ipKey = ipKeyGenerator(req);

    return `${ipKey}_${req.body.email || "unknown"}`;
  },

  message: {
    message: "Too many login attempts. Try again later.",
  },

});