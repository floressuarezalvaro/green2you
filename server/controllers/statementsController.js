const mongoose = require("mongoose");
const moment = require("moment-timezone");

const Balance = require("../models/balanceModel");
const Client = require("../models/clientModel");
const Invoice = require("../models/invoiceModel");
const Payment = require("../models/paymentModel");
const Statement = require("../models/statementModel");

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

    const lastStatement = await Statement.findOne({
      clientId,
    }).sort({ createdAt: -1 });

    if (lastStatement !== null && lastStatement.isPaid === false) {
      return res.status(400).json({
        error:
          "There is an unpaid statement for this client. This statement was not created.",
      });
    }

    const clientPlan = client.clientPlan;

    const balance = await Balance.findOne({ _id: clientId });

    if (!balance) {
      return res.status(404).json({ error: "Balance not found" });
    }

    const pacificIssuedStartDate = moment
      .tz(issuedStartDate, "America/Los_Angeles")
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

    const pacificIssuedEndDate = moment
      .tz(issuedEndDate, "America/Los_Angeles")
      .set({ hour: 23, minute: 59, second: 59, millisecond: 999 });

    const user_id = client.user_id;

    const invoices = await Invoice.find({
      clientId,
      date: { $gte: pacificIssuedStartDate, $lte: pacificIssuedEndDate },
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

    const historicalStatementsEndDate = new Date(pacificIssuedStartDate);
    const historicalStatementsStartDate = new Date(
      historicalStatementsEndDate.getFullYear(),
      historicalStatementsEndDate.getMonth() - 12,
      historicalStatementsEndDate.getDate(),
      historicalStatementsEndDate.getHours(),
      historicalStatementsEndDate.getMinutes()
    );

    const historicalStatements = await Statement.find({
      clientId,
      issuedEndDate: {
        $gte: historicalStatementsStartDate,
        $lte: historicalStatementsEndDate,
      },
    });

    const historicalStatementsData = historicalStatements.map((statement) => ({
      _id: statement._id,
      issuedStartDate: statement.issuedStartDate,
      issuedEndDate: statement.issuedEndDate,
      totalAmount: statement.totalAmount,
      paidAmount: statement.paidAmount,
      checkNumber: statement.checkNumber,
      checkDate: statement.checkDate,
    }));

    const balanceData = await Balance.findOne({ _id: clientId });

    const statement = await Statement.create({
      clientId,
      invoiceData,
      historicalStatementsData,
      balanceData,
      totalAmount,
      issuedStartDate: pacificIssuedStartDate,
      issuedEndDate: pacificIssuedEndDate,
      creationMethod,
      clientPlan,
      user_id,
      isPaid: false,
      paidAmount: 0,
      checkNumber: 0,
      checkDate: 0,
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
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
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
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
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
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
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

    const payment = await Payment.findOneAndDelete({ statementId: id });

    if (payment) {
      const clientId = payment.clientId;
      const balance = await Balance.findOne({ _id: clientId });

      const decreaseCurrentBalance =
        Number(balance.currentBalance) - Number(payment.amount);

      await Balance.updateOne(
        { _id: clientId },
        {
          currentBalance: decreaseCurrentBalance,
        }
      );
    }

    res.status(200).json(statement);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
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
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
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
