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

    const monthLong = (date) => {
      return new Date(date).toLocaleDateString("en-US", {
        timeZone: "America/Los_Angeles",
        month: "long",
      });
    };

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

    // layout
    const marginL = doc.page.margins.left;
    const marginR = doc.page.margins.right;
    const docWidth = doc.page.width;

    // Client Contact Information

    doc.text(selectedClient.clientName);
    doc.text(selectedClient.clientStreetLineOne);
    if (selectedClient.clientStreetLineTwo) {
      doc.text(selectedClient.clientStreetLineTwo);
    }
    doc.text(
      `${selectedClient.clientCity}, ${selectedClient.clientState} ${selectedClient.clientZip}`
    );

    const displayCreatedDate = formatDate(statement.createdAt);
    doc.text(`Plan: ${statement.clientPlan}`, marginL);
    doc.text(`${displayCreatedDate}`);

    doc.moveDown(0.75);

    doc
      .moveTo(marginL, doc.y)
      .lineTo(docWidth - marginR, doc.y)
      .stroke();
    doc.moveDown(0.5);

    // Historical billing

    doc.text(`AMOUNT BILLED LAST MONTHS`);

    doc.text("SERVICES", marginL, doc.y);
    doc.moveUp();
    doc.text("AMOUNT BILLED", 250, doc.y);
    doc.moveUp();
    doc.text("AMOUNT PAID", 345, doc.y);
    doc.moveUp();
    doc.text("DATE", 455, doc.y);
    doc.moveUp();
    doc.text("CHECK", {
      align: "right",
    });
    doc.moveDown(0.1);

    // line
    doc
      .moveTo(marginL, doc.y)
      .lineTo(docWidth - marginR, doc.y)
      .stroke();

    doc.moveDown(0.5);

    // Historical Statement Data

    if (statement.historicalStatementsData.length > 0) {
      statement.historicalStatementsData.forEach((statement) => {
        const checkDateFormatted = new Date(
          statement.checkDate
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        doc.text(
          `${monthLong(statement.issuedEndDate)} Statement`,
          marginL,
          doc.y
        );
        doc.moveUp();
        doc.text(`$${statement.totalAmount}`, 285, doc.y);
        doc.moveUp();
        doc.text(`$${statement.paidAmount}`, 375, doc.y);
        doc.moveUp();
        doc.text(`${checkDateFormatted}`, 440, doc.y);
        doc.moveUp();
        doc.text(`#${statement.checkNumber}`, {
          align: "right",
        });
        doc.moveDown(0.2);
      });
    } else {
      doc.text("No historical statements yet", marginL, doc.y);
      doc.moveDown(0.2);
    }

    doc.moveDown(1.0);

    // line
    doc
      .moveTo(marginL, doc.y)
      .lineTo(docWidth - marginR, doc.y)
      .stroke();

    doc.moveDown(0.5);

    // Current Bill Headings
    // Calculate Amount Due Date
    const createdDate = new Date(statement.createdAt);
    const dueDate = new Date(createdDate);
    dueDate.setDate(createdDate.getDate() + 15);
    const dueMonth = String(dueDate.getMonth() + 1).padStart(2, "0");
    const dueDay = String(dueDate.getDate()).padStart(2, "0");

    const dueMonthDay = `${dueMonth}/${dueDay}`;

    doc.text("BILLING DETAIL", marginL, doc.y);
    doc.moveUp();
    doc.text("Amount Due", 390, doc.y);
    doc.moveUp();
    doc.text("Amount Due", {
      align: "right",
    });

    doc.moveDown(0.2);
    doc.text("SERVICES", marginL, doc.y);
    doc.moveUp();

    doc.text(`By ${dueMonthDay}`, 405, doc.y);

    doc.moveUp();
    doc.text(`After ${dueMonthDay}`, {
      align: "right",
    });
    doc.moveDown(0.1);

    // line
    doc
      .moveTo(marginL, doc.y)
      .lineTo(docWidth - marginR, doc.y)
      .stroke();

    doc.moveDown();

    // Plan Type

    const displayIssuedStartDate = formatDate(statement.issuedStartDate);
    const displayIssuedEndDate = formatDate(statement.issuedEndDate);

    doc.text(
      `Opening/Closing Date: ${displayIssuedStartDate} - ${displayIssuedEndDate}`,
      marginL,
      doc.y
    );
    doc.moveDown(0.5);

    // Invoice Data
    // Group invoices by amount and month
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

    if (selectedClient.clientMonthly === true) {
      statement.invoiceData.forEach((invoice) => {
        if (!invoice.description) {
          doc.text(
            `${monthLong(invoice.date)} Services $${invoice.amount}/Month`,
            marginL
          );
        }
      });
    } else {
      // Display grouped invoices for non-monthly plan
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
    }

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
    if (Object.keys(groupedInvoices).length + uniqueInvoices.length > 1) {
      let totalString = "";
      Object.keys(groupedInvoices).forEach((key, index) => {
        const group = groupedInvoices[key];
        if (index > 0) {
          totalString += " + ";
        }
        totalString += `$${group.total.toFixed(2)}`;
      });

      uniqueInvoices.forEach((invoice, index) => {
        if (Object.keys(groupedInvoices).length > 0 || index > 0) {
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

    // Total Amount Values

    const dueByAmount = `$${statement.totalAmount}`;
    const totalAmountAfter = statement.totalAmount + 5;
    const dueAfterAmount = `$${totalAmountAfter}`;

    doc.text(dueByAmount, 420, doc.y, {
      continued: true,
    });

    if (statement.totalAmount == 0) {
      doc.font(font).text("$0", { align: "right" });
    } else {
      doc.text(dueAfterAmount, { align: "right" });
    }
    doc.moveDown(1);

    doc.text("Comments:", marginL);
    doc.moveDown(1);

    // comment lines
    doc
      .moveTo(marginL, doc.y)
      .lineTo(docWidth - marginR, doc.y)
      .stroke();

    doc.moveDown(1.5);

    doc
      .moveTo(marginL, doc.y)
      .lineTo(docWidth - marginR, doc.y)
      .stroke();
    doc.moveDown(0.5);

    // comment lines end

    doc.text("Mail the payment to my address.", 340, doc.y, {
      continued: true,
      align: "left",
    });
    doc.font(boldFont).text("Thank You.", { align: "right" });

    doc.end();
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  printStatement,
};
