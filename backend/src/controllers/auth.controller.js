const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, Hotel } = require("../models");
const { createAuditLog } = require("../services/audit.service");


/* ==========================================================
   🧑‍💼 SIGNUP (ROLE SAFE + SAAS READY)
========================================================== */
exports.signup = async (req, res) => {

  try {

    const {
      name,
      email,
      password,
      role,
      hotelId,
      permissions
    } = req.body;

    /* ===============================
       DUPLICATE CHECK
    =============================== */

    const existing = await User.findOne({ where:{ email } });

    if(existing){
      return res.status(400).json({
        message:"User already exists"
      });
    }

    /* ===============================
       🔐 ROLE SAFETY LOGIC
    =============================== */

    let safeRole = "USER";

    // 👑 SUPER ADMIN → can create HOTEL_ADMIN or USER
    if(req.user?.role === "SUPER_ADMIN"){
      safeRole = role || "HOTEL_ADMIN";
    }

    // 🏨 HOTEL ADMIN → can only create staff
    if(req.user?.role === "HOTEL_ADMIN"){
      safeRole = "USER";
    }

    /* ===============================
       CREATE USER
    =============================== */

    const user = await User.create({
      name,
      email,
      password,
      role:safeRole,
      roletype,
      hotelId:hotelId || req.user?.hotelId || null,
      permissions: permissions || [],
      createdBy:req.user?.id || null,
      status:"ACTIVE"
    });

    /* ===============================
       AUDIT LOG
    =============================== */

    await createAuditLog({
      userId:req.user?.id || null,
      hotelId:user.hotelId,
      action:"CREATE",
      entity:"USER",
      entityId:user.id
    });

    res.status(201).json({
      message:"Signup successful",
      data:{
        id:user.id,
        name:user.name,
        email:user.email,
        role:user.role,
        hotelId:user.hotelId
      }
    });

  } catch(error){

    res.status(500).json({
      message:"Signup failed",
      error:error.message
    });

  }
};



/* ==========================================================
   🔐 LOGIN (SUPER_ADMIN + HOTEL_ADMIN + USER)
========================================================== */
exports.login = async (req,res)=>{

  try{

    const { email,password } = req.body;

    const user = await User.findOne({
      where:{ email },
      include:[{ model:Hotel }]
    });

    if(!user){
      return res.status(401).json({
        message:"Invalid credentials"
      });
    }

    /* ===============================
       🚫 ACCOUNT SUSPENSION CHECK
    =============================== */

    if(user.status === "SUSPENDED"){
      return res.status(403).json({
        message:"Account suspended"
      });
    }

    /* ===============================
       🏨 HOTEL STATUS CHECK (SAAS)
    =============================== */

    if(user.role !== "SUPER_ADMIN"){

      if(!user.Hotel || user.Hotel.status !== "ACTIVE"){
        return res.status(403).json({
          message:"Hotel disabled by Super Admin"
        });
      }
    }

    /* ===============================
       PASSWORD CHECK
    =============================== */

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
      return res.status(401).json({
        message:"Invalid credentials"
      });
    }

    /* ===============================
       ⭐ JWT TOKEN
    =============================== */

    const token = jwt.sign(
      {
        id:user.id,
        role:user.role,
        hotelId:user.hotelId,
        modules:user.modules || [],
        permissions:user.permissions || [],
        status:user.status
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );

    /* ===============================
       AUDIT LOGIN
    =============================== */

    await createAuditLog({
      userId:user.id,
      hotelId:user.hotelId,
      action:"LOGIN",
      entity:"USER",
      entityId:user.id
    });

    res.json({
      message:"Login successful",
      token,
      user:{
        id:user.id,
        name:user.name,
        role:user.role,
        hotelId:user.hotelId
      }
    });

  }catch(error){

    res.status(500).json({
      message:"Login failed",
      error:error.message
    });
  }
};



/* ==========================================================
   🏨 ⭐ ACTIVATE HOTEL (SUPER ADMIN CONTROL)
========================================================== */

exports.activateHotel = async(req,res)=>{

  try{

    // 🔐 Only SUPER_ADMIN allowed
    if(req.user?.role !== "SUPER_ADMIN"){
      return res.status(403).json({
        message:"Only Super Admin can activate hotel"
      });
    }

    const hotelId = req.params.id;

    await Hotel.update(
      { status:"ACTIVE" },
      { where:{ id:hotelId } }
    );

    await createAuditLog({
      userId:req.user.id,
      hotelId:hotelId,
      action:"ACTIVATE",
      entity:"HOTEL",
      entityId:hotelId
    });

    res.json({
      message:"Hotel activated successfully"
    });

  }catch(error){

    res.status(500).json({
      message:"Activate hotel failed",
      error:error.message
    });

  }
};