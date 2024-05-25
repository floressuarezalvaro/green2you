const Client = require("../models/clientModel");
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
  } = req.body;

  // error handling
  let emptyFields = [];

  if (!clientName) emptyFields.push("clientName");
  if (!clientEmail) emptyFields.push("clientEmail");
  if (!clientPhoneNumber) emptyFields.push("clientPhoneNumber");
  if (!clientCycleDate || clientCycleDate < 1 || clientCycleDate > 31) {
    emptyFields.push("clientCycleDate");
  }

  if (emptyFields.length > 0) {
    return res.status(400).json({
      error: "Please fill in all the required fields",
      emptyFields,
    });
  }

  // add client to DB
  try {
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
      user_id,
    });
    res.status(201).json(client);
  } catch (error) {
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

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "This is not a valid id" });
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
  getClient,
  deleteClient,
  updateClient,
};
