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
    .text("6520 SW 190TH AVE, BEAVERTON, OR 97078", { align: "center" });
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

    if (!statement) {
      return res.status(404).json({ error: "No statement found" });
    }

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
    const availableWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;

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

    // Header Line 1
    doc.text("BILLING DETAIL", doc.page.margins.left, doc.y, {
      continued: true,
    });
    doc
      .font(font)
      .text("Amount Due                 Amount Due", { align: "right" });
    doc.moveDown(0.2);

    // Header Line 2

    // Calculate Amount Due Date
    const issuedDate = new Date(statement.issuedEndDate);
    const dueDate = new Date(issuedDate);
    dueDate.setDate(issuedDate.getDate() + 28);
    const dueMonth = String(dueDate.getMonth() + 1).padStart(2, "0");
    const dueDay = String(dueDate.getDate()).padStart(2, "0");

    const dueMonthDay = `${dueMonth}/${dueDay}`;

    // print Amount Due Line
    doc.text("SERVICES", doc.page.margins.left, doc.y, {
      continued: true,
    });
    doc
      .font(font)
      .text(`By ${dueMonthDay}                   After ${dueMonthDay}`, {
        align: "right",
      });
    doc.moveDown(0.2);

    // line
    const header1BottomLineY = doc.y;
    doc
      .moveTo(doc.page.margins.left, header1BottomLineY)
      .lineTo(doc.page.width - doc.page.margins.right, header1BottomLineY)
      .stroke();

    doc.moveDown();

    // line end

    // Plan Type
    const planText = [];

    if (selectedClient.clientPlanWeekly) {
      planText.push(selectedClient.clientPlanWeekly);
    }

    if (selectedClient.clientPlanBiweekly) {
      planText.push(selectedClient.clientPlanBiweekly);
    }

    if (planText.length > 0) {
      doc.text(`Plan: ${planText.join(" ")}`, doc.page.margins.left);
      doc.moveDown();
    }

    // Invoice Data
    // Group invoices by amount and month
    const groupedInvoices = {};
    statement.invoiceData.forEach((invoice) => {
      const month = new Date(invoice.date).toLocaleString("en-US", {
        month: "long",
      });
      const key = `${month}-${invoice.amount}`;
      if (!groupedInvoices[key]) {
        groupedInvoices[key] = {
          count: 0,
          amount: invoice.amount,
          total: 0,
          month: month, // store the month
          dates: [],
        };
      }
      groupedInvoices[key].count += 1;
      groupedInvoices[key].total += invoice.amount;
      groupedInvoices[key].dates.push(new Date(invoice.date).getDate());
    });

    // Display grouped invoices
    let totalAmount = 0;
    Object.keys(groupedInvoices).forEach((key) => {
      const group = groupedInvoices[key];
      const dates = group.dates.join(", ");
      doc.text(
        `${group.count} X $${group.amount.toFixed(2)} = $${group.total.toFixed(
          2
        )} ${group.month} ${dates}`,
        { align: "left" }
      );
      totalAmount += group.total;
      doc.moveDown();
    });

    // Create a string to show each group total amount
    let totalString = "";
    Object.keys(groupedInvoices).forEach((key, index) => {
      const group = groupedInvoices[key];
      if (index > 0) {
        totalString += " + ";
      }
      totalString += `$${group.total.toFixed(2)}`;
    });

    // Display grand total amount
    doc.text(`${totalString} = $${totalAmount.toFixed(2)}`, { align: "left" });
    doc.moveDown();

    // Total Amount Values

    const dueByAmount = `$${statement.totalAmount}`;
    const totalAmountAfter = statement.totalAmount + 5;
    const dueAfterAmount = `$${totalAmountAfter}`;

    const dueByAmountWidth = doc.widthOfString(dueByAmount, {
      font: font,
    });
    const dueAfterAmountWidth = doc.widthOfString(dueAfterAmount);

    const xAmountDue =
      availableWidth - (dueByAmountWidth + dueAfterAmountWidth + 15);

    doc.text(dueByAmount, xAmountDue, doc.y, {
      continued: true,
    });
    if (statement.totalAmount == 0) {
      doc.font(font).text("$0", { align: "right" });
    } else {
      doc.text(dueAfterAmount, { align: "right" });
    }
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
