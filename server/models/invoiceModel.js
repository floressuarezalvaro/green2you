const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const invoiceSchema = new Schema(
  {
    clientId: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
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

invoiceSchema.index({ user_id: 1 });
invoiceSchema.index({ clientId: 1 });
invoiceSchema.index({ createdAt: -1 });
invoiceSchema.index({ date: 1 });

module.exports = mongoose.model("Invoice", invoiceSchema);
