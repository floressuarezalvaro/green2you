const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const clientSchema = new Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
      required: true,
    },
    clientPhoneNumber: {
      type: Number,
      required: true,
    },
    clientStreetLineOne: {
      type: String,
      required: false,
    },
    clientStreetLineTwo: {
      type: String,
      required: false,
    },
    clientCity: {
      type: String,
      required: false,
    },
    clientState: {
      type: String,
      required: false,
    },
    clientZip: {
      type: Number,
      required: false,
    },
    clientCycleDate: {
      type: Number,
      required: false,
    },
    user_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
