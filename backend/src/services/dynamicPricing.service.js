const { Room } = require("../models");

//
// ⭐ ENTERPRISE DYNAMIC PRICING ENGINE
//
exports.calculateDynamicPrice = async ({
  hotelId,
  roomId,
  predictedOccupancy,
}) => {
  try {

    const room = await Room.findByPk(roomId);

    if (!room) return null;

    // =====================================================
    // ⭐ BASE PRICE
    // =====================================================
    const baseHour = Number(room.pricePerHour || 0);
    const baseDay = Number(room.pricePerDay || 0);

    let multiplier = 1;

    // =====================================================
    // ⭐ OCCUPANCY BASED PRICING
    // (Real PMS Strategy)
    // =====================================================
    if (predictedOccupancy >= 90) multiplier = 1.6;
    else if (predictedOccupancy >= 75) multiplier = 1.4;
    else if (predictedOccupancy >= 60) multiplier = 1.25;
    else if (predictedOccupancy >= 40) multiplier = 1.1;
    else multiplier = 1;

    // =====================================================
    // ⭐ OPTIONAL WEEKEND BOOST (Enterprise Ready)
    // =====================================================
    const today = new Date().getDay(); // 0 Sun - 6 Sat
    const isWeekend = today === 5 || today === 6;

    if (isWeekend) {
      multiplier += 0.05; // small weekend premium
    }

    // =====================================================
    // ⭐ PRICE SAFETY LIMIT (VERY IMPORTANT)
    // prevents extreme AI spikes
    // =====================================================
    if (multiplier > 2) multiplier = 2;

    // =====================================================
    // ⭐ CALCULATE FINAL PRICE
    // =====================================================
    const dynamicPricePerHour = Number(
      (baseHour * multiplier).toFixed(2)
    );

    const dynamicPricePerDay = Number(
      (baseDay * multiplier).toFixed(2)
    );

    return {
      hotelId,
      roomId,
      predictedOccupancy,
      multiplier,
      dynamicPricePerHour,
      dynamicPricePerDay,
    };

  } catch (err) {
    console.error("Dynamic pricing error:", err.message);
    return null;
  }
};