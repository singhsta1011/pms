const { Booking } = require("../models");
const { Op } = require("sequelize");

exports.getRevenueAnalytics = async (req, res) => {

  try {

    const now = new Date();

    /* ======================================================
       ⭐ DATE RANGES
    ====================================================== */

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const yesterday = new Date(startOfDay);
    yesterday.setDate(startOfDay.getDate() - 1);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    /* ======================================================
       🔐 MULTI TENANT FILTER
    ====================================================== */

    let whereFilter = {
      status: {
        [Op.notIn]: ["CANCELLED"],
      },
    };

    if (req.user.role === "HOTEL_ADMIN") {
      whereFilter.hotelId = req.user.hotelId;
    }

    // SUPER ADMIN optional filter
    if (req.query.hotelId) {
      whereFilter.hotelId = req.query.hotelId;
    }

    /* ======================================================
       ⭐ PARALLEL QUERIES (PERFORMANCE BOOST)
    ====================================================== */

    const [
      todayRevenue,
      yesterdayRevenue,
      weeklyRevenue,
      monthlyRevenue
    ] = await Promise.all([

      Booking.sum("totalAmount", {
        where: {
          ...whereFilter,
          checkIn: { [Op.gte]: startOfDay }, // ⭐ better business logic
        },
      }),

      Booking.sum("totalAmount", {
        where: {
          ...whereFilter,
          checkIn: {
            [Op.gte]: yesterday,
            [Op.lt]: startOfDay,
          },
        },
      }),

      Booking.sum("totalAmount", {
        where: {
          ...whereFilter,
          checkIn: { [Op.gte]: startOfWeek },
        },
      }),

      Booking.sum("totalAmount", {
        where: {
          ...whereFilter,
          checkIn: { [Op.gte]: startOfMonth },
        },
      }),

    ]);

    /* ======================================================
       ⭐ GROWTH CALCULATION (ENTERPRISE KPI)
    ====================================================== */

    const todayVal = todayRevenue || 0;
    const yesterdayVal = yesterdayRevenue || 0;

    const todayGrowth =
      yesterdayVal === 0
        ? 100
        : ((todayVal - yesterdayVal) / yesterdayVal) * 100;

    /* ======================================================
       ⭐ RESPONSE
    ====================================================== */

    res.json({
      todayRevenue: todayVal,
      weeklyRevenue: weeklyRevenue || 0,
      monthlyRevenue: monthlyRevenue || 0,

      // ⭐ NEW ENTERPRISE KPI
      todayGrowth: Number(todayGrowth.toFixed(2)),
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to load revenue analytics",
      error: error.message,
    });

  }
};