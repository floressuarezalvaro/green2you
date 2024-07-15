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

    const formatDate = (date) => {
      return new Date(date).toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    };

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

    displayCreatedDate = formatDate(statement.createdAt);
    doc.text(`Date: ${displayCreatedDate}`, { align: "left" });

    doc.text(selectedClient.clientEmail, { align: "left" });

    doc.moveDown(0.75);

    // line
    const TopLineY = doc.y;
    doc
      .moveTo(doc.page.margins.left, TopLineY)
      .lineTo(doc.page.width - doc.page.margins.right, TopLineY)
      .stroke();

    doc.moveDown(0.5);

    // line end

    doc.text(`AMOUNT BILLED LAST MONTHS`);

    doc.text("SERVICES", doc.page.margins.left, doc.y, {
      continued: true,
    });
    doc.font(font).text(`AMOUNT BILLED   AMOUNT PAID   DATE   CHECK#`, {
      align: "right",
    });
    doc.moveDown(0.1);

    // line
    const historicalDataHeaderEnd = doc.y;
    doc
      .moveTo(doc.page.margins.left, historicalDataHeaderEnd)
      .lineTo(doc.page.width - doc.page.margins.right, historicalDataHeaderEnd)
      .stroke();

    doc.moveDown(0.5);

    // line end
    // Historical Data Body
    doc.text(`Plan: ${selectedClient.clientPlan}`, doc.page.margins.left);
    doc.text(`Historical Statement Body`);
    doc.moveDown(1.0);

    // line
    const CurrentBillingLineY = doc.y;
    doc
      .moveTo(doc.page.margins.left, CurrentBillingLineY)
      .lineTo(doc.page.width - doc.page.margins.right, CurrentBillingLineY)
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
    const createdDate = new Date(statement.createdAt);
    const dueDate = new Date(createdDate);
    dueDate.setDate(createdDate.getDate() + 15);
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
    doc.moveDown(0.1);

    // line
    const header1BottomLineY = doc.y;
    doc
      .moveTo(doc.page.margins.left, header1BottomLineY)
      .lineTo(doc.page.width - doc.page.margins.right, header1BottomLineY)
      .stroke();

    doc.moveDown();

    // line end

    // Plan Type

    displayIssuedStartDate = formatDate(statement.issuedStartDate);
    displayIssuedEndDate = formatDate(statement.issuedEndDate);
    doc.text(
      `Opening/Closing Date: ${displayIssuedStartDate} - ${displayIssuedEndDate}`
    );
    doc.moveDown(0.5);

    // Invoice Data
    // Group invoices by amount and month

    const lowerCaseClientPlan = selectedClient.clientPlan.toLowerCase();
    const planTypeMonthly = lowerCaseClientPlan.includes("month");

    const monthLong = (date) => {
      return date.toLocaleString("en-US", {
        month: "long",
      });
    };

    if (planTypeMonthly) {
      statement.invoiceData.forEach((invoice) => {
        console.log(invoice.date);
        doc.text(
          `${monthLong(invoice.date)} Services $${invoice.amount}/Month`,
          doc.page.margins.left
        );
      });
    } else {
      const groupedInvoices = {};
      const uniqueInvoices = [];
      statement.invoiceData.forEach((invoice) => {
        if (invoice.description) {
          uniqueInvoices.push(invoice);
        } else {
          const month = monthLong(invoice.date);
          const key = `${month}-${invoice.amount}`;
          if (!groupedInvoices[key]) {
            groupedInvoices[key] = {
              count: 0,
              amount: invoice.amount,
              total: 0,
              month: month,
              dates: [],
            };
          }
          groupedInvoices[key].count += 1;
          groupedInvoices[key].total += invoice.amount;
          groupedInvoices[key].dates.push(new Date(invoice.date).getDate());
        }
      });

      // Display grouped invoices
      const groupedKeys = Object.keys(groupedInvoices);
      groupedKeys.forEach((key) => {
        const group = groupedInvoices[key];
        const dates = group.dates.join(", ");
        doc.text(
          `${group.count} X $${group.amount.toFixed(
            2
          )} = $${group.total.toFixed(2)} ${group.month} ${dates}`,
          { align: "left" }
        );

        doc.moveDown(0.5);
      });

      // Display unique invoices
      uniqueInvoices.forEach((invoice) => {
        doc.text(
          `1 X $${invoice.amount.toFixed(2)} = $${invoice.amount.toFixed(
            2
          )} ${monthLong(invoice.date)} ${new Date(invoice.date).getDate()} ${
            invoice.description
          }`
        );
        doc.moveDown(0.5);
      });

      // Create a string to show each group total amount
      if (groupedKeys.length + uniqueInvoices.length > 1) {
        let totalString = "";
        groupedKeys.forEach((key, index) => {
          const group = groupedInvoices[key];
          if (index > 0) {
            totalString += " + ";
          }
          totalString += `$${group.total.toFixed(2)}`;
        });

        uniqueInvoices.forEach((invoice, index) => {
          if (groupedKeys.length > 0 || index > 0) {
            totalString += " + ";
          }
          totalString += `$${invoice.amount.toFixed(2)}`;
        });

        // Display grand total amount
        doc.text(`${totalString} = $${statement.totalAmount.toFixed(2)}`, {
          align: "left",
        });
        doc.moveDown();
      }
    }

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
