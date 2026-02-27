const db = require("../models");
const emailService = require("../services/email.service");
const { generateInvoicePDF } = require("../services/pdfInvoice.service");
const { createAuditLog } = require("../services/audit.service");

exports.enterPayment = async (req, res) => {

  const t = await db.sequelize.transaction();

  try {

    const { invoiceId, mode, amount } = req.body;

    /* ======================================================
       ⭐ FETCH INVOICE (MULTI TENANT SAFE)
    ====================================================== */

    let where = { id: invoiceId };

    // 🔐 HOTEL ADMIN restriction
    if (req.user.role === "HOTEL_ADMIN") {
      where.hotelId = req.user.hotelId;
    }

    const invoice = await db.Invoice.findOne({ where, transaction:t });

    if (!invoice) {
      await t.rollback();
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (invoice.locked) {
      await t.rollback();
      return res.status(400).json({ message: "Invoice already locked" });
    }

    if (amount <= 0 || amount > invoice.amount) {
      await t.rollback();
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    /* ======================================================
       ⭐ CREATE PAYMENT RECORD
    ====================================================== */

    const payment = await db.Payment.create({

      hotelId: invoice.hotelId,
      bookingId: invoice.bookingId,
      invoiceId,
      mode,
      amount

    },{ transaction:t });

    /* ======================================================
       ⭐ UPDATE INVOICE STATUS
    ====================================================== */

    invoice.status = "PAID";
    invoice.invoiceType = "FINAL";
    invoice.locked = true;

    await invoice.save({ transaction:t });

    /* ======================================================
       ⭐ AUDIT LOG (FINANCIAL)
    ====================================================== */

    await createAuditLog({
      userId: req.user.id,
      hotelId: invoice.hotelId,
      action: "PAYMENT_CONFIRMED",
      entity: "INVOICE",
      entityId: invoice.id,
      meta: {
        invoiceNumber: invoice.invoiceNumber,
        amount,
        mode
      }
    });

    /* ======================================================
       ⭐ LOAD BOOKING + HOTEL + GUEST
    ====================================================== */

    const booking = await db.Booking.findByPk(invoice.bookingId,{
      include:[ db.Guest ],
      transaction:t
    });

    const hotel = await db.Hotel.findByPk(invoice.hotelId,{ transaction:t });

    await t.commit(); // ✅ DB SAFE BEFORE HEAVY TASKS

    /* ======================================================
       ⭐ GENERATE FINAL GST INVOICE PDF
    ====================================================== */

    const pdfPath = await generateInvoicePDF(invoice, booking, hotel);

    /* ======================================================
       ⭐ SEND EMAIL
    ====================================================== */

    await emailService.sendInvoiceEmail({

      to: booking?.Guest?.email || "guest@email.com",

      subject: "Final GST Invoice - Payment Successful",

      html: `
        <h3>Payment Successful</h3>
        <p>Your final GST invoice is attached.</p>
        <p>Invoice No: ${invoice.invoiceNumber}</p>
      `,

      attachments: [
        {
          filename: `Invoice_${invoice.invoiceNumber}.pdf`,
          path: pdfPath,
        },
      ],
    });

    await createAuditLog({
      userId: req.user.id,
      hotelId: invoice.hotelId,
      action: "FINAL_INVOICE_SENT",
      entity: "INVOICE",
      entityId: invoice.id,
    });

    res.json({
      message: "Payment entered, Final Invoice generated & Email sent",
      payment,
    });

  } catch (error) {

    await t.rollback();

    console.error(error);

    res.status(500).json({
      message: "Payment entry failed",
      error: error.message,
    });
  }
};