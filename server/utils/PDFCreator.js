const PDFDocument = require("pdfkit");
const mongoose = require("mongoose");

const Statement = require("../models/statementModel");
const Client = require("../models/clientModel");

const green2YouLogo = (doc) => {
  doc.fontSize(20).text("G R E E N   2   Y O U", {
    align: "center",
    underline: true,
    bold: true,
  });
  doc
    .fontSize(10)
    .text("6520 SW 190th AVE, BEAVERTON, OR 97078", { align: "center" });
  doc.text("PROFESSIONAL LANDSCAPE MAINTENANCE", { align: "center" });
  doc.text("ALVARO (503)330-4596     SAUL(503)318-3089", { align: "center" });
  doc.text("Email: Saulflo@msn.com", { align: "center" });
  doc.text("BONDED, INSURED", { align: "center" });
  doc.moveDown();
};

const printStatement = async (req, res) => {
  const { id } = req.params;
  const font = "Helvetica";
  const boldFont = "Helvetica-Bold";

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "This is not a valid id" });
  }

  try {
    const statement = await Statement.findById(id);
    const displayCreatedDate = new Date(statement.createdAt).toLocaleString(
      "en-US",
      {
        timeZone: "America/Los_Angeles",
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }
    );

    if (!statement) {
      return res.status(404).json({ error: "No statement found" });
    }

    const selectedClient = await Client.findById(statement.clientId);

    // create doc
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=statement${id}.pdf`
    );

    // Pipe the PDF into the response
    doc.pipe(res);

    // Client Contact Information
    green2YouLogo(doc);
    doc.text(selectedClient.clientName, { align: "left" });
    doc.text(selectedClient.clientStreetLineOne, { align: "left" });
    if (selectedClient.clientStreetLineTwo) {
      doc.text(selectedClient.clientStreetLineTwo, { align: "left" });
    }
    doc.text(
      `${selectedClient.clientCity}, ${selectedClient.clientState} ${selectedClient.clientZip}`,
      { align: "left" }
    );
    doc.text(`Date: ${displayCreatedDate}`, { align: "left" });
    doc.text(selectedClient.clientEmail, { align: "left" });

    doc.moveDown(1);

    // line
    const topLineY = doc.y;
    doc
      .moveTo(doc.page.margins.left, topLineY)
      .lineTo(doc.page.width - doc.page.margins.right, topLineY)
      .stroke();

    doc.moveDown(0.5);

    // line end

    // Header
    doc.text("BILLING DETAIL");
    doc.text("SERVICES");
    doc.moveDown(0.2);

    // line
    const header1BottomLineY = doc.y;
    doc
      .moveTo(doc.page.margins.left, header1BottomLineY)
      .lineTo(doc.page.width - doc.page.margins.right, header1BottomLineY)
      .stroke();

    doc.moveDown();

    // line end

    // Invoice Data
    statement.invoiceData.forEach((invoice) => {
      doc.fontSize(10).text(`Date: ${new Date(invoice.date).toDateString()}`);
      doc.text(`Amount: $${invoice.amount}`);
      doc.text(`Description: ${invoice.description}`);
      doc.moveDown();
    });

    // Total Amount Headers
    const dueByText = "Amount Due By April 27th";
    const dueAfterText = "Amount Due After April 27th";

    const dueByTextWidth = doc.widthOfString(dueByText, {
      font: font,
    });
    const dueAfterTextWidth = doc.widthOfString(dueAfterText, {
      underline: true,
    });

    const dueAvailableWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;

    const xDue = dueAvailableWidth - (dueByTextWidth + dueAfterTextWidth - 65);

    doc.text(dueByText, xDue, doc.y, {
      continued: true,
      underline: true,
    });
    doc.font(font).text(dueAfterText, { align: "right" });
    doc.moveDown(1);

    // Total Amount Values

    const dueByAmount = `$${statement.totalAmount}`;
    const totalAmountAfter = statement.totalAmount + 5;
    const dueAfterAmount = `$${totalAmountAfter}`;

    const dueByAmountWidth = doc.widthOfString(dueByAmount, {
      font: font,
    });
    const dueAfterAmountWidth = doc.widthOfString(dueAfterAmount);

    const dueAmountAvailableWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;

    const xAmountDue =
      dueAmountAvailableWidth - (dueByAmountWidth + dueAfterAmountWidth + 40);

    doc.text(dueByAmount, xAmountDue, doc.y, {
      continued: true,
    });
    doc.font(font).text(dueAfterAmount, { align: "right" });
    doc.moveDown(1);

    // Comments
    doc.text("Comments:", doc.page.margins.left);
    doc.moveDown(1);

    // comment lines
    const commentLineY = doc.y;
    doc
      .moveTo(doc.page.margins.left, commentLineY)
      .lineTo(doc.page.width - doc.page.margins.right, commentLineY)
      .stroke();

    doc.moveDown(1.5);
    const commentLineY2 = doc.y;
    doc
      .moveTo(doc.page.margins.left, commentLineY2)
      .lineTo(doc.page.width - doc.page.margins.right, commentLineY2)
      .stroke();
    doc.moveDown(0.5);

    // comment lines end

    const thankYouText = "Thank You.";
    const paymentText = "Mail the payment to my address.";

    const thankYouWidth = doc.widthOfString(thankYouText, {
      font: boldFont,
    });
    const paymentTextWidth = doc.widthOfString(paymentText, {
      font: font,
    });

    const availableWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;

    const x = availableWidth - (thankYouWidth + paymentTextWidth - 65);

    doc.text("Mail the payment to my address.", x, doc.y, {
      continued: true,
      align: "left",
    });
    doc.font(boldFont).text("Thank You.", { align: "right" });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  printStatement,
};
