const mongoose = require("mongoose");
const validator = require("validator");

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
      unique: false,
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
    clientWelcomeEmailEnabled: {
      type: Boolean,
      required: false,
    },
    clientAutoStatementsEnabled: {
      type: Boolean,
      required: false,
    },
    user_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

clientSchema.index({ user_id: 1 });
clientSchema.index({ createdAt: -1 });

clientSchema.statics.signupClient = async function (clientEmail) {
  if (!validator.isEmail(clientEmail)) {
    throw Error("This is not a valid email");
  }

  const exists = await this.findOne({ clientEmail });
  if (exists) {
    throw Error("Email exists");
  }
};

module.exports = mongoose.model("Client", clientSchema);
