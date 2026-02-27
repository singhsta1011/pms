const { Room, Booking } = require("../models");
const { Op } = require("sequelize");

exports.findBestRoom = async ({
  hotelId,
  roomType,
  checkIn,
  checkOut,
}) => {
  try {

    /* ======================================================
       ⭐ ENTERPRISE SAFE ROOM TYPE
    ====================================================== */
    const safeRoomType =
      roomType && roomType !== "ALL" ? roomType : null;

    /* ======================================================
       ⭐ FIND CONFLICT BOOKINGS
    ====================================================== */
    const conflictingBookings = await Booking.findAll({
      attributes: ["roomId"],
      where: {
        status: {
          [Op.notIn]: ["CANCELLED", "COMPLETED"],
        },
        checkIn: {
          [Op.lt]: new Date(checkOut),
        },
        checkOut: {
          [Op.gt]: new Date(checkIn),
        },
      },
      group: ["roomId"],
      raw: true,
    });

    const conflictRoomIds = conflictingBookings.map(b => b.roomId);

    /* ======================================================
       ⭐ BUILD WHERE DYNAMICALLY (VERY IMPORTANT)
    ====================================================== */
    const where = {
      hotelId,
      isActive: true,
      status: { [Op.in]: ["AVAILABLE"] },
      id: {
        [Op.notIn]: conflictRoomIds.length
          ? conflictRoomIds
          : [0],
      },
    };

    // ✅ Only add roomType if valid
    if (safeRoomType) {
      where.roomType = safeRoomType;
    }

    /* ======================================================
       ⭐ FETCH ROOM (BALANCED ALLOCATION)
    ====================================================== */
    const room = await Room.findOne({
      where,
      order: [
        ["updatedAt", "ASC"],
        ["id", "ASC"],
      ],
    });

    return room || null;

  } catch (error) {
    console.error("Smart allocation error:", error.message);
    return null;
  }
};