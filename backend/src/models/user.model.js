const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull:false
  },

  email: {
    type: DataTypes.STRING,
    unique:true,
    allowNull:false
  },

  password: {
    type: DataTypes.STRING,
    allowNull:false
  },

  role: {
    type: DataTypes.ENUM(
      "SUPER_ADMIN",
      "HOTEL_ADMIN",
      "USER",
    ),
    defaultValue:"USER"
  },
roleType: {
    type: DataTypes.ENUM(
      "RECEPTIONIST",
      "HOUSEKEEPING",
      "ACCOUNTANT",
      "MANAGER"
    ),
  },
  /* =========================
     HOTEL SYSTEM FIELDS
  ========================== */

  // ⭐ unique identification code for HOTEL_ADMIN
  adminCode:{
    type:DataTypes.STRING,
    unique:true,
    allowNull:true
  },

  // hotel name/code (for HOTEL_ADMIN)
  hotelName:{
    type:DataTypes.STRING,
    allowNull:true
  },

  hotelCode:{
    type:DataTypes.STRING,
    unique:true,
    allowNull:true
  },

  // selected modules by superadmin
  modules:{
    type:DataTypes.JSON,
    defaultValue:[]
  },

  // room limit restriction
  roomLimit:{
    type:DataTypes.INTEGER,
    defaultValue:0
  },

  // staff permissions
  permissions:{
    type:DataTypes.JSON,
    defaultValue:[]
  },

  // who created this user
  createdBy:{
    type:DataTypes.INTEGER,
    allowNull:true
  },

  // suspend system
  status:{
    type:DataTypes.ENUM("ACTIVE","SUSPENDED"),
    defaultValue:"ACTIVE"
  }
});


// 🔐 AUTO HASH PASSWORD
User.beforeCreate(async(user)=>{

  if(user.role === "HOTEL_ADMIN"){
    const rand = Math.floor(1000 + Math.random()*9000);
    user.adminCode = `ADM-${rand}-${Date.now()}`;
  }

  if(user.password){
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt);
  }
});

module.exports = User;