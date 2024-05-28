// Get all clients
const printedInvoices = async (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "You are hitting the Printed Invoices Endpoint " });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  printedInvoices,
};
