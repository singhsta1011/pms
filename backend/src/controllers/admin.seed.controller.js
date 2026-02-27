const { Hotel, Room, Booking } = require("../models");

exports.seedDemo = async (req, res) => {
  try {
    console.log("🌱 PMS Demo Seeding Started...");

    //
    // 🏨 CREATE HOTEL
    //
    const hotel = await Hotel.create({
      hotelCode: "PMS_DEMO_001",
      name: "Ultra Luxury Grand Hotel",
      email: "demo@pms.com",
      phone: "9999999999",
      address: "Downtown Business Street",
      city: "Mumbai",
      state: "Maharashtra",
    });

    //
    // 🛏️ CREATE ROOMS
    //
    const rooms = [];

    for (let i = 1; i <= 30; i++) {
      const type =
        i <= 10 ? "DELUXE" : i <= 20 ? "SUITE" : "VIP";

      const room = await Room.create({
        hotelId: hotel.id,
        roomNumber: `${100 + i}`,
        roomType: type,
        pricePerHour: 500 + i * 10,
        pricePerDay: 3000 + i * 100,
      });

      rooms.push(room);
    }

    //
    // 📅 CREATE BOOKINGS
    //
    const bookingStatuses = [
      "BOOKED",
      "CHECKED_IN",
      "COMPLETED",
    ];

    for (let i = 0; i < 10; i++) {
      const room = rooms[i];

      await Booking.create({
        hotelId: hotel.id,
        roomId: room.id,
        guestName: `Guest ${i + 1}`,
        guestPhone: "8888888888",
        bookingType: "DAILY",
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 86400000),
        totalAmount: 3000 + i * 200,
        status:
          bookingStatuses[
            Math.floor(Math.random() * bookingStatuses.length)
          ],
      });
    }

    console.log("✅ PMS Demo Seed Completed");

    res.json({
      message: "PMS Demo Data Seeded Successfully",
      hotelId: hotel.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Seed failed",
      error: error.message,
    });
  }
};
