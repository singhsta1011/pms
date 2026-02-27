const db = require("../models");
const { createAuditLog } = require("../services/audit.service");

//
// ==========================================================
// 🧾 CREATE PROFORMA INVOICE (ENTERPRISE SAFE)
// ==========================================================
//
exports.createProformaInvoice = async (req, res) => {

  const t = await db.sequelize.transaction();

  try {

    const { bookingId, amount, gstAmount } = req.body;

    const booking = await db.Booking.findByPk(bookingId, { transaction:t });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    /* ======================================================
       🔐 HOTEL ADMIN RESTRICTION
    ====================================================== */

    if (
      req.user.role === "HOTEL_ADMIN" &&
      req.user.hotelId !== booking.hotelId
    ) {
      return res.status(403).json({
        message: "You cannot create invoice for another hotel"
      });
    }

    /* ======================================================
       ⭐ PREVENT DUPLICATE PROFORMA
    ====================================================== */

    const existing = await db.Invoice.findOne({
      where:{
        bookingId: booking.id,
        invoiceType:"PROFORMA"
      },
      transaction:t
    });

    if(existing){
      return res.status(400).json({
        message:"Proforma already exists for this booking"
      });
    }

    /* ======================================================
       ⭐ ENTERPRISE INVOICE NUMBER FORMAT
    ====================================================== */

    const invoiceNumber =
      `INV-${booking.hotelId}-${Date.now()}`;

    const invoice = await db.Invoice.create({

      hotelId: booking.hotelId,
      bookingId: booking.id,
      invoiceNumber,
      amount,
      gstAmount,
      invoiceType:"PROFORMA",
      status:"UNPAID",
      locked:false

    },{ transaction:t });

    /* ======================================================
       ⭐ AUDIT LOG
    ====================================================== */

    await createAuditLog({
      userId:req.user.id,
      hotelId:booking.hotelId,
      action:"CREATE_INVOICE",
      entity:"INVOICE",
      entityId:invoice.id
    });

    await t.commit();

    res.json({
      message:"Proforma Invoice Created",
      data:invoice
    });

  } catch (error) {

    await t.rollback();

    console.error(error);

    res.status(500).json({
      message:"Invoice creation failed",
      error:error.message
    });
  }
};

//
// ==========================================================
// 📋 GET INVOICES (ROLE SAFE)
// ==========================================================
//
exports.getInvoices = async (req, res) => {

  try {

    let where = {};

    // 🔐 HOTEL ADMIN → only their hotel
    if(req.user.role === "HOTEL_ADMIN"){
      where.hotelId = req.user.hotelId;
    }

    // SUPER ADMIN → optional filter
    if(req.query.hotelId){
      where.hotelId = req.query.hotelId;
    }

    const invoices = await db.Invoice.findAll({
      where,
      include:[
        {
          model:db.Booking,
          attributes:["id","guestName","status","checkIn","checkOut"]
        }
      ],
      order:[["createdAt","DESC"]]
    });

    res.json({ data:invoices });

  } catch (error) {

    res.status(500).json({
      message:"Fetch invoices failed",
      error:error.message
    });
  }
};