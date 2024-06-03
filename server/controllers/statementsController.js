const PDFDocument = require("pdfkit");
const mongoose = require("mongoose");
const fs = require("fs");

const Invoice = require("../models/invoiceModel");
const Statement = require("../models/statementModel");

const green2YouLogo = (doc) => {
  doc.fontSize(16).text("Green2You", { align: "left" });
  doc.fontSize(12).text("6520 SW 190th Ave", { align: "left" });
  doc.text("Beaverton, OR 97078", { align: "left" });
  doc.moveDown();
};

const printStatement = async (req, res) => {
  const { clientId } = req.params;
  const month = req.query.month;
  console.log(month);

  let totalAmount = 0;

  const invoices = await Invoice.find({ clientId }).sort({ createdAt: -1 });

  if (invoices.length === 0) {
    return res.status(404).send("No invoices found for this client");
  }

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice_${clientId}.pdf`
  );

  // Pipe the PDF into the response
  doc.pipe(res);

  green2YouLogo(doc);

  doc.fontSize(20).text("Statement", { align: "center" });
  doc.moveDown();

  invoices.forEach((invoice) => {
    doc.fontSize(12).text(`Invoice ID: ${invoice._id}`);
    doc.text(`Date: ${invoice.date}`);
    doc.text(`Amount: ${invoice.amount}`);

    totalAmount += invoice.amount;

    doc.moveDown();
  });

  doc.fontSize(14).text(`Total Amount:`, { align: "right", underline: true });
  doc.fontSize(12).text(`${totalAmount}`, { align: "right" });

  doc.end();
};

const createStatement = async (req, res) => {
  const { clientId, issuedStartDate, issuedEndDate, user_id } = req.body;

  try {
    const invoices = await Invoice.find({
      clientId,
      date: { $gte: issuedStartDate, $lte: issuedEndDate },
    });

    const totalAmount = invoices.reduce(
      (sum, invoice) => sum + invoice.amount,
      0
    );

    const data = invoices.map((invoice) => ({
      _id: invoice._id,
      date: invoice.date,
      amount: invoice.amount,
      description: invoice.description,
    }));

    const statement = await Statement.create({
      clientId,
      data,
      totalAmount,
      issuedStartDate,
      issuedEndDate,
      user_id,
    });
    res.status(201).json(statement);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllStatements = async (req, res) => {
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

    const statements = await Statement.find(query).sort({ createdAt: -1 });
    res.status(200).json(statements);
  } catch (error) {
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
  printStatement,
  createStatement,
  getAllStatements,
  getStatement,
  deleteStatement,
  updateStatement,
};
