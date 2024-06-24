const emailTracker = require("../models/emailTrackerModel");
const Client = require("../models/clientModel");
const Statement = require("../models/statementModel");
const { sendStatementByEmail } = require("../utils/emailHandler");
const mongoose = require("mongoose");
const validator = require("validator");

const getAllEmails = async (req, res) => {
  try {
    const emails = await emailTracker.find({}).sort({ createdAt: -1 });
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const sendManualStatementEmail = async (req, res) => {
  const { clientEmail, statementId } = req.body;

  let emptyFields = [];

  if (!clientEmail) emptyFields.push("clientEmail");
  if (!statementId) emptyFields.push("statementId");

  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({
        error: "Please check the highlighted fields and try again.",
        emptyFields,
      });
  }

  if (!validator.isEmail(clientEmail)) {
    return res.status(400).json({ error: "This is not a valid email" });
  }

  try {
    const clientExists = await Client.exists({ clientEmail: clientEmail });
    if (!clientExists) {
      return res.status(404).json({ error: "Client email not found" });
    }

    const statementExists = await Statement.exists({ _id: statementId });
    if (!statementExists) {
      return res.status(404).json({ error: "Statement not found" });
    }

    await sendStatementByEmail(clientEmail, statementId);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email", error });
  }
};

module.exports = {
  getAllEmails,
  sendManualStatementEmail,
};
