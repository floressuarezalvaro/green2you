const mongoose = require("mongoose");
const Balance = require("../models/balanceModel");
const Client = require("../models/clientModel");

const createBalance = async (req, res) => {
  const { id } = req.params;
  let { amountDue, balance } = req.body;

  amountDue = amountDue ?? 0;
  balance = balance ?? 0;

  if (amountDue === "" || balance === "") {
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
      amountDue,
      balance,
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

module.exports = {
  createBalance,
  getBalance,
};
