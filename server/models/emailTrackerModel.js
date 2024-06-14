const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const emailTrackerSchema = new Schema(
  {
    emailType: {
      type: String,
      required: true,
    },
    emailTo: {
      type: String,
      required: true,
    },
    emailSubject: {
      type: String,
      required: true,
    },
    emailText: {
      type: String,
      required: true,
    },
    emailSuccess: {
      type: Boolean,
      required: true,
    },
    emailError: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

emailTrackerSchema.index({ createdAt: -1 });

module.exports = mongoose.model("emailTracker", emailTrackerSchema);
