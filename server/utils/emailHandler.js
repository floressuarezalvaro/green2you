const nodemailer = require("nodemailer");
const EmailTracker = require("../models/emailTrackerModel");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (type, to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      type,
      to,
      subject,
      text,
    });

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

module.exports = { sendEmail };
