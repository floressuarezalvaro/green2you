const Payment = require("../models/paymentModel");
const Client = require("../models/clientModel");
const Statement = require("../models/statementModel");
const Balance = require("../models/balanceModel");
const moment = require("moment-timezone");

const mongoose = require("mongoose");

const makePayment = async (req, res) => {
  const { clientId, statementId, type, amount, checkDate, checkNumber, memo } =
    req.body;

  let emptyFields = [];

  if (!clientId) emptyFields.push("clientName");
  if (!statementId) emptyFields.push("statementId");
  if (!type) emptyFields.push("type");
  if (!amount) emptyFields.push("amount");
  if (!checkDate) emptyFields.push("checkDate");
  if (!checkNumber) emptyFields.push("checkNumber");

  if (emptyFields.length > 0) {
    return res.status(400).json({
      error: "Please check the highlighted fields and try again.",
      emptyFields,
    });
  }

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ error: "This is not a valid client id" });
  }

  if (!mongoose.Types.ObjectId.isValid(statementId)) {
    return res.status(400).json({ error: "This is not a valid statement id" });
  }

  const dateTime = moment
    .tz(checkDate, "America/Los_Angeles")
    .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

  try {
    const user_id = req.user._id;
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const statement = await Statement.findById(statementId);
    if (!statement) {
      return res.status(404).json({ error: "Statement not found" });
    }

    const balance = await Balance.findOne({ _id: clientId });

    if (!balance) {
      return res
        .status(404)
        .json({ error: "No balance found for the given client id" });
    }

    const payment = await Payment.create({
      clientId,
      statementId,
      type,
      amount,
      checkDate: dateTime,
      checkNumber,
      memo,
      user_id,
    });

    if (type === "credit") {
      const decreaseBalance =
        Number(balance.paymentsOrCredits) - Number(amount);

      await Balance.updateOne(
        { _id: clientId },
        { paymentsOrCredits: decreaseBalance }
      );

      await Statement.updateOne(
        { _id: statementId },
        { isPaid: true, paidAmount: amount, checkDate, checkNumber }
      );
    }

    if (type === "debit") {
      const increaseBalance =
        Number(balance.paymentsOrCredits) + Number(amount);
      await Balance.updateOne(
        { _id: clientId },
        { paymentsOrCredits: increaseBalance }
      );
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllPayments = async (req, res) => {
  const user_id = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(404).json({ error: "This is not a valid client id" });
  }

  try {
    const payments = await Payment.find({ user_id }).sort({ createdAt: -1 });
    res.status(201).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPaymentsByClient = async (req, res) => {
  const { clientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ error: "This is not a valid client id" });
  }

  try {
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const payments = await Payment.find({ clientId: clientId }).sort({
      createdAt: -1,
    });
    res.status(201).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPaymentsById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid client id" });
  }

  try {
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updatePayment = async (req, res) => {
  const { id } = req.params;
  const { amount, checkDate, checkNumber } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid client id" });
  }

  try {
    let updateFields = { ...req.body };

    if (checkDate) {
      updateFields.checkDate = moment
        .tz(checkDate, "America/Los_Angeles")
        .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
    }

    const payment = await Payment.findOneAndUpdate({ _id: id }, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const statementId = payment.statementId;

    const statement = await Statement.findOneAndUpdate(
      { _id: statementId },
      { paidAmount: amount, checkDate: updateFields.checkDate, checkNumber }
    );

    if (!statement) {
      return res.status(404).json({ error: "Statement not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deletePayment = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid client id" });
  }

  try {
    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const clientId = payment.clientId;

    if (!clientId) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const balance = await Balance.findOne({ _id: clientId });
    const amount = payment.amount;
    const type = payment.type;

    if (type === "credit") {
      const increaseBalance =
        Number(balance.paymentsOrCredits) + Number(amount);
      await Balance.updateOne(
        { _id: clientId },
        { paymentsOrCredits: increaseBalance }
      );
    }

    if (type === "debit") {
      const decreaseBalance =
        Number(balance.paymentsOrCredits) - Number(amount);
      await Balance.updateOne(
        { _id: clientId },
        { paymentsOrCredits: decreaseBalance }
      );
    }

    const statementId = payment.statementId;

    const statement = await Statement.findOneAndUpdate(
      { _id: statementId },
      { isPaid: false, paidAmount: 0, checkDate: null, checkNumber: null }
    );

    if (!statement) {
      return res.status(404).json({ error: "Statement not found" });
    }

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  makePayment,
  getAllPayments,
  getPaymentsByClient,
  getPaymentsById,
  updatePayment,
  deletePayment,
};
