const mongoose = require("mongoose");

const Balance = require("../models/balanceModel");
const Client = require("../models/clientModel");

const createBalance = async (req, res) => {
  const { id } = req.params;

  let { currentBalance } = req.body;

  currentBalance = currentBalance ?? 0;

  if (isNaN(currentBalance)) {
    return res.status(400).json({ error: "All fields must be valid numbers" });
  }

  if (currentBalance === "") {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  try {
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const createdBalance = await Balance.create({
      _id: id,
      clientId: id,
    });
    res.status(201).json(createdBalance);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

const getBalance = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  try {
    const balance = await Balance.findById(id);
    if (!balance) {
      return res.status(404).json({ error: "Client balance not found" });
    }
    res.status(200).json(balance);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

const getAllBalances = async (req, res) => {
  try {
    const balances = await Balance.find().sort({ createdAt: -1 });

    res.status(200).json(balances);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

const updateBalance = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  try {
    const balance = await Balance.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );
    if (!balance) {
      return res.status(404).json({ error: "No balance found" });
    }
    res.status(200).json(balance);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

const deleteBalance = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  try {
    const balance = await Balance.findOneAndDelete({ _id: id });
    if (!balance) {
      return res.status(404).json({ error: "No balance found" });
    }
    res.status(200).json(balance);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

module.exports = {
  createBalance,
  getBalance,
  getAllBalances,
  updateBalance,
  deleteBalance,
};
