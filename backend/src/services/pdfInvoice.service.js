const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.generateInvoicePDF = async (invoice, booking, hotel) => {

  return new Promise((resolve, reject) => {

    const fileName = `invoice_${invoice.invoiceNumber}.pdf`;
    const filePath = path.join(__dirname, "../temp", fileName);

    // ensure temp folder exists
    if (!fs.existsSync(path.join(__dirname, "../temp"))) {
      fs.mkdirSync(path.join(__dirname, "../temp"));
    }

    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    //
    // ==============================
    // ⭐ HEADER
    // ==============================
    //
    doc.fontSize(18).text("TAX INVOICE", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Hotel: ${hotel.name}`);
    doc.text(`City: ${hotel.city}`);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`);
    doc.text(`Invoice Type: ${invoice.invoiceType}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);

    doc.moveDown();

    //
    // ==============================
    // ⭐ GUEST DETAILS
    // ==============================
    //
    doc.text(`Guest Name: ${booking.guestName}`);
    doc.text(`Room: ${booking.roomId}`);
    doc.text(`Check-in: ${booking.checkIn}`);
    doc.text(`Check-out: ${booking.checkOut}`);

    doc.moveDown();

    //
    // ==============================
    // ⭐ BILLING SECTION
    // ==============================
    //
    doc.text(`Amount: ₹${invoice.amount}`);
    doc.text(`GST: ₹${invoice.gstAmount}`);

    const total = Number(invoice.amount) + Number(invoice.gstAmount);

    doc.moveDown();
    doc.fontSize(14).text(`TOTAL: ₹${total}`);

    doc.moveDown();
    doc.fontSize(10).text("This is a system generated GST compliant invoice.");

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);

  });
};
