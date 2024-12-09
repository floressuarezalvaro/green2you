const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    clientId: {
      type: String,
      required: true,
    },
    statementId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["debit", "credit"],
    },
    amount: {
      type: Number,
      required: true,
    },
    checkDate: {
      type: Date,
      required: true,
    },
    checkNumber: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ clientId: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
