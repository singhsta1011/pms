const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {

  try {

    /* ======================================================
       ⭐ READ AUTH HEADER SAFELY
    ====================================================== */

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized: Token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    /* ======================================================
       ⭐ VERIFY TOKEN
    ====================================================== */

    const decoded = jwt.verify(token, JWT_SECRET);

    // attach user payload
    req.user = decoded;

    /* ======================================================
       ⭐ MULTI TENANT SAFETY CHECK
    ====================================================== */

    const headerHotelId = req.headers["x-hotel-id"];

    if (
      decoded.role === "HOTEL_ADMIN" &&
      headerHotelId &&
      Number(headerHotelId) !== Number(decoded.hotelId)
    ) {
      return res.status(403).json({
        message: "Hotel access mismatch",
      });
    }

    next();

  } catch (error) {

    console.log("AUTH ERROR:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired",
      });
    }

    return res.status(401).json({
      message: "Invalid token",
    });

  }
};