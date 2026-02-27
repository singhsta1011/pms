const { Room, Hotel } = require("../models");
const { createAuditLog } = require("../services/audit.service");

//
// ==========================================================
// ➕ CREATE ROOM (ENTERPRISE SAFE)
// ==========================================================
//
exports.createRoom = async (req, res) => {

  try {

    let { hotelId } = req.body;

    /* ======================================================
       🔐 MULTI TENANT SECURITY
    ====================================================== */

    if (req.user.role === "HOTEL_ADMIN") {
      hotelId = req.user.hotelId; // force own hotel
    }

    const hotel = await Hotel.findByPk(hotelId);

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    /* ======================================================
       ⭐ DUPLICATE ROOM CHECK
    ====================================================== */

    const existing = await Room.findOne({
      where:{
        hotelId,
        roomNumber:req.body.roomNumber
      }
    });

    if(existing){
      return res.status(400).json({
        message:"Room number already exists in this hotel"
      });
    }

    /* ======================================================
       ⭐ CREATE ROOM
    ====================================================== */

    const room = await Room.create({
      ...req.body,
      hotelId
    });

    /* ======================================================
       ⭐ AUDIT LOG
    ====================================================== */

    await createAuditLog({
      userId:req.user.id,
      hotelId,
      action:"CREATE",
      entity:"ROOM",
      entityId:room.id
    });

    res.status(201).json({
      message:"Room created successfully",
      data:room
    });

  } catch (error) {

    res.status(500).json({
      message:"Failed to create room",
      error:error.message
    });

  }
};


//
// ==========================================================
// 📋 GET ROOMS (ROLE SAFE + AUTO HOTEL FILTER)
// ==========================================================
//
exports.getRoomsByHotel = async (req, res) => {

  try {

    let where = {};

    /* ======================================================
       🔐 MULTI TENANT FILTER
    ====================================================== */

    if (req.user.role === "HOTEL_ADMIN") {
      where.hotelId = req.user.hotelId;
    }

    // SUPER ADMIN optional filter
    if (req.query.hotelId) {
      where.hotelId = req.query.hotelId;
    }

    const rooms = await Room.findAll({
      where,
      order:[["roomNumber","ASC"]]
    });

    res.json({ data: rooms });

  } catch (error) {

    res.status(500).json({
      message:"Failed to fetch rooms",
      error:error.message
    });

  }
};