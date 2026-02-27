const { Booking, Room } = require("../models");
const { Op } = require("sequelize");

/**
 * ==========================================================
 * ⭐ ENTERPRISE LIVE ROOM STATUS ENGINE
 * ==========================================================
 *
 * Returns:
 * AVAILABLE
 * OCCUPIED
 * UPCOMING
 * CLEANING
 * OUT_OF_SERVICE
 * MAINTENANCE
 */

exports.getRoomStatus = async (roomId) => {
  try {

    const now = new Date();

    //
    // ======================================================
    // ⭐ LOAD ROOM FIRST (important for manual status)
    // ======================================================
    //
    const room = await Room.findByPk(roomId, {
      attributes: ["id", "status"],
    });

    if (!room) {
      return "UNKNOWN";
    }

    // ======================================================
    // ⭐ HARD ROOM STATES (priority override)
    // ======================================================
    if (["CLEANING", "OUT_OF_SERVICE", "MAINTENANCE"].includes(room.status)) {
      return room.status;
    }

    //
    // ======================================================
    // ⭐ GET ACTIVE / UPCOMING BOOKINGS IN ONE QUERY
    // ======================================================
    //
    const bookings = await Booking.findAll({
      where: {
        roomId,
        status: {
          [Op.notIn]: ["CANCELLED", "COMPLETED"],
        },
        [Op.or]: [
          {
            // active
            checkIn: { [Op.lte]: now },
            checkOut: { [Op.gte]: now },
          },
          {
            // upcoming
            checkIn: { [Op.gt]: now },
          },
        ],
      },
      order: [["checkIn", "ASC"]],
      attributes: ["id", "status", "checkIn", "checkOut"],
    });

    //
    // ======================================================
    // ⭐ STATUS DECISION ENGINE
    // ======================================================
    //

    // ACTIVE BOOKING → OCCUPIED
    const active = bookings.find(
      (b) =>
        new Date(b.checkIn) <= now &&
        new Date(b.checkOut) >= now
    );

    if (active) {
      return "OCCUPIED";
    }

    // UPCOMING BOOKING → UPCOMING
    const upcoming = bookings.find(
      (b) => new Date(b.checkIn) > now
    );

    if (upcoming) {
      return "UPCOMING";
    }

    // DEFAULT
    return "AVAILABLE";

  } catch (error) {
    console.error("Room status error:", error.message);
    return "AVAILABLE";
  }
};