const { Hotel, Room, Booking } = require("../models");
const { Op } = require("sequelize");
const { getRoomStatus } = require("../services/roomStatus.service");

exports.getMegaDashboard = async (req, res) => {
  try {

    const now = new Date();

    /* ======================================================
       🔐 ROLE FILTER
    ====================================================== */

    let hotelFilter = {};
    let roomFilter = {};
    let bookingFilter = {
      status: { [Op.notIn]: ["CANCELLED"] }
    };

    if (req.user.role === "HOTEL_ADMIN") {
      hotelFilter.id = req.user.hotelId;
      roomFilter.hotelId = req.user.hotelId;
      bookingFilter.hotelId = req.user.hotelId;
    }

    /* ======================================================
       ⭐ HOTEL + ROOM COUNTS
    ====================================================== */

    const [totalHotels, totalRooms, totalBookings] = await Promise.all([
      Hotel.count({ where: hotelFilter }),
      Room.count({ where: roomFilter }),
      Booking.count({ where: bookingFilter })
    ]);

    /* ======================================================
       ⭐ REVENUE ANALYTICS
    ====================================================== */

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayRevenue, monthlyRevenue] = await Promise.all([

      Booking.sum("totalAmount", {
        where: {
          ...bookingFilter,
          createdAt: { [Op.gte]: startOfDay }
        }
      }),

      Booking.sum("totalAmount", {
        where: {
          ...bookingFilter,
          createdAt: { [Op.gte]: startOfMonth }
        }
      })
    ]);

    /* ======================================================
       ⭐ OCCUPANCY RATE (REAL PMS METRIC)
    ====================================================== */

    const occupiedRooms = await Booking.count({
      where: {
        ...bookingFilter,
        status: { [Op.in]: ["CHECKED_IN", "CONFIRMED"] }
      }
    });

    const occupancyRate =
      totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    /* ======================================================
       ⭐ LIVE ROOM STATUS (OPTIMIZED)
    ====================================================== */

    const rooms = await Room.findAll({
      where: roomFilter,
      attributes: ["id", "roomNumber", "roomType"],
      limit: 50 // ⭐ SUPER ADMIN PROTECTION
    });

    // ⭐ Run parallel instead of sequential
    const liveRooms = await Promise.all(
      rooms.map(async (room) => {

        const status = await getRoomStatus(room.id);

        return {
          id: room.id,
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          liveStatus: status
        };
      })
    );

    /* ======================================================
       ⭐ RECENT BOOKINGS
    ====================================================== */

    const recentBookings = await Booking.findAll({
      where: bookingFilter,
      limit: 5,
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "guestName",
        "totalAmount",
        "status",
        "createdAt"
      ]
    });

    /* ======================================================
       ⭐ SUPER ADMIN EXTRA METRICS
    ====================================================== */

    let activeHotels = 0;
    let disabledHotels = 0;

    if (req.user.role === "SUPER_ADMIN") {

      activeHotels = await Hotel.count({ where: { isActive: true } });
      disabledHotels = await Hotel.count({ where: { isActive: false } });

    }

    /* ======================================================
       ⭐ FINAL RESPONSE
    ====================================================== */

    res.json({

      stats: {
        totalHotels,
        totalRooms,
        totalBookings,
        occupancyRate,
        activeHotels,
        disabledHotels
      },

      revenue: {
        todayRevenue: todayRevenue || 0,
        monthlyRevenue: monthlyRevenue || 0
      },

      liveRooms,
      recentBookings

    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to load mega dashboard",
      error: error.message
    });
  }
};