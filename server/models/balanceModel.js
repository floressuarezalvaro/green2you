const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const balanceSchema = new Schema(
  {
    currentBalance: {
      type: Number,
      required: true,
    },
    previousStatementBalance: {
      type: Number,
      required: false,
    },
    paymentsOrCredits: {
      type: Number,
      required: false,
    },
    serviceDues: {
      type: Number,
      required: false,
    },
    newStatementBalance: {
      type: Number,
      required: false,
    },
    pastDueAmount: {
      type: Number,
      required: false,
    },
    clientId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

balanceSchema.index({ user_id: 1 });
balanceSchema.index({ clientId: 1 });
balanceSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Balance", balanceSchema);
