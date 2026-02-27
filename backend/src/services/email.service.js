const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

  service:"gmail",

  auth:{
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }

});

exports.sendInvoiceEmail = async ({ to, subject, html, attachments = [] }) => {

  await transporter.sendMail({
    from: `"PMS System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
  });

};
