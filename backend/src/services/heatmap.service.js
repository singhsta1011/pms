const { Room, Booking } = require("../models");
const { Op } = require("sequelize");

exports.calculateHeatmap = async (hotelId) => {
  const totalRooms = await Room.count({
    where: { hotelId },
  });

  const occupiedRooms = await Booking.count({
    where: {
      hotelId,
      status: "CHECKED_IN",
    },
  });

  const activeBookings = await Booking.count({
    where: {
      hotelId,
      status: {
        [Op.in]: ["BOOKED", "CHECKED_IN"],
      },
    },
  });

  const totalRevenue =
    (await Booking.sum("totalAmount", {
      where: { hotelId },
    })) || 0;

  const occupancyRate =
    totalRooms === 0
      ? 0
      : Math.round((occupiedRooms / totalRooms) * 100);

  return {
    hotelId,
    totalRooms,
    occupiedRooms,
    availableRooms: totalRooms - occupiedRooms,
    activeBookings,
    totalRevenue,
    occupancyRate,
  };
};
