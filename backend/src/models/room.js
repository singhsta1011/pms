module.exports = (sequelize, DataTypes) => {

  const Room = sequelize.define(
    "Room",
    {

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

      /* =====================================================
         ⭐ BASIC INFO
      ===================================================== */

      roomNumber:{
        type:DataTypes.STRING,
        allowNull:false
      },

      roomType:{
        type:DataTypes.STRING,
        allowNull:false
      },

      floor:{
        type:DataTypes.STRING,
        allowNull:true
      },

      maxGuests:{
        type:DataTypes.INTEGER,
        defaultValue:2
      },

      /* =====================================================
         ⭐ PRICING
      ===================================================== */

      pricePerHour:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false
      },

      pricePerDay:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false
      },

      extraAdultCharge:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0
      },

      /* =====================================================
         ⭐ ROOM STATUS (REAL PMS FEATURE)
      ===================================================== */

      status:{
        type:DataTypes.ENUM(
          "AVAILABLE",
          "OCCUPIED",
          "CLEANING",
          "OUT_OF_SERVICE",
          "MAINTENANCE"
        ),
        defaultValue:"AVAILABLE"
      },

      isActive:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
      },

      lastCleanedAt:{
        type:DataTypes.DATE,
        allowNull:true
      },

      notes:{
        type:DataTypes.TEXT,
        allowNull:true
      }

    },
    {
      tableName:"rooms",
      timestamps:true,
      indexes:[
        { fields:["hotelId"] },
        { fields:["status"] },
        { unique:true, fields:["hotelId","roomNumber"] }
      ]
    }
  );

  return Room;
};