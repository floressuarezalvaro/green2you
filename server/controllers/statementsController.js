const PDFDocument = require("pdfkit");
const mongoose = require("mongoose");
const fs = require("fs");

const Statement = require("../models/statementModel");
const Invoice = require("../models/invoiceModel");

const green2YouLogo = (doc) => {
  doc.fontSize(16).text("Green2You", { align: "left" });
  doc.fontSize(12).text("6520 SW 190th Ave", { align: "left" });
  doc.text("Beaverton, OR 97078", { align: "left" });
  doc.moveDown();
};

const printStatement = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  try {
    const statement = await Statement.findById(id);

    if (!statement) {
      return res.status(404).json({ error: "No statement found" });
    }

    // create doc
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=statement${id}.pdf`
    );

    // Pipe the PDF into the response
    doc.pipe(res);

    green2YouLogo(doc);
    doc.fontSize(20).text("Statement", { align: "center" });
    doc.moveDown();

    statement.invoiceData.forEach((invoice) => {
      doc.fontSize(12).text(`Invoice ID: ${invoice._id}`);
      doc.text(`Date: ${new Date(invoice.date).toDateString()}`);
      doc.text(`Amount: ${invoice.amount}`);
      doc.text(`Description: ${invoice.description}`);
      doc.moveDown();
    });

    doc.fontSize(14).text(`Total Amount:`, { align: "right", underline: true });
    doc.fontSize(12).text(`${statement.totalAmount}`, { align: "right" });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const createStatement = async (req, res) => {
  const { clientId, issuedStartDate, issuedEndDate, user_id } = req.body;

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ error: "This is not a valid client id" });
  }

  try {
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
    }));

    const statement = await Statement.create({
      clientId,
      invoiceData,
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
  const { clientId } = req.params;
  const { month, year } = req.query;

  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    return res.status(400).json({ error: "This is not a valid client id" });
  }

  let query = { clientId };

  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    query.issuedStartDate = { $lte: endDate };
    query.issuedEndDate = { $gte: startDate };
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
  printStatement,
  createStatement,
  getAllStatements,
  getStatement,
  deleteStatement,
  updateStatement,
};
