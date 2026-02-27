const { Booking, Room } = require("../models");
const { Op } = require("sequelize");

//
// ⭐ ENTERPRISE REVENUE OPTIMIZER ENGINE
//
exports.calculateRevenueOptimization = async (hotelId) => {
  try {

    const now = new Date();

    // =====================================================
    // ⭐ TOTAL ACTIVE ROOMS
    // =====================================================
    const totalRooms = await Room.count({
      where: {
        hotelId,
        isActive: true,
      },
    });

    if (!totalRooms) {
      return {
        hotelId,
        occupancyRate: 0,
        recommendation: "NORMAL",
        multiplier: 1,
      };
    }

    // =====================================================
    // ⭐ CURRENT OCCUPIED ROOMS
    // =====================================================
    const activeBookings = await Booking.count({
      where: {
        hotelId,
        status: {
          [Op.in]: ["CHECKED_IN"],
        },
        checkIn: { [Op.lte]: now },
        checkOut: { [Op.gte]: now },
      },
      distinct: true,
      col: "roomId",
    });

    // =====================================================
    // ⭐ OCCUPANCY RATE (REAL PMS LOGIC)
    // =====================================================
    const occupancyRate = Math.round(
      (activeBookings / totalRooms) * 100
    );

    // =====================================================
    // ⭐ ENTERPRISE REVENUE STRATEGY
    // =====================================================
    let recommendation = "NORMAL";
    let multiplier = 1;

    if (occupancyRate >= 90) {
      recommendation = "SURGE_PRICE";
      multiplier = 1.7;
    } else if (occupancyRate >= 75) {
      recommendation = "INCREASE_PRICE";
      multiplier = 1.4;
    } else if (occupancyRate >= 50) {
      recommendation = "BOOST_PRICE";
      multiplier = 1.2;
    } else if (occupancyRate <= 20) {
      recommendation = "AGGRESSIVE_DISCOUNT";
      multiplier = 0.8;
    }

    return {
      hotelId,
      occupancyRate,
      activeBookings,
      totalRooms,
      recommendation,
      multiplier,
    };

  } catch (err) {
    console.error("Revenue optimizer error:", err.message);

    return {
      hotelId,
      occupancyRate: 0,
      recommendation: "NORMAL",
      multiplier: 1,
    };
  }
};