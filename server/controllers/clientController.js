const Client = require("../models/clientModel");
const Invoice = require("../models/invoiceModel");
const Statement = require("../models/statementModel");

const { sendEmail } = require("../utils/emailHandler");
const mongoose = require("mongoose");

// Get all clients
const getAllClients = async (req, res) => {
  const user_id = req.user._id;

  try {
    const clients = await Client.find({ user_id }).sort({ createdAt: -1 });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get single client
const getClient = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "This is not a valid id" });
  }

  try {
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ error: "No client found" });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  const { clientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(404).json({ error: "This is not a valid client id" });
  }

  try {
    const invoice = await Invoice.find({ clientId });
    if (!invoice) {
      return res.status(404).json({ error: "No invoices found" });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new client
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
    clientAutoStatementsEnabled,
    clientAutoStatementEmailDay,
    clientPlanWeekly,
    clientPlanBiweekly,
  } = req.body;

  // error handling
  let emptyFields = [];

  if (!clientName) emptyFields.push("clientName");
  if (!clientEmail) emptyFields.push("clientEmail");
  if (!clientPhoneNumber) emptyFields.push("clientPhoneNumber");
  if (!clientStreetLineOne) emptyFields.push("clientStreetLineOne");
  if (!clientCity) emptyFields.push("clientCity");
  if (!clientState) emptyFields.push("clientState");
  if (!clientZip) emptyFields.push("clientZip");
  if (!clientCycleDate) emptyFields.push("clientCycleDate");

  if (clientCycleDate !== "") {
    if (clientCycleDate < 1 || clientCycleDate > 31) {
      emptyFields.push("clientCycleDate");
    }
  }

  if (emptyFields.length > 0) {
    return res.status(400).json({
      error: "Please check the highlighted fields and try again.",
      emptyFields,
    });
  }

  // add client to DB
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
      clientAutoStatementsEnabled,
      clientAutoStatementEmailDay,
      clientPlanWeekly,
      clientPlanBiweekly,
      user_id,
    });

    if (clientWelcomeEmailEnabled === true) {
      await sendEmail(
        "Welcome Email",
        clientEmail,
        "Welcome to Green2You",
        `Hello ${clientName}. If you are receiving this, it's because you are now enrolled in Green2You's automated invoice service. Greetings! `
      );
    }
    res.status(201).json(client);
  } catch (error) {
    // Handle errors thrown by the signupClient method
    if (error.message === "This is not a valid email") {
      emptyFields.push("clientEmail"); // Push clientEmail to emptyFields array
      return res.status(400).json({ error: error.message, emptyFields });
    } else if (error.message === "Email exists") {
      emptyFields.push("clientEmail"); // Push clientEmail to emptyFields array
      return res.status(400).json({ error: error.message, emptyFields });
    }
    // Handle other errors
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete client
const deleteClient = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "This is not a valid id" });
  }

  try {
    await Invoice.deleteMany({ clientId: id });
    await Statement.deleteMany({ clientId: id });

    const client = await Client.findOneAndDelete({ _id: id });

    if (!client) {
      return res.status(404).json({ error: "No client found" });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a client
const updateClient = async (req, res) => {
  const { id } = req.params;
  const { clientCycleDate } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "This is not a valid id" });
  }

  if (clientCycleDate !== "") {
    if (clientCycleDate < 1 || clientCycleDate > 31) {
      return res.status(404).json({ error: "This is not a valid cycle date" });
    }
  }

  try {
    const client = await Client.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );
    if (!client) {
      return res.status(404).json({ error: "No client found" });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createClient,
  getAllClients,
  getProfile,
  getClient,
  deleteClient,
  updateClient,
};
