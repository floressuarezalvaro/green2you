const Invoice = require("../models/invoiceModel");
const mongoose = require("mongoose");

// Get all invoices
const getAllInvoices = async (req, res) => {
  const user_id = req.user._id;
  const clientId = req.query.clientId;

  if (!clientId) {
    const invoices = await Invoice.find({ user_id }).sort({
      createdAt: -1,
    });
    res.status(200).json(invoices);
  }

  if (clientId) {
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      res.status(404).json({ error: "This is not a valid client id" });
    } else {
      const invoices = await Invoice.find({ user_id } && { clientId }).sort({
        createdAt: -1,
      });
      res.status(200).json(invoices);
    }
  }
};
// Get single invoice
const getInvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "This is not a valid id" });
  }

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    return res.status(400).json({ error: "No invoice found" });
  }
  res.status(200).json(invoice);
};
// Create new invoice
const createInvoice = async (req, res) => {
  const { date, clientName, clientId, price, description } = req.body;

  let emptyFields = [];

  if (!date) {
    emptyFields.push("date");
  }
  if (!clientName) {
    emptyFields.push("clientName");
  }
  if (!clientId) {
    emptyFields.push("clientId");
  }
  if (!price) {
    emptyFields.push("price");
  }
  if (!description) {
    emptyFields.push("description");
  }
  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all the fields", emptyFields });
  }

  // add invoice to DB
  try {
    const user_id = req.user._id;
    const invoice = await Invoice.create({
      date,
      clientName,
      clientId,
      price,
      description,
      user_id,
    });
    res.status(200).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// delete new invoice
const deleteInvoice = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "This is not a valid id" });
  }
  const invoice = await Invoice.findOneAndDelete({ _id: id });
  if (!invoice) {
    return res.status(400).json({ error: "No invoice found" });
  }
  res.status(200).json(invoice);
};

// update an invoice

const updateInvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "This is not a valid id" });
  }
  const invoice = await Invoice.findOneAndUpdate({ _id: id }, { ...req.body });
  if (!invoice) {
    return res.status(400).json({ error: "No invoice found" });
  }
  res.status(200).json(invoice);
};

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoice,
  deleteInvoice,
  updateInvoice,
};
