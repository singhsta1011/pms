const { Hotel, Room, Booking } = require("../models");
const { Op } = require("sequelize");

exports.getDashboardStats = async (req, res) => {

  try {

    let hotelFilter = {};
    let roomFilter = {};
    let bookingFilter = {};

    /* ======================================================
       🔐 MULTI TENANT FILTER
    ====================================================== */

    if (req.user.role === "HOTEL_ADMIN") {
      hotelFilter.id = req.user.hotelId;
      roomFilter.hotelId = req.user.hotelId;
      bookingFilter.hotelId = req.user.hotelId;
    }

    // SUPER ADMIN optional filter
    if (req.query.hotelId) {
      roomFilter.hotelId = req.query.hotelId;
      bookingFilter.hotelId = req.query.hotelId;
      hotelFilter.id = req.query.hotelId;
    }

    /* ======================================================
       ⭐ PARALLEL STATS QUERY (FAST DASHBOARD)
    ====================================================== */

    const [
      totalHotels,
      totalRooms,
      totalBookings,
      activeBookings,
      occupiedRooms
    ] = await Promise.all([

      Hotel.count({ where: hotelFilter }),

      Room.count({ where: roomFilter }),

      Booking.count({ where: bookingFilter }),

      Booking.count({
        where:{
          ...bookingFilter,
          status:{
            [Op.in]:["CONFIRMED","CHECKED_IN","PENDING"]
          }
        }
      }),

      Booking.count({
        where:{
          ...bookingFilter,
          status:"CHECKED_IN"
        }
      })

    ]);

    /* ======================================================
       ⭐ OCCUPANCY CALCULATION (REAL PMS KPI)
    ====================================================== */

    const occupancyRate =
      totalRooms === 0
        ? 0
        : ((occupiedRooms / totalRooms) * 100).toFixed(2);

    /* ======================================================
       ⭐ RESPONSE
    ====================================================== */

    res.json({

      totalHotels,
      totalRooms,
      totalBookings,
      activeBookings,

      // ⭐ NEW ENTERPRISE METRICS
      occupiedRooms,
      availableRooms: totalRooms - occupiedRooms,
      occupancyRate: Number(occupancyRate)

    });

  } catch (error) {

    res.status(500).json({
      message:"Failed to load stats",
      error:error.message
    });

  }
};