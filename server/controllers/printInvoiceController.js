const PDFDocument = require("pdfkit");
const fs = require("fs");

const Invoice = require("../models/invoiceModel");

// Get all clients
const printInvoice = async (req, res) => {
  const { clientId } = req.params;

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

  // Add content to PDF
  doc.fontSize(25).text("Invoice", { align: "center" });
  doc.moveDown();

  invoices.forEach((invoice) => {
    doc.fontSize(16).text(`Invoice ID: ${invoice._id}`);
    doc.text(`Date: ${invoice.date}`);
    doc.text(`Amount: ${invoice.price}`);
    doc.text(`Description: ${invoice.description}`);
    doc.moveDown();
  });

  doc.end();
};

module.exports = {
  printInvoice,
};
