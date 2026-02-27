const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.generateVoucherPDF = async (voucher) => {

  return new Promise((resolve, reject) => {

    const fileName = `voucher_${voucher.bookingId}.pdf`;
    const filePath = path.join(__dirname, "../temp", fileName);

    // make sure temp folder exists
    if (!fs.existsSync(path.join(__dirname, "../temp"))) {
      fs.mkdirSync(path.join(__dirname, "../temp"));
    }

    const doc = new PDFDocument();

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ==============================
    // ⭐ SIMPLE HOTEL VOUCHER DESIGN
    // ==============================

    doc.fontSize(20).text("BOOKING CONFIRMATION VOUCHER", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(12).text(`Guest Name: ${voucher.guestName}`);
    doc.text(`Hotel: ${voucher.hotelName}`);
    doc.text(`Room: ${voucher.roomNumber}`);
    doc.text(`Check-in: ${voucher.checkIn}`);
    doc.text(`Check-out: ${voucher.checkOut}`);
    doc.text(`Booking ID: ${voucher.bookingId}`);
    doc.text(`Generated At: ${voucher.generatedAt}`);

    doc.end();

    stream.on("finish", () => {
      resolve(filePath);
    });

    stream.on("error", reject);
  });
};
