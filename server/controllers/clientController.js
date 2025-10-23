const Client = require("../models/clientModel");
const Invoice = require("../models/invoiceModel");
const Statement = require("../models/statementModel");
const Balance = require("../models/balanceModel");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel");

const mongoose = require("mongoose");

const getAllClients = async (req, res) => {
  const user_id = req.user._id;

  try {
    const clients = await Client.find({ user_id }).sort({ createdAt: -1 });
    res.status(200).json(clients);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

const getClient = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  try {
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ error: "No client found" });
    }
    res.status(200).json(client);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

const createClient = async (req, res) => {
  const {
    clientName,
    clientEmail,
    clientPhoneNumber,
    clientStreetLineOne,
    clientStreetLineTwo,
    clientCity,
    clientState,
    clientZip,
    clientCycleDate,
    clientWelcomeEmailEnabled,
    clientAutoCreateStatementsEnabled,
    clientAutoEmailStatementsEnabled,
    clientStatementCreateDate,
    clientPlan,
    clientMonthly,
  } = req.body;

  let emptyFields = [];

  if (!clientName) emptyFields.push("clientName");
  if (!clientEmail) emptyFields.push("clientEmail");
  if (!clientStreetLineOne) emptyFields.push("clientStreetLineOne");
  if (!clientCity) emptyFields.push("clientCity");
  if (!clientState) emptyFields.push("clientState");
  if (!clientZip) emptyFields.push("clientZip");
  if (!clientCycleDate) emptyFields.push("clientCycleDate");
  if (!clientStatementCreateDate) emptyFields.push("clientStatementCreateDate");
  if (!clientPlan) emptyFields.push("clientPlan");

  if (clientCycleDate !== "") {
    if (clientCycleDate < 1 || clientCycleDate > 31) {
      emptyFields.push("clientCycleDate");
    }
  }

  if (clientStatementCreateDate !== "") {
    if (clientStatementCreateDate < 1 || clientStatementCreateDate > 31) {
      emptyFields.push("clientStatementCreateDate");
    }
  }

  if (emptyFields.length > 0) {
    return res.status(400).json({
      error: "Please check the highlighted fields and try again.",
      emptyFields,
    });
  }

  const autoCreateEnabled = clientAutoCreateStatementsEnabled === true;
  const autoEmailEnabled = autoCreateEnabled
    ? clientAutoEmailStatementsEnabled
    : false;

  try {
    await Client.signupClient(clientEmail);

    const user_id = req.user._id;
    const client = await Client.create({
      clientName,
      clientEmail,
      clientPhoneNumber,
      clientStreetLineOne,
      clientStreetLineTwo,
      clientCity,
      clientState,
      clientZip,
      clientCycleDate,
      clientWelcomeEmailEnabled,
      clientAutoCreateStatementsEnabled: autoCreateEnabled,
      clientAutoEmailStatementsEnabled: autoEmailEnabled,
      clientStatementCreateDate,
      clientPlan,
      clientMonthly,
      user_id,
    });

    await Client.createClientBalance(client._id);

    res.status(201).json(client);
  } catch (error) {
    if (error.message === "This is not a valid email") {
      emptyFields.push("clientEmail");
      return res.status(400).json({ error: error.message, emptyFields });
    } else if (error.message === "Email exists") {
      emptyFields.push("clientEmail");
      return res.status(400).json({ error: error.message, emptyFields });
    }
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

const deleteClient = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  try {
    await Invoice.deleteMany({ clientId: id });
    await Statement.deleteMany({ clientId: id });
    await Balance.deleteMany({ clientId: id });
    await Balance.deleteMany({ clientId: id });
    await Payment.deleteMany({ clientId: id });
    await User.findOneAndDelete({ _id: id });

    const client = await Client.findOneAndDelete({ _id: id });

    if (!client) {
      return res.status(404).json({ error: "No client found" });
    }
    res.status(200).json(client);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

const updateClient = async (req, res) => {
  const { id } = req.params;
  const {
    clientEmail,
    clientCycleDate,
    clientStatementCreateDate,
    clientAutoCreateStatementsEnabled,
    clientAutoEmailStatementsEnabled,
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  if (clientCycleDate && (clientCycleDate < 1 || clientCycleDate > 31)) {
    return res.status(400).json({ error: "This is not a valid cycle date" });
  }

  if (
    clientStatementCreateDate &&
    (clientStatementCreateDate < 1 || clientStatementCreateDate > 31)
  ) {
    return res
      .status(400)
      .json({ error: "This is not a valid statement create date" });
  }

  const autoCreateEnabled = clientAutoCreateStatementsEnabled;
  const autoEmailEnabled = autoCreateEnabled
    ? clientAutoEmailStatementsEnabled
    : false;

  try {
    const client = await Client.findOneAndUpdate(
      { _id: id },
      {
        ...req.body,
        clientAutoCreateStatementsEnabled: autoCreateEnabled,
        clientAutoEmailStatementsEnabled: autoEmailEnabled,
      },
      { new: true }
    );
    if (!client) {
      return res.status(404).json({ error: "No client found" });
    }
    if (clientEmail) {
      await User.findOneAndUpdate(
        { _id: id },
        { email: clientEmail },
        { new: true }
      );
    }

    res.status(200).json(client);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

module.exports = {
  createClient,
  getAllClients,
  getClient,
  deleteClient,
  updateClient,
};
