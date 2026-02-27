const db = require("../models");

exports.generateVoucherData = async (bookingId) => {

  const booking = await db.Booking.findByPk(bookingId,{
    include:[
      { model: db.Hotel },
      { model: db.Room }
    ]
  });

  if(!booking){
    throw new Error("Booking not found");
  }

  return {

    bookingId: booking.id,
    guestName: booking.guestName,
    roomNumber: booking.Room?.roomNumber,
    hotelName: booking.Hotel?.name,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,

    generatedAt: new Date() // ⭐ system time auto

  };
};
