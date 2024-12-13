const nodemailer = require("nodemailer");
const EmailTracker = require("../models/emailTrackerModel");
const axios = require("axios");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (type, to, subject, text, attachment) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      attachments: attachment ? [attachment] : [],
    };

    const info = await transporter.sendMail(mailOptions);

    const emailLog = new EmailTracker({
      emailType: type,
      emailTo: to,
      emailSubject: subject,
      emailText: text,
      emailSuccess: true,
      emailError: null,
    });
    await emailLog.save();
  } catch (error) {
    const emailLog = new EmailTracker({
      emailType: type,
      emailTo: to,
      emailSubject: subject,
      emailText: text,
      emailSuccess: false,
      emailError: error.message,
    });
    await emailLog.save();
  }
};

const sendStatementByEmail = async (clientEmail, statementId) => {
  const subject = "Re: Green 2 You Billing";
  const text = "Please find attached your monthly statement.";

  try {
    const statementUrl = `${process.env.FRONTEND_URL}/api/statements/print/${statementId}`;
    const response = await axios.get(statementUrl, {
      responseType: "arraybuffer",
      headers: {
        "x-api-key": process.env.API_KEY,
      },
    });

    const contentDisposition = response.headers["content-disposition"];
    let filename = "statement.pdf";

    if (contentDisposition && contentDisposition.includes("filename=")) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const pdfBuffer = Buffer.from(response.data, "binary");

    await sendEmail("Monthly Statement", clientEmail, subject, text, {
      filename,
      content: pdfBuffer,
      contentType: "application/pdf",
    });
    console.log(`Statement sent by email to: ${clientEmail}`);
  } catch (error) {
    console.error(`Error sending statement to ${clientEmail}:`, error);
  }
};

module.exports = { sendEmail, sendStatementByEmail };
