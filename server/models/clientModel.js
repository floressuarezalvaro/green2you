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
      required: true,
    },
    clientStreetLineTwo: {
      type: String,
      required: false,
    },
    clientCity: {
      type: String,
      required: true,
    },
    clientState: {
      type: String,
      required: true,
    },
    clientZip: {
      type: Number,
      required: true,
    },
    clientCycleDate: {
      type: Number,
      required: true,
    },
    clientWelcomeEmailEnabled: {
      type: Boolean,
      required: true,
    },
    clientAutoStatementsEnabled: {
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
