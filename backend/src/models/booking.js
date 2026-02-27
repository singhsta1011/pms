module.exports = (sequelize, DataTypes) => {

  const Booking = sequelize.define(
    "Booking",
    {
      id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
      },

      /* =====================================================
         ⭐ RELATIONS
      ===================================================== */

      hotelId:{
        type:DataTypes.INTEGER,
        allowNull:false,
      },

      roomId:{
        type:DataTypes.INTEGER,
        allowNull:false,
      },

      guestId:{
        type:DataTypes.INTEGER,
        allowNull:true
      },

      // ⭐ NEW — which USER created booking (frontdesk staff)
      createdBy:{
        type:DataTypes.INTEGER,
        allowNull:true
      },

      /* =====================================================
         ⭐ GUEST INFO SNAPSHOT
      ===================================================== */

      guestName:{
        type:DataTypes.STRING,
        allowNull:false,
      },

      guestPhone:{
        type:DataTypes.STRING,
        allowNull:false,
      },

      /* =====================================================
         ⭐ BOOKING DETAILS
      ===================================================== */

      bookingType:{
        type:DataTypes.ENUM("HOURLY","DAILY"),
        allowNull:false,
      },

      // ⭐ NEW — online/offline channel
      bookingSource:{
        type:DataTypes.ENUM("OFFLINE","ONLINE","WALKIN"),
        defaultValue:"OFFLINE"
      },

      checkIn:{
        type:DataTypes.DATE,
        allowNull:false,
      },

      checkOut:{
        type:DataTypes.DATE,
        allowNull:false,
      },

      totalAmount:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false,
      },

      /* =====================================================
         ⭐ PAYMENT STATUS (VERY IMPORTANT)
      ===================================================== */

      paymentStatus:{
        type:DataTypes.ENUM(
          "UNPAID",
          "PARTIAL",
          "PAID"
        ),
        defaultValue:"UNPAID"
      },

      /* =====================================================
         ⭐ ENTERPRISE WORKFLOW STATUS
      ===================================================== */

      status:{
        type:DataTypes.ENUM(
          "PENDING",
          "CONFIRMED",
          "CHECKED_IN",
          "CHECKED_OUT",
          "COMPLETED",
          "CANCELLED"
        ),
        defaultValue:"PENDING",
      },

      /* =====================================================
         ⭐ EXTRA PMS FIELDS (PRO LEVEL)
      ===================================================== */

      adults:{
        type:DataTypes.INTEGER,
        defaultValue:1
      },

      children:{
        type:DataTypes.INTEGER,
        defaultValue:0
      },

      notes:{
        type:DataTypes.TEXT,
        allowNull:true
      }

    },
    {
      tableName:"bookings",
      timestamps:true   // ⭐ createdAt / updatedAt
    }
  );

  return Booking;
};