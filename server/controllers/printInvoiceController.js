const PDFDocument = require("pdfkit");
const fs = require("fs");

const Invoice = require("../models/invoiceModel");

const green2YouLogo = (doc) => {
  doc.fontSize(16).text("Green2You", { align: "left" });
  doc.fontSize(12).text("6520 SW 190th Ave", { align: "left" });
  doc.text("Beaverton, OR 97078", { align: "left" });
  doc.moveDown();
};

// Get all clients
const printInvoice = async (req, res) => {
  const { clientId } = req.params;
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

  doc.fontSize(20).text("Invoice", { align: "center" });
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

module.exports = {
  printInvoice,
};
