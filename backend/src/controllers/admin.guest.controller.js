const db = require("../models");
const { createAuditLog } = require("../services/audit.service");
const { Op } = require("sequelize");

//
// ==========================================================
// ➕ CREATE / FIND GUEST (ENTERPRISE SAFE)
// ==========================================================
//
exports.createGuest = async (req,res)=>{

  const t = await db.sequelize.transaction();

  try{

    const hotelId = req.user.hotelId;

    const {
      fullName,
      mobile,
      email,
      country,
      state,
      idType,
      idNumber
    } = req.body;

    const idImage = req.file ? req.file.filename : null;

    /* ======================================================
       ⭐ PREVENT DUPLICATE GUEST
       mobile OR idNumber inside same hotel
    ====================================================== */

    let guest = await db.Guest.findOne({
      where:{
        hotelId,
        [Op.or]:[
          { mobile },
          { idNumber }
        ]
      },
      transaction:t
    });

    /* ======================================================
       ⭐ CREATE NEW GUEST
    ====================================================== */

    if(!guest){

      guest = await db.Guest.create({

        hotelId,
        createdBy:req.user.id,
        fullName,
        mobile,
        email,
        country,
        state,
        idType,
        idNumber,
        idImage

      },{ transaction:t });

      await createAuditLog({
        userId:req.user.id,
        hotelId,
        action:"CREATE_GUEST",
        entity:"GUEST",
        entityId:guest.id
      });
    }

    await t.commit();

    res.json({ data:guest });

  }catch(error){

    await t.rollback();

    res.status(500).json({
      message:"Guest creation failed",
      error:error.message
    });
  }
};

//
// ==========================================================
// 📋 LIST GUESTS (ROLE SAFE + OPTIMIZED)
// ==========================================================
//
exports.getGuests = async(req,res)=>{

  try{

    let where = {};

    // HOTEL_ADMIN sees only own hotel
    if(req.user.role==="HOTEL_ADMIN"){
      where.hotelId = req.user.hotelId;
    }

    // SUPER_ADMIN optional filter
    if(req.query.hotelId){
      where.hotelId = req.query.hotelId;
    }

    const guests = await db.Guest.findAll({
      where,
      attributes:[
        "id",
        "fullName",
        "mobile",
        "email",
        "country",
        "state",
        "createdAt"
      ],
      order:[["createdAt","DESC"]]
    });

    res.json({ data:guests });

  }catch(error){
    res.status(500).json({
      message:"Fetch guests failed",
      error:error.message
    });
  }
};

//
// ==========================================================
// 👤 GET GUEST HISTORY (SECURE VERSION)
// ==========================================================
//
exports.getGuestHistory = async(req,res)=>{

  try{

    const { id } = req.params;

    let where = { id };

    // HOTEL_ADMIN restriction
    if(req.user.role==="HOTEL_ADMIN"){
      where.hotelId = req.user.hotelId;
    }

    const guest = await db.Guest.findOne({
      where,
      include:[
        {
          model: db.Booking,
          attributes:[
            "id",
            "roomId",
            "status",
            "checkIn",
            "checkOut",
            "totalAmount"
          ]
        }
      ]
    });

    if(!guest){
      return res.status(404).json({
        message:"Guest not found"
      });
    }

    res.json({ data:guest });

  }catch(error){
    res.status(500).json({
      message:"History fetch failed",
      error:error.message
    });
  }
};