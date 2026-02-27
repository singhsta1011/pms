const db = require("../models");
const { createAuditLog } = require("../services/audit.service");
const { Op } = require("sequelize");


//
// ==========================================================
// ➕ CREATE HOTEL + HOTEL ADMIN (SUPER ADMIN ONLY)
// ==========================================================
//
exports.createHotel = async (req, res) => {

  const t = await db.sequelize.transaction();

  try {

    /* ======================================================
       🔐 ROLE CHECK
    ====================================================== */

    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        message: "Only SUPER_ADMIN can create hotels",
      });
    }

    const {
      hotelCode,
      name,
      email,
      phone,
      address,
      city,
      state,
      // country,
      ownerName,
      gstNumber,

      // ⭐ CLIENT REQUIREMENT FIELDS
      adminEmail,
      adminPassword,
      modules,
      roomLimit
    } = req.body;


    /* ======================================================
       ⭐ DUPLICATE HOTEL CHECK
    ====================================================== */

    const existingHotel = await db.Hotel.findOne({
      where:{
        [Op.or]:[
          { hotelCode },
          { email }
        ]
      },
      transaction:t
    });

    if(existingHotel){
      return res.status(400).json({
        message:"Hotel already exists with same code or email"
      });
    }


    /* ======================================================
       ⭐ DUPLICATE ADMIN CHECK
    ====================================================== */

    const existingAdmin = await db.User.findOne({
      where:{ email: adminEmail },
      transaction:t
    });

    if(existingAdmin){
      return res.status(400).json({
        message:"Admin email already exists"
      });
    }


    /* ======================================================
       ⭐ CREATE HOTEL
    ====================================================== */

    const hotel = await db.Hotel.create({

      hotelCode,
      name,
      email,
      phone,
      address,
      city,
      state,
      // country,
      ownerName,
      gstNumber,
      status:"ACTIVE"

    },{ transaction:t });


    /* ======================================================
       ⭐ CREATE HOTEL ADMIN USER
       Uses your existing user.model.js
    ====================================================== */

    const hotelAdmin = await db.User.create({

      name: ownerName,
      email: adminEmail,
      password: adminPassword,

      role:"HOTEL_ADMIN",

      hotelId: hotel.id,
      hotelName: name,
      hotelCode: hotelCode,

      modules: modules || [],
      roomLimit: roomLimit || 0,

      createdBy:req.user.id,
      status:"ACTIVE"

    },{ transaction:t });


    /* ======================================================
       ⭐ AUDIT LOG
    ====================================================== */

    await createAuditLog({
      userId:req.user.id,
      hotelId:hotel.id,
      action:"CREATE_HOTEL_WITH_ADMIN",
      entity:"HOTEL",
      entityId:hotel.id,
      meta:{
        adminId:hotelAdmin.id
      }
    });


    await t.commit();

    res.status(201).json({
      message:"Hotel + Admin created successfully",
      data:{
        hotel,
        hotelAdmin
      }
    });

  } catch (error) {

    await t.rollback();

    res.status(500).json({
      message:"Failed to create hotel",
      error:error.message
    });
  }
};


//
// ==========================================================
// 📋 LIST HOTELS (ROLE SAFE + SAAS READY)
// ==========================================================
//
exports.getHotels = async (req, res) => {

  try {

    let whereCondition = {};

    // 🔐 HOTEL_ADMIN sees only their hotel
    if (req.user.role === "HOTEL_ADMIN") {
      whereCondition.id = req.user.hotelId;
    }

    // SUPER_ADMIN filter
    if(req.query.status){
      whereCondition.status = req.query.status;
    }

    const hotels = await db.Hotel.findAll({
      where:whereCondition,
      attributes:[
        "id",
        "hotelCode",
        "name",
        "city",
        "state",
        "country",
        "status",
        // "subscriptionPlan",
        "createdAt"
      ],
      order:[["createdAt","DESC"]]
    });

    res.json({ data:hotels });

  } catch (error) {

    res.status(500).json({
      message:"Failed to fetch hotels",
      error:error.message
    });
  }
};


//
// ==========================================================
// 🔄 TOGGLE HOTEL STATUS (SUPER ADMIN CONTROL)
// ==========================================================
//
exports.toggleHotelStatus = async(req,res)=>{

  try{

    if(req.user.role!=="SUPER_ADMIN"){
      return res.status(403).json({
        message:"Only SUPER_ADMIN can change hotel status"
      });
    }

    const { id } = req.params;

    const hotel = await db.Hotel.findByPk(id);

    if(!hotel){
      return res.status(404).json({
        message:"Hotel not found"
      });
    }

    /* ======================================================
       ⭐ TOGGLE STATUS
    ====================================================== */

    hotel.status =
      hotel.status === "ACTIVE"
        ? "SUSPENDED"
        : "ACTIVE";

    await hotel.save();


    /* ======================================================
       ⭐ ALSO UPDATE HOTEL ADMIN LOGIN STATUS
       (CLIENT REQUIREMENT)
    ====================================================== */

    await db.User.update(
      {
        status: hotel.status === "ACTIVE"
          ? "ACTIVE"
          : "SUSPENDED"
      },
      {
        where:{
          hotelId:hotel.id,
          role:"HOTEL_ADMIN"
        }
      }
    );


    /* ======================================================
       ⭐ AUDIT LOG
    ====================================================== */

    await createAuditLog({
      userId:req.user.id,
      hotelId:hotel.id,
      action:"HOTEL_STATUS_CHANGE",
      entity:"HOTEL",
      entityId:hotel.id,
      meta:{ status:hotel.status }
    });

    res.json({
      message:"Hotel status updated",
      data:hotel
    });

  }catch(error){
    res.status(500).json({
      message:"Status update failed",
      error:error.message
    });
  }
};
exports.activateHotel = async (req, res) => {
  try {

    if(req.user.role !== "SUPER_ADMIN"){
      return res.status(403).json({
        message:"Only Super Admin allowed"
      });
    }

    const hotelId = req.params.id;

    await db.Hotel.update(
      { status:"ACTIVE" },
      { where:{ id:hotelId } }
    );

    res.json({ message:"Hotel activated successfully" });

  } catch (error) {
    res.status(500).json({
      message:"Activate hotel failed",
      error:error.message
    });
  }
};  

//
// ==========================================================
// ✏️ UPDATE HOTEL (SUPER ADMIN EDIT DRAWER)
// ==========================================================
//
exports.updateHotel = async (req,res)=>{
  try{

    if(req.user.role!=="SUPER_ADMIN"){
      return res.status(403).json({
        message:"Only SUPER_ADMIN allowed"
      });
    }

    const { id } = req.params;

    const {
      name,
      city,
      state,
      ownerName,
      email
    } = req.body;

    const hotel = await db.Hotel.findByPk(id);

    if(!hotel){
      return res.status(404).json({
        message:"Hotel not found"
      });
    }

    // ⭐ UPDATE ONLY BASIC FIELDS (NO UI CHANGE)
    await hotel.update({
      name:name ?? hotel.name,
      city:city ?? hotel.city,
      state:state ?? hotel.state,
      ownerName:ownerName ?? hotel.ownerName,
      email:email ?? hotel.email
    });

    // ⭐ ALSO UPDATE HOTEL ADMIN NAME (CLIENT LOGIC)
    await db.User.update(
      { name: ownerName },
      {
        where:{
          hotelId:id,
          role:"HOTEL_ADMIN"
        }
      }
    );

    await createAuditLog({
      userId:req.user.id,
      hotelId:id,
      action:"UPDATE_HOTEL",
      entity:"HOTEL",
      entityId:id
    });

    res.json({
      message:"Hotel updated successfully",
      data:hotel
    });

  }catch(error){
    res.status(500).json({
      message:"Update hotel failed",
      error:error.message
    });
  }
};