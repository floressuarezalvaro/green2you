const Client = require("../models/clientModel");
const mongoose = require("mongoose");

// Get all clients
const getAllClients = async (req, res) => {
  const user_id = req.user._id;

  const clients = await Client.find({ user_id }).sort({ createdAt: -1 });
  res.status(200).json(clients);
};
// Get single client
const getClient = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "This is not a valid id" });
  }

  const client = await Client.findById(id);
  if (!client) {
    return res.status(400).json({ error: "No invoice found" });
  }
  res.status(200).json(client);
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
  } = req.body;

  // error handling
  let emptyFields = [];

  if (!clientName) {
    emptyFields.push("Name");
  }
  if (!clientEmail) {
    emptyFields.push("Email");
  }
  if (!clientPhoneNumber) {
    emptyFields.push("Phone Number");
  }
  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all the required fields", emptyFields });
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
      user_id,
    });
    res.status(200).json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete client
const deleteClient = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "This is not a valid id" });
  }
  const client = await Client.findOneAndDelete({ _id: id });
  if (!client) {
    return res.status(400).json({ error: "No invoice found" });
  }
  res.status(200).json(client);
};

// update a client

const updateClient = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "This is not a valid id" });
  }
  const client = await Client.findOneAndUpdate({ _id: id }, { ...req.body });
  if (!client) {
    return res.status(400).json({ error: "No invoice found" });
  }
  res.status(200).json(client);
};

module.exports = {
  createClient,
  getAllClients,
  getClient,
  deleteClient,
  updateClient,
};
