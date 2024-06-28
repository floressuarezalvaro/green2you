const Invoice = require("../models/invoiceModel");
const Client = require("../models/clientModel");
const Balance = require("../models/balanceModel");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

// Get all invoices
const getAllInvoices = async (req, res) => {
  try {
    const user_id = req.user._id;
    const clientId = req.query.clientId;

    let query = { user_id };

    if (clientId) {
      if (!mongoose.Types.ObjectId.isValid(clientId)) {
        return res.status(400).json({ error: "This is not a valid client id" });
      }
      query.clientId = clientId;
    }

    const invoices = await Invoice.find(query).sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
// Get single invoice
const getInvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  try {
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ error: "No invoice found" });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
// Create new invoice
const createInvoice = async (req, res) => {
  const { date, clientId, amount, description } = req.body;

  let emptyFields = [];

  if (!clientId) emptyFields.push("clientName");
  if (!date) emptyFields.push("date");
  if (!amount) emptyFields.push("amount");
  if (!description) emptyFields.push("description");

  if (emptyFields.length > 0) {
    return res.status(400).json({
      error: "Please check the highlighted fields and try again.",
      emptyFields,
    });
  }

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ error: "This is not a valid client id" });
  }

  // Set the date to 5:30 PM PT
  const dateTime = moment
    .tz(date, "America/Los_Angeles")
    .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

  // add invoice to DB
  try {
    const user_id = req.user._id;
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const balance = await Balance.findOne({ _id: clientId });

    if (!balance) {
      return res
        .status(404)
        .json({ error: "No balance found for the given client id" });
    }

    const invoice = await Invoice.create({
      date: dateTime,
      clientId,
      amount,
      description,
      user_id,
    });
    const serviceDues = Number(balance.serviceDues) + Number(amount);
    await Balance.updateOne({ _id: clientId }, { serviceDues: serviceDues });
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// delete new invoice
const deleteInvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  try {
    const invoice = await Invoice.findOneAndDelete({ _id: id });
    if (!invoice) {
      return res.status(404).json({ error: "No invoice found" });
    }

    const clientId = invoice.clientId;
    const balance = await Balance.findOne({ _id: clientId });

    if (!balance) {
      return res
        .status(404)
        .json({ error: "No balance found for the given client id" });
    }

    const serviceDues = Number(balance.serviceDues) - Number(invoice.amount);
    await Balance.updateOne({ _id: clientId }, { serviceDues: serviceDues });

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// update an invoice

const updateInvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );
    if (!invoice) {
      return res.status(404).json({ error: "No invoice found" });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoice,
  deleteInvoice,
  updateInvoice,
};
