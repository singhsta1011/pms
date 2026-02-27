module.exports = (sequelize, DataTypes) => {

  const Guest = sequelize.define("Guest",{

    id:{
      type:DataTypes.INTEGER,
      autoIncrement:true,
      primaryKey:true
    },

    /* =====================================================
       ⭐ RELATIONS
    ===================================================== */

    hotelId:{
      type:DataTypes.INTEGER,
      allowNull:false
    },

    // ⭐ which USER (staff) created this guest
    createdBy:{
      type:DataTypes.INTEGER,
      allowNull:true
    },

    /* =====================================================
       ⭐ BASIC INFO
    ===================================================== */

    fullName:{
      type:DataTypes.STRING,
      allowNull:false
    },

    mobile:{
      type:DataTypes.STRING
    },

    email:{
      type:DataTypes.STRING
    },

    gender:{
      type:DataTypes.ENUM("MALE","FEMALE","OTHER"),
      allowNull:true
    },

    dob:{
      type:DataTypes.DATEONLY,
      allowNull:true
    },

    nationality:{
      type:DataTypes.STRING,
      allowNull:true
    },

    /* =====================================================
       ⭐ ADDRESS
    ===================================================== */

    country:{
      type:DataTypes.STRING
    },

    state:{
      type:DataTypes.STRING
    },

    city:{
      type:DataTypes.STRING
    },

    address:{
      type:DataTypes.TEXT
    },

    /* =====================================================
       ⭐ IDENTITY VERIFICATION
    ===================================================== */

    idType:{
      type:DataTypes.ENUM("AADHAAR","PASSPORT","DL","VOTER_ID","OTHER"),
    },

    idNumber:{
      type:DataTypes.STRING
    },

    idImage:{
      type:DataTypes.STRING // file path
    },

    /* =====================================================
       ⭐ ENTERPRISE PMS FEATURES
    ===================================================== */

    vip:{
      type:DataTypes.BOOLEAN,
      defaultValue:false
    },

    blacklisted:{
      type:DataTypes.BOOLEAN,
      defaultValue:false
    },

    notes:{
      type:DataTypes.TEXT,
      allowNull:true
    }

  },{
    tableName:"guests",
    timestamps:true
  });

  return Guest;
};