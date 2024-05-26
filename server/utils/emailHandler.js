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

const welcomeEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    const emailLog = new EmailTracker({
      emailType: "WelcomeEmail",
      emailTo: to,
      emailSubject: subject,
      emailText: text,
      emailSuccess: true,
    });
    await emailLog.save();
    console.log("Email sent:", info.response);
  } catch (error) {
    const emailLog = new EmailTracker({
      emailType: "WelcomeEmail",
      emailTo: to,
      emailSubject: subject,
      emailText: text,
      emailSuccess: false,
      emailError: error,
    });
    await emailLog.save();
    console.error("Error sending email:", error);
  }
};

module.exports = { welcomeEmail };
