const { Booking, Hotel, Room } = require("../models");
const db = require("../models");
const { isValidTransition } = require("../services/bookingWorkflow.service");
const eventQueue = require("../services/eventQueue.service");
const { findBestRoom } = require("../services/smartAllocation.service");
const { findUpgradeRoom } = require("../services/autoUpgrade.service");
const { createAuditLog } = require("../services/audit.service");
const { generateVoucherData } = require("../services/voucher.service");
const emailService = require("../services/email.service");
const { generateVoucherPDF } = require("../services/pdfVoucher.service");



//
// ==========================================================
// ➕ CREATE BOOKING (SMART + AI AUTO UPGRADE)
// ==========================================================
//
exports.createBooking = async (req, res) => {
  try {
    const { hotelId, roomType, checkIn, checkOut } = req.body;
    const safeRoomType =
  roomType && roomType !== "ALL" ? roomType : null;

    // 🔐 HOTEL ADMIN restriction
    if (
      req.user.role === "HOTEL_ADMIN" &&
      req.user.hotelId !== hotelId
    ) {
      return res.status(403).json({
        message: "You can only create bookings for your assigned hotel",
      });
    }

    // ⭐ Validate hotel
    const hotel = await Hotel.findByPk(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // ======================================================
    // ⭐ SMART ROOM ALLOCATION
    // ======================================================
   let room = await findBestRoom({
  hotelId,
  roomType: safeRoomType,   // ✅ FIXED
  checkIn: new Date(checkIn),
  checkOut: new Date(checkOut),
});
    // ======================================================
    // 🧠 AI AUTO UPGRADE (fallback)
    // ======================================================
    if (!room) {
      const upgradeRoom = await findUpgradeRoom(
  hotelId,
  safeRoomType,   // ✅ FIXED
  checkIn,
  checkOut
);

      if (upgradeRoom) {
        console.log("🧠 AI Upgrade applied:", upgradeRoom.id);
        room = upgradeRoom;
      }
    }

    if (!room) {
      return res.status(400).json({
        message: "No available rooms found",
      });
    }

    // ======================================================
    // ⭐ CREATE BOOKING
    // ======================================================
    const booking = await Booking.create({
      ...req.body,
      roomId: room.id,
    });

    //
    // ======================================================
    // 🧾 AUTO CREATE PROFORMA INVOICE (CLIENT REQUIREMENT)
    // ======================================================
    //
    await db.Invoice.create({
      hotelId: booking.hotelId,
      bookingId: booking.id,
      invoiceNumber: `INV-${Date.now()}`,
      amount: booking.totalAmount || 0,
      gstAmount: booking.gstAmount || 0,
      invoiceType: "PROFORMA",
      status: "UNPAID",
      locked: false,
    });

//
// ======================================================
// 📄 CREATE PDF + SEND EMAIL WITH ATTACHMENT
// ======================================================
//

const voucher = await generateVoucherData(booking.id);

// ⭐ Generate PDF file
const pdfPath = await generateVoucherPDF(voucher);

const html = `
  <h2>Booking Confirmation</h2>
  <p>Guest: ${voucher.guestName}</p>
  <p>Hotel: ${voucher.hotelName}</p>
  <p>Room: ${voucher.roomNumber}</p>
  <p>Check-in: ${voucher.checkIn}</p>
  <p>Check-out: ${voucher.checkOut}</p>
`;

await emailService.sendInvoiceEmail({
  to: req.body.email || "guest@email.com",
  subject: "Your Booking Confirmation Voucher",
  html,
  attachments: [
    {
      filename: `Voucher_${voucher.bookingId}.pdf`,
      path: pdfPath,
    },
  ],
});



    // ⭐ AUDIT LOG
    await createAuditLog({
      userId: req.user.id,
      hotelId: booking.hotelId,
      action: "CREATE",
      entity: "BOOKING",
      entityId: booking.id,
    });

    // ======================================================
    // ⭐ REALTIME SOCKET EVENT
    // ======================================================
    const io = req.app.get("io");

    io.to(`hotel_${booking.hotelId}`).emit("bookingCreated", {
      bookingId: booking.id,
      hotelId: booking.hotelId,
      roomId: booking.roomId,
    });

    // ======================================================
    // ⭐ EVENT QUEUE STREAMS
    // ======================================================
    eventQueue.emit("ROOM_STATUS_EVENT", {
      roomId: booking.roomId,
      hotelId: booking.hotelId,
    });

    eventQueue.emit("REVENUE_EVENT", {
      hotelId: booking.hotelId,
    });

    eventQueue.emit("HEATMAP_EVENT", {
      hotelId: booking.hotelId,
    });

    eventQueue.emit("PREDICTION_EVENT", {
      hotelId: booking.hotelId,
      roomId: booking.roomId,
    });

    eventQueue.emit("OPTIMIZER_EVENT", {
      hotelId: booking.hotelId,
    });

    eventQueue.emit("ACTIVITY_EVENT", {
      hotelId: booking.hotelId,
      type: "BOOKING_CREATED",
      message: `New booking #${booking.id} created`,
    });

    res.status(201).json({
      message: "Booking created successfully",
      data: booking,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create booking",
      error: error.message,
    });
  }
};

//
// ==========================================================
// 📋 LIST BOOKINGS
// ==========================================================
//
exports.getBookings = async (req, res) => {
  try {
    let where = {};

    if (req.user.role === "HOTEL_ADMIN") {
      where.hotelId = req.user.hotelId;
    }

    if (req.query.hotelId) {
      where.hotelId = req.query.hotelId;
    }

    const bookings = await Booking.findAll({
      where,
      include: [
        {
          model: Hotel,
          attributes: ["id", "name", "city"],
        },
        {
          model: Room,
          attributes: ["id", "roomNumber", "roomType"],
        },
      ],
    });

    res.json({ data: bookings });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

//
// ==========================================================
// 🔥 UPDATE BOOKING STATUS (WORKFLOW + AUDIT)
// ==========================================================
//
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // 🔐 HOTEL ADMIN restriction
    if (
      req.user.role === "HOTEL_ADMIN" &&
      req.user.hotelId !== booking.hotelId
    ) {
      return res.status(403).json({
        message: "You cannot update bookings outside your hotel",
      });
    }

    // ⭐ Workflow validation
    if (!isValidTransition(booking.status, status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${booking.status} to ${status}`,
      });
    }

    booking.status = status;
    await booking.save();

    // ⭐ AUDIT LOG
    await createAuditLog({
      userId: req.user.id,
      hotelId: booking.hotelId,
      action: "STATUS_UPDATE",
      entity: "BOOKING",
      entityId: booking.id,
      meta: { status },
    });

    // ======================================================
    // ⭐ EVENT QUEUE STREAMS
    // ======================================================
    eventQueue.emit("ROOM_STATUS_EVENT", {
      roomId: booking.roomId,
      hotelId: booking.hotelId,
    });

    eventQueue.emit("REVENUE_EVENT", {
      hotelId: booking.hotelId,
    });

    eventQueue.emit("HEATMAP_EVENT", {
      hotelId: booking.hotelId,
    });

    eventQueue.emit("PREDICTION_EVENT", {
      hotelId: booking.hotelId,
      roomId: booking.roomId,
    });

    eventQueue.emit("OPTIMIZER_EVENT", {
      hotelId: booking.hotelId,
    });

    eventQueue.emit("ACTIVITY_EVENT", {
      hotelId: booking.hotelId,
      type: "BOOKING_STATUS",
      message: `Booking #${booking.id} changed to ${booking.status}`,
    });

    // ⭐ REALTIME SOCKET EVENT
    const io = req.app.get("io");

    io.to(`hotel_${booking.hotelId}`).emit("bookingStatusUpdated", {
      bookingId: booking.id,
      status: booking.status,
    });

    res.json({
      message: "Booking status updated",
      data: booking,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update status",
      error: error.message,
    });
  }
};
