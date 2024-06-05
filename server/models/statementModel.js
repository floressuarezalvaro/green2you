const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
  _id: {
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
});

const statementSchema = new Schema(
  {
    clientId: {
      type: String,
      required: true,
    },
    invoiceData: [
      {
        type: invoiceSchema,
        required: true,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    issuedStartDate: {
      type: Date,
      required: true,
    },
    issuedEndDate: {
      type: Date,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Statement", statementSchema);
