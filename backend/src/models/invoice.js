  module.exports = (sequelize, DataTypes) => {

    const Invoice = sequelize.define("Invoice",{

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

      bookingId:{
        type:DataTypes.INTEGER,
        allowNull:false
      },

      // ⭐ NEW — staff who created invoice
      createdBy:{
        type:DataTypes.INTEGER,
        allowNull:true
      },

      /* =====================================================
        ⭐ BASIC INFO
      ===================================================== */

      invoiceNumber:{
        type:DataTypes.STRING,
        unique:true
      },

      invoiceType:{
        type:DataTypes.ENUM("PROFORMA","FINAL"),
        defaultValue:"PROFORMA"
      },

      invoiceDate:{
        type:DataTypes.DATE,
        defaultValue:DataTypes.NOW
      },

      /* =====================================================
        ⭐ FINANCIAL DATA (ENTERPRISE SAFE)
      ===================================================== */

      taxableAmount:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0
      },

      gstAmount:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0
      },

      discount:{
        type:DataTypes.DECIMAL(10,2),
        defaultValue:0
      },

      amount:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:false
      },

      grandTotal:{
        type:DataTypes.DECIMAL(10,2),
        allowNull:true
      },

      /* =====================================================
        ⭐ PAYMENT STATUS
      ===================================================== */

      status:{
        type:DataTypes.ENUM("UNPAID","PARTIAL","PAID"),
        defaultValue:"UNPAID"
      },

      paidAt:{
        type:DataTypes.DATE,
        allowNull:true
      },

      /* =====================================================
        ⭐ LOCKING & CONTROL
      ===================================================== */

      locked:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
      },

      notes:{
        type:DataTypes.TEXT,
        allowNull:true
      },

      meta:{
        type:DataTypes.JSON,
        allowNull:true
      }

    },{
      tableName:"invoices",
      timestamps:true,
      indexes:[
        { unique:true, fields:["invoiceNumber"] },
        { fields:["hotelId"] },
        { fields:["status"] }
      ]
    });

    return Invoice;
  };