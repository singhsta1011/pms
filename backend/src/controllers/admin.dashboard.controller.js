const { Hotel, Room, Booking } = require("../models");
const { getRoomStatus } = require("../services/roomStatus.service");
const { Op } = require("sequelize");

exports.getFullHotelView = async (req, res) => {
  try {

    let whereCondition = {};

    /* ======================================================
       🔐 ROLE FILTER
    ====================================================== */

    if (req.user.role === "HOTEL_ADMIN") {
      whereCondition.id = req.user.hotelId;
    }

    // SUPER ADMIN optional filter
    if (req.query.hotelId) {
      whereCondition.id = req.query.hotelId;
    }

    /* ======================================================
       ⭐ LOAD HOTEL DATA
    ====================================================== */

    const hotels = await Hotel.findAll({
      where: whereCondition,
      include: [
        {
          model: Room,
          include: [
            {
              model: Booking,
              required:false,

              // ⭐ ONLY ACTIVE BOOKINGS (PERFORMANCE FIX)
              where:{
                status:{
                  [Op.notIn]:["COMPLETED","CANCELLED"]
                }
              },

              attributes:[
                "id",
                "guestName",
                "checkIn",
                "checkOut",
                "status"
              ]
            }
          ]
        }
      ]
    });

    /* ======================================================
       ⭐ FAST LIVE STATUS INJECTION (PARALLEL)
    ====================================================== */

    const roomPromises = [];

    hotels.forEach(hotel=>{
      hotel.Rooms.forEach(room=>{
        roomPromises.push(
          getRoomStatus(room.id).then(status=>{
            room.dataValues.liveStatus = status;
          })
        );
      });
    });

    await Promise.all(roomPromises);

    res.json({
      data: hotels
    });

  } catch (error) {

    res.status(500).json({
      message:"Failed to load dashboard",
      error:error.message
    });
  }
};