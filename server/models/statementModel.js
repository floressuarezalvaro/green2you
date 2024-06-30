const mongoose = require("mongoose");
const Invoice = require("./invoiceModel");

const Schema = mongoose.Schema;

const statementSchema = new Schema(
  {
    clientId: {
      type: String,
      required: true,
    },
    invoiceData: [
      {
        type: Invoice.schema,
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
    creationMethod: {
      type: String,
      required: true,
      enum: ["auto", "manual"],
    },
    isPaid: {
      type: Boolean,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

statementSchema.index({ clientId: 1 });
statementSchema.index({ issuedStartDate: 1, issuedEndDate: 1 });
statementSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Statement", statementSchema);
