module.exports = (sequelize, DataTypes) => {

  const AuditLog = sequelize.define(
    "AuditLog",
    {

      id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
      },

      /* =====================================================
         ⭐ WHO PERFORMED ACTION
      ===================================================== */

      userId:{
        type:DataTypes.INTEGER,
        allowNull:true
      },

      role:{
        type:DataTypes.STRING,   // SUPER_ADMIN / HOTEL_ADMIN / USER
        allowNull:true
      },

      hotelId:{
        type:DataTypes.INTEGER,
        allowNull:true
      },

      /* =====================================================
         ⭐ WHAT HAPPENED
      ===================================================== */

      action:{
        type:DataTypes.STRING,   // CREATE_BOOKING / CHECKIN / UPDATE_GUEST
        allowNull:false
      },

      entity:{
        type:DataTypes.STRING,   // BOOKING / GUEST / PAYMENT / ROOM
        allowNull:false
      },

      entityId:{
        type:DataTypes.INTEGER,
        allowNull:true
      },

      description:{
        type:DataTypes.STRING,
        allowNull:true
      },

      /* =====================================================
         ⭐ REQUEST META
      ===================================================== */

      ipAddress:{
        type:DataTypes.STRING,
        allowNull:true
      },

      userAgent:{
        type:DataTypes.STRING,
        allowNull:true
      },

      meta:{
        type:DataTypes.JSON
      },

      status:{
        type:DataTypes.ENUM("SUCCESS","FAILED"),
        defaultValue:"SUCCESS"
      }

    },
    {
      tableName:"audit_logs",
      timestamps:true,
      indexes:[
        { fields:["hotelId"] },
        { fields:["userId"] },
        { fields:["entity"] }
      ]
    }
  );

  return AuditLog;
};