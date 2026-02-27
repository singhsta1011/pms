module.exports = (allowedRoles = [], requiredModule = null) => {

  return (req, res, next) => {

    try {

      /* ======================================================
         ⭐ USER VALIDATION
      ====================================================== */

      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized: user not authenticated",
        });
      }

      const userRole = req.user.role;


      /* ======================================================
         🚫 ACCOUNT SUSPENSION CHECK (NEW)
      ====================================================== */

      if (req.user.status === "SUSPENDED") {
        return res.status(403).json({
          message: "Account suspended. Contact Super Admin.",
        });
      }


      /* ======================================================
         👑 SUPER ADMIN GLOBAL ACCESS
      ====================================================== */

      if (userRole === "SUPER_ADMIN") {
        return next();
      }


      /* ======================================================
         🔐 ROLE CHECK
      ====================================================== */

      if (allowedRoles.length && !allowedRoles.includes(userRole)) {

        console.log(
          `ROLE BLOCKED → ${userRole} tried to access ${req.originalUrl}`
        );

        return res.status(403).json({
          message: "Access denied: insufficient permissions",
        });
      }


      /* ======================================================
         ⭐ MODULE PERMISSION CHECK (CLIENT REQUIREMENT)
      ====================================================== */

      if (requiredModule) {

        // HOTEL ADMIN MODULE CONTROL
        if (userRole === "HOTEL_ADMIN") {

          if (!req.user.modules || !req.user.modules.includes(requiredModule)) {
            return res.status(403).json({
              message: `Module '${requiredModule}' not enabled for this hotel`,
            });
          }
        }

        // STAFF USER PERMISSION CONTROL
        if (userRole === "USER") {

          if (!req.user.permissions || !req.user.permissions.includes(requiredModule)) {
            return res.status(403).json({
              message: `You don't have access to ${requiredModule}`,
            });
          }
        }
      }

      next();

    } catch (error) {

      console.log("ROLE MIDDLEWARE ERROR:", error.message);

      return res.status(403).json({
        message: "Role validation failed",
      });
    }
  };
};