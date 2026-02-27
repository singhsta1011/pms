const { Op } = require("sequelize");
const { Booking } = require("../models");

/**
 * ==========================================================
 * 🔍 ENTERPRISE ROOM AVAILABILITY CHECK
 * ==========================================================
 *
 * Overlap Rule:
 * existing.checkIn  < new.checkOut
 * AND
 * existing.checkOut > new.checkIn
 *
 * Supports:
 * ✔ Multi-tenant hotels
 * ✔ Update booking exclusion
 * ✔ Transaction-safe calls
 */

const isRoomAvailable = async ({
  roomId,
  hotelId,
  checkIn,
  checkOut,
  excludeBookingId = null,
  transaction = null, // ⭐ for race-condition safety
}) => {
  try {
    //
    // ======================================================
    // 🛑 VALIDATION
    // ======================================================
    //
    if (!roomId || !checkIn || !checkOut) {
      throw new Error("Missing availability parameters");
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (isNaN(start) || isNaN(end)) {
      throw new Error("Invalid date format");
    }

    if (start >= end) {
      throw new Error("Invalid date range");
    }

    //
    // ======================================================
    // ⭐ WHERE CONDITION
    // ======================================================
    //
    const whereCondition = {
      roomId,

      // ⭐ multi-tenant safety
      ...(hotelId ? { hotelId } : {}),

      // Ignore cancelled/completed bookings
      status: {
        [Op.notIn]: ["CANCELLED", "COMPLETED"],
      },

      // ⭐ CORE OVERLAP LOGIC
      [Op.and]: [
        {
          checkIn: {
            [Op.lt]: end,
          },
        },
        {
          checkOut: {
            [Op.gt]: start,
          },
        },
      ],
    };

    // ⭐ Ignore same booking during update
    if (excludeBookingId) {
      whereCondition.id = {
        [Op.ne]: excludeBookingId,
      };
    }

    //
    // ======================================================
    // ⚡ PERFORMANCE OPTIMIZATION
    // Only check existence (faster)
    // ======================================================
    //
    const conflict = await Booking.findOne({
      where: whereCondition,
      attributes: ["id"], // ⭐ faster query
      transaction,
    });

    return !conflict;
  } catch (error) {
    console.error("❌ Availability check error:", error.message);
    throw error;
  }
};

module.exports = {
  isRoomAvailable,
};