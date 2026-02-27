const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

// Core model
const User = require("./user.model");

// Factory models
const HotelModel = require("./hotel");
const RoomModel = require("./room");
const BookingModel = require("./booking");
const InvoiceModel = require("./invoice");
const PaymentModel = require("./payment");
const AuditLogModel = require("./auditLog");
const GuestModel = require("./guest");

// Initialize models
const Hotel = HotelModel(sequelize, DataTypes);
const Room = RoomModel(sequelize, DataTypes);
const Booking = BookingModel(sequelize, DataTypes);
const Invoice = InvoiceModel(sequelize, DataTypes);
const Payment = PaymentModel(sequelize, DataTypes);
const AuditLog = AuditLogModel(sequelize, DataTypes);
const Guest = GuestModel(sequelize, DataTypes);

/* =====================================================
   ⭐ ASSOCIATIONS (ENTERPRISE PMS STRUCTURE)
===================================================== */

/* -----------------------------------------------------
   🏨 HOTEL RELATIONS
----------------------------------------------------- */

// Hotel → Rooms
Hotel.hasMany(Room, { foreignKey:"hotelId", onDelete:"CASCADE" });
Room.belongsTo(Hotel, { foreignKey:"hotelId" });

// Hotel → Bookings
Hotel.hasMany(Booking, { foreignKey:"hotelId", onDelete:"CASCADE" });
Booking.belongsTo(Hotel, { foreignKey:"hotelId" });

// Hotel → Guests
Hotel.hasMany(Guest, { foreignKey:"hotelId" });
Guest.belongsTo(Hotel, { foreignKey:"hotelId" });

// Hotel → Users (multi-tenant)
Hotel.hasMany(User, { foreignKey:"hotelId" });
User.belongsTo(Hotel, { foreignKey:"hotelId" });

// Hotel → AuditLogs
Hotel.hasMany(AuditLog, { foreignKey:"hotelId" });
AuditLog.belongsTo(Hotel, { foreignKey:"hotelId" });

/* -----------------------------------------------------
   👤 USER RELATIONS
----------------------------------------------------- */

// User → Bookings (createdBy)
User.hasMany(Booking, { foreignKey:"createdBy" });
Booking.belongsTo(User, { foreignKey:"createdBy", as:"creator" });

// User → Guests (createdBy)
User.hasMany(Guest, { foreignKey:"createdBy" });
Guest.belongsTo(User, { foreignKey:"createdBy", as:"createdUser" });

// User → AuditLogs
User.hasMany(AuditLog, { foreignKey:"userId" });
AuditLog.belongsTo(User, { foreignKey:"userId" });

/* -----------------------------------------------------
   🛏 ROOM RELATIONS
----------------------------------------------------- */

Room.hasMany(Booking, { foreignKey:"roomId", onDelete:"CASCADE" });
Booking.belongsTo(Room, { foreignKey:"roomId" });

/* -----------------------------------------------------
   👥 GUEST RELATIONS
----------------------------------------------------- */

Guest.hasMany(Booking, { foreignKey:"guestId" });
Booking.belongsTo(Guest, { foreignKey:"guestId" });

/* -----------------------------------------------------
   🧾 BOOKING → INVOICE → PAYMENT
----------------------------------------------------- */

Booking.hasMany(Invoice, { foreignKey:"bookingId" });
Invoice.belongsTo(Booking, { foreignKey:"bookingId" });

Invoice.hasMany(Payment, { foreignKey:"invoiceId" });
Payment.belongsTo(Invoice, { foreignKey:"invoiceId" });

/* =====================================================
   ⭐ DB SYNC
===================================================== */

const syncDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    await sequelize.sync(); // safe sync
    console.log("✅ Tables synced");

  } catch (error) {
    console.error("❌ DB sync failed:", error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  User,
  Hotel,
  Room,
  Booking,
  Invoice,
  Payment,
  AuditLog,
  Guest,
  syncDB,
};