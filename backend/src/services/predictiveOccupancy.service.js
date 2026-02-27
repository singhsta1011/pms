const { Booking, Room } = require("../models");
const { Op } = require("sequelize");

//
// ⭐ ENTERPRISE PREDICTIVE OCCUPANCY ENGINE
//
exports.calculatePrediction = async (hotelId) => {
  try {

    const now = new Date();

    // =====================================================
    // ⭐ PREDICTION WINDOW (24 HOURS)
    // =====================================================
    const next24h = new Date(now);
    next24h.setHours(now.getHours() + 24);

    // =====================================================
    // ⭐ TOTAL ROOMS
    // =====================================================
    const totalRooms = await Room.count({
      where: {
        hotelId,
        isActive: true
      },
    });

    if (totalRooms === 0) {
      return {
        hotelId,
        predictedOccupancy: 0,
        upcomingBookings: 0,
        activeStays: 0,
        predictionWindow: "24h",
        alert: null,
      };
    }

    // =====================================================
    // ⭐ CURRENT ACTIVE STAYS
    // (Guests already inside hotel)
    // =====================================================
    const activeStays = await Booking.count({
      where: {
        hotelId,
        status: {
          [Op.in]: ["CHECKED_IN"]
        },
        checkIn: { [Op.lte]: now },
        checkOut: { [Op.gte]: now },
      },
    });

    // =====================================================
    // ⭐ UPCOMING ARRIVALS (NEXT 24H)
    // =====================================================
    const upcomingBookings = await Booking.count({
      where: {
        hotelId,
        status: {
          [Op.in]: ["CONFIRMED", "CHECKED_IN"],
        },
        checkIn: {
          [Op.between]: [now, next24h],
        },
      },
    });

    // =====================================================
    // ⭐ FINAL OCCUPANCY PREDICTION
    // =====================================================
    const totalDemand = activeStays + upcomingBookings;

    const predictedOccupancy = Math.round(
      (totalDemand / totalRooms) * 100
    );

    // =====================================================
    // ⭐ ENTERPRISE ALERT SYSTEM
    // =====================================================
    let alert = null;

    if (predictedOccupancy >= 90) {
      alert = "CRITICAL_OCCUPANCY";
    } else if (predictedOccupancy >= 75) {
      alert = "HIGH_OCCUPANCY_WARNING";
    } else if (predictedOccupancy <= 20) {
      alert = "LOW_OCCUPANCY_DROP";
    }

    return {
      hotelId,
      predictedOccupancy,
      upcomingBookings,
      activeStays,
      totalRooms,
      predictionWindow: "24h",
      alert,
    };

  } catch (err) {
    console.error("Prediction engine error:", err.message);

    return {
      hotelId,
      predictedOccupancy: 0,
      upcomingBookings: 0,
      activeStays: 0,
      predictionWindow: "24h",
      alert: null,
    };
  }
};