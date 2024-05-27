const emailTracker = require("../models/emailTrackerModel");
const mongoose = require("mongoose");

const getAllEmails = async (req, res) => {
  try {
    const emails = await emailTracker.find({}).sort({ createdAt: -1 });
    res.status(200).json(emails);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  getAllEmails,
};
