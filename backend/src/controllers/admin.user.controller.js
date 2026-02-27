const db = require("../models");
const { createAuditLog } = require("../services/audit.service");
const { Op } = require("sequelize");

/*
==========================================================
➕ CREATE USER (HOTEL ADMIN ONLY)
==========================================================
*/
exports.createUser = async (req,res)=>{

  const t = await db.sequelize.transaction();

  try{

    if(req.user.role !== "HOTEL_ADMIN"){
      return res.status(403).json({
        message:"Only HOTEL_ADMIN can create users"
      });
    }

    const {
      name,
      email,
      password,
      roleType,
      modules,
      roomLimit
    } = req.body;

    /* ================= ROLE TYPE VALIDATION ================= */

    const allowedTypes = [
      "RECEPTIONIST",
      "HOUSEKEEPING",
      "ACCOUNTANT",
      "MANAGER"
    ];

    if(roleType && !allowedTypes.includes(roleType)){
      return res.status(400).json({
        message:"Invalid roleType"
      });
    }

    /* ================= DUPLICATE CHECK ================= */

    const existing = await db.User.findOne({
      where:{ email },
      transaction:t
    });

    if(existing){
      return res.status(400).json({
        message:"User email already exists"
      });
    }

    /* ================= CREATE USER ================= */

    const user = await db.User.create({

      name,
      email,
      password,

      role:"USER",                 // ⭐ FIXED ROLE
      roleType: roleType || "HOUSEKEEPING",

      hotelId:req.user.hotelId,
      hotelName:req.user.hotelName,
      hotelCode:req.user.hotelCode,

      modules:modules || [],
      roomLimit:roomLimit || 0,

      createdBy:req.user.id,
      status:"ACTIVE"

    },{ transaction:t });

    await createAuditLog({
      userId:req.user.id,
      hotelId:req.user.hotelId,
      action:"CREATE_USER",
      entity:"USER",
      entityId:user.id
    });

    await t.commit();

    res.status(201).json({
      message:"User created successfully",
      data:user
    });

  }catch(error){

    await t.rollback();

    res.status(500).json({
      message:"Create user failed",
      error:error.message
    });
  }
};



/*
==========================================================
📋 LIST USERS
==========================================================
*/
exports.getUsers = async(req,res)=>{
  try{

    let whereCondition = {
      role:"USER"
    };

    if(req.user.role==="HOTEL_ADMIN"){
      whereCondition.hotelId = req.user.hotelId;
    }

    const users = await db.User.findAll({
      where:whereCondition,
      attributes:[
        "id",
        "name",
        "email",
        "role",
        "roleType",
        "modules",
        "roomLimit",
        "status",
        "createdAt"
      ],
      order:[["createdAt","DESC"]]
    });

    res.json({ data:users });

  }catch(error){
    res.status(500).json({
      message:"Fetch users failed",
      error:error.message
    });
  }
};



/*
==========================================================
✏️ UPDATE USER
==========================================================
*/
exports.updateUser = async(req,res)=>{
  try{

    if(req.user.role!=="HOTEL_ADMIN"){
      return res.status(403).json({
        message:"Only HOTEL_ADMIN allowed"
      });
    }

    const { id } = req.params;

    const {
      name,
      email,
      roleType,
      modules,
      roomLimit
    } = req.body;

    const user = await db.User.findByPk(id);

    if(!user){
      return res.status(404).json({
        message:"User not found"
      });
    }

    if(user.hotelId !== req.user.hotelId){
      return res.status(403).json({
        message:"Cannot edit another hotel user"
      });
    }

    await user.update({
      name:name ?? user.name,
      email:email ?? user.email,
      roleType:roleType ?? user.roleType,
      modules:modules ?? user.modules,
      roomLimit:roomLimit ?? user.roomLimit
    });

    await createAuditLog({
      userId:req.user.id,
      hotelId:req.user.hotelId,
      action:"UPDATE_USER",
      entity:"USER",
      entityId:id
    });

    res.json({
      message:"User updated successfully",
      data:user
    });

  }catch(error){
    res.status(500).json({
      message:"Update user failed",
      error:error.message
    });
  }
};



/*
==========================================================
🔄 TOGGLE USER STATUS
==========================================================
*/
exports.toggleUserStatus = async(req,res)=>{
  try{

    if(req.user.role!=="HOTEL_ADMIN"){
      return res.status(403).json({
        message:"Only HOTEL_ADMIN allowed"
      });
    }

    const { id } = req.params;

    const user = await db.User.findByPk(id);

    if(!user){
      return res.status(404).json({
        message:"User not found"
      });
    }

    if(user.hotelId !== req.user.hotelId){
      return res.status(403).json({
        message:"Not allowed"
      });
    }

    user.status =
      user.status === "ACTIVE"
        ? "SUSPENDED"
        : "ACTIVE";

    await user.save();

    await createAuditLog({
      userId:req.user.id,
      hotelId:req.user.hotelId,
      action:"USER_STATUS_CHANGE",
      entity:"USER",
      entityId:id,
      meta:{ status:user.status }
    });

    res.json({
      message:"User status updated",
      data:user
    });

  }catch(error){
    res.status(500).json({
      message:"User status update failed",
      error:error.message
    });
  }
};