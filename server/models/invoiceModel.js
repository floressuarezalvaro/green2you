const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const invoiceSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
    },
    price: {
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

module.exports = mongoose.model("Invoice", invoiceSchema);
