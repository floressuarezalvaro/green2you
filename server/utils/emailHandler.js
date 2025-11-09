const nodemailer = require("nodemailer");
const EmailTracker = require("../models/emailTrackerModel");
const { generateStatementPDF } = require("./PDFCreator");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (type, to, subject, text, attachment, user_id) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      attachments: attachment ? [attachment] : [],
    };

    await transporter.sendMail(mailOptions);

    const emailLog = new EmailTracker({
      emailType: type,
      emailTo: to,
      emailSubject: subject,
      emailText: text,
      emailSuccess: true,
      emailError: null,
      user_id,
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
      user_id,
    });
    await emailLog.save();
  }
};

const sendStatementByEmail = async (clientEmail, statementId, user_id) => {
  const subject = "Re: Green 2 You Billing";
  const text = "Please find attached your monthly statement.";

  try {
    const { buffer, filename } = await generateStatementPDF(statementId);

    await sendEmail(
      "Monthly Statement",
      clientEmail,
      subject,
      text,
      {
        filename,
        content: buffer,
        contentType: "application/pdf",
      },
      user_id
    );
    console.log(`Statement sent by email to: ${clientEmail}`);
  } catch (error) {
    console.error(`Error sending statement to ${clientEmail}:`, error);
  }
};

module.exports = { sendEmail, sendStatementByEmail };
