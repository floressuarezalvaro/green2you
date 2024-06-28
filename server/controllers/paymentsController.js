const Payment = require("../models/paymentModel");
const Client = require("../models/clientModel");
const Invoice = require("../models/invoiceModel");
const Balance = require("../models/balanceModel");

const mongoose = require("mongoose");

const makePayment = async (req, res) => {
  const { clientId, invoiceId, type, amount, checkDate, checkNumber, memo } =
    req.body;

  let emptyFields = [];

  if (!clientId) emptyFields.push("clientName");
  if (!invoiceId) emptyFields.push("invoiceId");
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

  if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
    return res.status(400).json({ error: "This is not a valid invoice id" });
  }

  try {
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const balance = await Balance.findOne({ _id: clientId });

    if (!balance) {
      return res
        .status(404)
        .json({ error: "No balance found for the given client id" });
    }

    const payment = await Payment.create({
      clientId,
      invoiceId,
      type,
      amount,
      checkDate,
      checkNumber,
      memo,
    });

    if (type === "credit") {
      const decreaseBalance =
        Number(balance.paymentsOrCredits) - Number(amount);
      await Balance.updateOne(
        { _id: clientId },
        { paymentsOrCredits: decreaseBalance }
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

module.exports = { makePayment };
