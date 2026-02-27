module.exports = (sequelize, DataTypes) => {

  const Payment = sequelize.define("Payment",{

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

    invoiceId:{
      type:DataTypes.INTEGER,
      allowNull:false
    },

    // ⭐ NEW — which staff created payment
    createdBy:{
      type:DataTypes.INTEGER,
      allowNull:true
    },

    /* =====================================================
       ⭐ PAYMENT DETAILS
    ===================================================== */

    type:{
      type:DataTypes.ENUM("PAYMENT","REFUND"),
      defaultValue:"PAYMENT"
    },

    mode:{
      type:DataTypes.ENUM("CASH","UPI","BANK","CARD"),
      allowNull:false
    },

    amount:{
      type:DataTypes.DECIMAL(10,2), // ⭐ NEVER USE FLOAT FOR MONEY
      allowNull:false
    },

    status:{
      type:DataTypes.ENUM("SUCCESS","PENDING","FAILED"),
      defaultValue:"SUCCESS"
    },

    referenceNo:{
      type:DataTypes.STRING,
      allowNull:true
    },

    paymentDate:{
      type:DataTypes.DATE,
      defaultValue:DataTypes.NOW
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
    tableName:"payments",
    timestamps:true,
    indexes:[
      { fields:["hotelId"] },
      { fields:["invoiceId"] },
      { fields:["status"] }
    ]
  });

  return Payment;
};