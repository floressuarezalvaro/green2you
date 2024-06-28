const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const balanceSchema = new Schema(
  {
    clientId: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    amountDue: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

balanceSchema.index({ user_id: 1 });
balanceSchema.index({ clientId: 1 });
balanceSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Balance", balanceSchema);
