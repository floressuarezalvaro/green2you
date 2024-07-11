const mongoose = require("mongoose");
const validator = require("validator");
const Balance = require("./balanceModel");

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
    clientPlan: {
      type: String,
      required: false,
    },
    clientCycleDate: {
      type: Number,
      required: true,
    },
    clientStatementCreateDate: {
      type: Number,
      required: true,
    },
    clientWelcomeEmailEnabled: {
      type: Boolean,
      required: true,
    },
    clientAutoEmailStatementsEnabled: {
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

clientSchema.statics.createClientBalance = async function (clientId) {
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw Error(`This is not a valid Client ID: ${clientId}`);
  }

  await Balance.create({
    _id: clientId,
    clientId: clientId,
    previousStatementBalance: 0,
    paymentsOrCredits: 0,
    serviceDues: 0,
    newStatementBalance: 0,
    pastDueAmount: 0,
  });
};

module.exports = mongoose.model("Client", clientSchema);
