const express = require("express");
const router = express.Router();

// Middleware
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// Controllers
const hotelController = require("../controllers/admin.hotel.controller");
const roomController = require("../controllers/admin.room.controller");
const bookingController = require("../controllers/admin.booking.controller");
const dashboardController = require("../controllers/admin.dashboard.controller");
const statsController = require("../controllers/admin.stats.controller");
const revenueController = require("../controllers/admin.revenue.controller");
const megaDashboardController = require("../controllers/admin.megaDashboard.controller");
const seedController = require("../controllers/admin.seed.controller");
const invoiceController = require("../controllers/admin.invoice.controller");
const paymentController = require("../controllers/admin.payment.controller");
const guestController = require("../controllers/admin.guest.controller");
const userController = require("../controllers/admin.user.controller");

const upload = require("../middleware/upload.middleware");

/* =====================================================
   🔐 ALL ADMIN ROUTES REQUIRE LOGIN
===================================================== */
router.use(authMiddleware);


/* =====================================================
   🏨 HOTEL ROUTES (SUPER ADMIN MODULE)
===================================================== */

router.post(
  "/hotels",
  roleMiddleware(["SUPER_ADMIN"]),
  hotelController.createHotel
);

router.patch(
  "/hotels/:id/status",
  roleMiddleware(["SUPER_ADMIN"]),
  hotelController.toggleHotelStatus
);
router.put(
  "/hotels/:id",
  roleMiddleware(["SUPER_ADMIN"]),
  hotelController.updateHotel
);

router.get(
  "/hotels",
  roleMiddleware(["SUPER_ADMIN","HOTEL_ADMIN"]),
  hotelController.getHotels
);

// ⭐ ADD THIS NEW ROUTE
router.patch(
  "/hotel/activate/:id",
  roleMiddleware(["SUPER_ADMIN"]),
  hotelController.activateHotel
);

router.post("/seed-demo", seedController.seedDemo);

/* =====================================================
   🚪 ROOM ROUTES (PMS MODULE REQUIRED)
===================================================== */

router.post(
  "/rooms",
  roleMiddleware(["SUPER_ADMIN","HOTEL_ADMIN"], "PMS"),   // ⭐ MODULE LOCK
  roomController.createRoom
);

router.get(
  "/rooms",
  roleMiddleware(["SUPER_ADMIN","HOTEL_ADMIN","USER"], "PMS"),
  roomController.getRoomsByHotel
);


/* =====================================================
   📅 BOOKING ROUTES (PMS MODULE)
===================================================== */

router.post(
  "/bookings",
  roleMiddleware(["SUPER_ADMIN","HOTEL_ADMIN","USER"], "PMS"),
  bookingController.createBooking
);

router.get(
  "/bookings",
  roleMiddleware(["SUPER_ADMIN","HOTEL_ADMIN","USER"], "PMS"),
  bookingController.getBookings
);

router.patch(
  "/bookings/:id/status",
  roleMiddleware(["SUPER_ADMIN","HOTEL_ADMIN","USER"], "PMS"),
  bookingController.updateBookingStatus
);


/* =====================================================
   📊 DASHBOARD & STAY BOARD (PMS MODULE)
===================================================== */

router.get(
  "/hotel-full-view",
  roleMiddleware(["SUPER_ADMIN","HOTEL_ADMIN","USER"], "PMS"),
  dashboardController.getFullHotelView
);

router.get(
  "/dashboard-stats",
  roleMiddleware(["SUPER_ADMIN","HOTEL_ADMIN","USER"], "PMS"),
  statsController.getDashboardStats
);

router.get(
  "/revenue-analytics",
  roleMiddleware(["SUPER_ADMIN","HOTEL_ADMIN"], "PMS"),
  revenueController.getRevenueAnalytics
);

router.get(
  "/mega-dashboard",
  roleMiddleware(["SUPER_ADMIN","HOTEL_ADMIN"], "PMS"),
  megaDashboardController.getMegaDashboard
);


/* =====================================================
   🧾 INVOICE ROUTES (PMS MODULE)
===================================================== */

router.post(
  "/invoice/proforma",
  roleMiddleware(["SUPER_ADMIN","HOTEL_ADMIN","USER"], "PMS"),
  invoiceController.createProformaInvoice
);

router.get(
  "/invoices",
  roleMiddleware(["SUPER_ADMIN","HOTEL_ADMIN","USER"], "PMS"),
  invoiceController.getInvoices
);


/* =====================================================
   💳 PAYMENT ROUTES (PMS MODULE)
===================================================== */

router.post(
  "/payment-entry",
  roleMiddleware(["SUPER_ADMIN","HOTEL_ADMIN","USER"], "PMS"),
  paymentController.enterPayment
);


/* =====================================================
   👤 GUEST ROUTES (PMS MODULE)
===================================================== */

router.post(
  "/guests",
  roleMiddleware(["SUPER_ADMIN","HOTEL_ADMIN","USER"], "PMS"),
  upload.single("idImage"),
  guestController.createGuest
);

router.get(
  "/guests",
  roleMiddleware(["SUPER_ADMIN","HOTEL_ADMIN","USER"], "PMS"),
  guestController.getGuests
);

router.get(
  "/guests/:id/history",
  roleMiddleware(["SUPER_ADMIN","HOTEL_ADMIN","USER"], "PMS"),
  guestController.getGuestHistory
);

router.post(
  "/users",
  roleMiddleware(["HOTEL_ADMIN"]),
  userController.createUser
);

router.get(
  "/users",
  roleMiddleware(["HOTEL_ADMIN"]),
  userController.getUsers
);

router.put(
  "/users/:id",
  roleMiddleware(["HOTEL_ADMIN"]),
  userController.updateUser
);

router.patch(
  "/users/:id/status",
  roleMiddleware(["HOTEL_ADMIN"]),
  userController.toggleUserStatus
);

module.exports = router;