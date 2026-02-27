const { Room, Booking } = require("../models");

//
// ⭐ AI AUTO UPGRADE ENGINE
//
exports.findUpgradeRoom = async (hotelId, roomType, checkIn, checkOut) => {
  try {
    // ⭐ Find better rooms than requested type
    const upgradeRooms = await Room.findAll({
      where: {
        hotelId,
        isActive: true,
      },
      order: [["pricePerDay", "DESC"]], // higher value rooms first
    });

    if (!upgradeRooms.length) return null;

    // ⭐ Simple AI Logic
    // If occupancy is low → upgrade user
    const totalBookings = await Booking.count({
      where: { hotelId },
    });

    const totalRooms = upgradeRooms.length || 1;
    const occupancyRate = (totalBookings / totalRooms) * 100;

    // 🔥 Auto Upgrade Condition
    if (occupancyRate < 40) {
      const betterRoom = upgradeRooms.find(
        (r) => r.roomType !== roomType
      );

      if (betterRoom) {
        return betterRoom;
      }
    }

    return null;

  } catch (err) {
    console.error("Auto upgrade error:", err.message);
    return null;
  }
};
