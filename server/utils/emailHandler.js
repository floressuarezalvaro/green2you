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
    };

    if (type === "Monthly Statement" && attachment) {
      mailOptions.attachments = [
        {
          filename: "statement.pdf",
          content: attachment,
          contentType: "application/pdf",
        },
      ];
    }

    const info = await transporter.sendMail(mailOptions);

    const emailLog = new EmailTracker({
      emailType: type,
      emailTo: to,
      emailSubject: subject,
      emailText: text,
      emailSuccess: true,
    });
    await emailLog.save();
  } catch (error) {
    const emailLog = new EmailTracker({
      emailType: type,
      emailTo: to,
      emailSubject: subject,
      emailText: text,
      emailSuccess: false,
      emailError: error,
    });
    await emailLog.save();
  }
};

const sendStatementByEmail = async (clientEmail, statementId) => {
  const subject = "Monthly Statement";
  const text = "Please find attached your monthly statement.";

  try {
    // Fetch the PDF from the server
    const statementUrl = `http://localhost:4000/statements/print/${statementId}`;
    const response = await axios.get(statementUrl, {
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjYwZDM2MGNmMTAxODNjYzMxNGUxODUiLCJpYXQiOjE3MTg2NTMxNzAsImV4cCI6MTcxODczOTU3MH0.E_zYIfn6_BVXScUh9hXrXQDktnHEXOIfb0XT7BobYDg`,
      },
    });

    const pdfBuffer = Buffer.from(response.data, "binary");

    // Send email with attachment
    await sendEmail("Monthly Statement", clientEmail, subject, text, pdfBuffer);
    console.log(`Statement sent by email to: ${clientEmail}`);
  } catch (error) {
    console.error(`Error sending statement to ${clientEmail}:`, error);
  }
};

module.exports = { sendEmail, sendStatementByEmail };
