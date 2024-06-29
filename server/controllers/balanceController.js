const mongoose = require("mongoose");
const Balance = require("../models/balanceModel");
const Client = require("../models/clientModel");

const createBalance = async (req, res) => {
  const { id } = req.params;

  let {
    previousStatementBalance,
    paymentsOrCredits,
    serviceDues,
    newStatementBalance,
    pastDueAmount,
  } = req.body;

  previousStatementBalance = previousStatementBalance ?? 0;
  paymentsOrCredits = paymentsOrCredits ?? 0;
  serviceDues = serviceDues ?? 0;
  newStatementBalance = newStatementBalance ?? 0;
  pastDueAmount = pastDueAmount ?? 0;

  if (
    isNaN(previousStatementBalance) ||
    isNaN(paymentsOrCredits) ||
    isNaN(serviceDues) ||
    isNaN(newStatementBalance) ||
    isNaN(pastDueAmount)
  ) {
    return res.status(400).json({ error: "All fields must be valid numbers" });
  }

  if (
    previousStatementBalance === "" ||
    paymentsOrCredits === "" ||
    serviceDues === "" ||
    newStatementBalance === "" ||
    pastDueAmount === ""
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "This is not a valid id" });
  }

  try {
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const createdBalance = await Balance.create({
      _id: id,
      clientId: id,
      previousStatementBalance,
      paymentsOrCredits,
      serviceDues,
      newStatementBalance,
      pastDueAmount,
    });
    res.status(201).json(createdBalance);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getBalance = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "This is not a valid id" });
  }

  try {
    const balance = await Balance.findById(id);
    if (!balance) {
      return res.status(404).json({ error: "Client balance not found" });
    }
    res.status(200).json(balance);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllBalances = async (req, res) => {
  try {
    const balances = await Balance.find().sort({ createdAt: -1 });

    res.status(200).json(balances);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
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
    res.status(500).json({ error: "Internal server error" });
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
      return res.status(404).json({ error: "No invoice found" });
    }
    res.status(200).json(balance);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createBalance,
  getBalance,
  getAllBalances,
  updateBalance,
  deleteBalance,
};
