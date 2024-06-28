const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const balanceSchema = new Schema(
  {
    previousStatementBalance: {
      type: Number,
      required: true,
    },
    paymentsOrCredits: {
      type: Number,
      required: true,
    },
    serviceDues: {
      type: Number,
      required: true,
    },
    newStatementBalance: {
      type: Number,
      required: true,
    },
    pastDueAmount: {
      type: Number,
      required: true,
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
