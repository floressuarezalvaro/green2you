const mongoose = require("mongoose");
const moment = require("moment-timezone");

const Statement = require("../models/statementModel");
const Invoice = require("../models/invoiceModel");
const Client = require("../models/clientModel");

const createStatement = async (req, res) => {
  const { clientId, issuedStartDate, issuedEndDate, creationMethod } = req.body;

  let emptyFields = [];

  if (!clientId) emptyFields.push("clientName");
  if (!issuedStartDate) emptyFields.push("issuedStartDate");
  if (!issuedEndDate) emptyFields.push("issuedEndDate");
  if (!creationMethod) emptyFields.push("creationMethod");

  if (emptyFields.length > 0) {
    return res.status(400).json({
      error: "Please check the highlighted fields and try again.",
      emptyFields,
    });
  }

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ error: "This is not a valid client id" });
  }

  try {
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const user_id = client.user_id;

    const invoices = await Invoice.find({
      clientId,
      date: { $gte: issuedStartDate, $lte: issuedEndDate },
    });

    const totalAmount = invoices.reduce(
      (sum, invoice) => sum + invoice.amount,
      0
    );

    const invoiceData = invoices.map((invoice) => ({
      _id: invoice._id,
      date: invoice.date,
      amount: invoice.amount,
      description: invoice.description,
      clientId: invoice.clientId,
      user_id: invoice.user_id,
    }));

    const pacificIssuedStartDate = moment
      .tz(issuedStartDate, "America/Los_Angeles")
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

    const pacificIssuedEndDate = moment
      .tz(issuedEndDate, "America/Los_Angeles")
      .set({ hour: 23, minute: 59, second: 59, millisecond: 999 });

    const statement = await Statement.create({
      clientId,
      invoiceData,
      totalAmount,
      issuedStartDate: pacificIssuedStartDate,
      issuedEndDate: pacificIssuedEndDate,
      creationMethod,
      user_id,
    });

    res.status(201).json(statement);
  } catch (error) {
    console.error("Error creating statement:", error.message);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

const getAllStatements = async (req, res) => {
  const user_id = req.user._id;

  try {
    const statements = await Statement.find({ user_id }).sort({
      createdAt: -1,
    });
    res.status(200).json(statements);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllClientStatements = async (req, res) => {
  const { clientId } = req.params;
  const { month, year } = req.query;

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ error: "This is not a valid client id" });
  }

  let query = { clientId };

  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    query.issuedStartDate = { $gte: startDate };
    query.issuedEndDate = { $lte: endDate };
  }

  try {
    const statements = await Statement.find(query).sort({
      createdAt: -1,
    });

    res.status(200).json(statements);
  } catch (error) {
    console.error("Error fetching statements:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getStatement = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  try {
    const statement = await Statement.findById(id);
    if (!statement) {
      return res.status(404).json({ error: "No statement found" });
    }
    res.status(200).json(statement);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteStatement = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  try {
    const statement = await Statement.findOneAndDelete({ _id: id });
    if (!statement) {
      return res.status(404).json({ error: "No statement found" });
    }
    res.status(200).json(statement);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateStatement = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  const { user_id } = req.body;

  try {
    const statement = await Statement.findOneAndUpdate(
      { _id: id },
      { $set: { user_id } },
      { new: true }
    );
    if (!statement) {
      return res.status(404).json({ error: "No statement found" });
    }
    res.status(200).json(statement);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createStatement,
  getAllStatements,
  getAllClientStatements,
  getStatement,
  deleteStatement,
  updateStatement,
};
