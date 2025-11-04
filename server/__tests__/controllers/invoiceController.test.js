const mongoose = require("mongoose");
const moment = require("moment-timezone");

const Balance = require("../../models/balanceModel");
const Client = require("../../models/clientModel");
const Invoice = require("../../models/invoiceModel");

const invoiceController = require("../../controllers/invoiceController");

jest.mock("../../models/invoiceModel");
jest.mock("../../models/clientModel");
jest.mock("../../models/balanceModel");
jest.mock("moment-timezone");

describe("Invoice Controller", () => {
  let req, res;
  const errorMessage = "System could not process";
  const dateToday = new Date();
  const validId = new mongoose.Types.ObjectId().toString();
  const validClientId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
      query: {},
      user: {
        _id: validId,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("Gets all invoices", () => {
    test("Successfully gets all invoices", async () => {
      const mockInvoices = [
        {
          clientId: validClientId,
          date: dateToday,
          amount: 12,
          userId: validId,
        },
      ];

      const mockSort = jest.fn().mockResolvedValue(mockInvoices);
      Invoice.find.mockReturnValue({ sort: mockSort });

      await invoiceController.getAllInvoices(req, res);

      expect(Invoice.find).toHaveBeenCalledWith({ user_id: validId });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockInvoices);
    });

    test("Successfully gets invoices by client id", async () => {
      req.query.clientId = validClientId;

      const mockInvoices = [
        {
          clientId: validClientId,
          date: dateToday,
          amount: 12,
          userId: validId,
        },
      ];

      const mockSort = jest.fn().mockResolvedValue(mockInvoices);
      Invoice.find.mockReturnValue({ sort: mockSort });

      await invoiceController.getAllInvoices(req, res);

      expect(Invoice.find).toHaveBeenCalledWith({
        user_id: validId,
        clientId: validClientId,
      });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockInvoices);
    });

    test("Successfully gets invoices filtered by date range", async () => {
      req.query = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
      };

      const mockInvoices = [
        {
          clientId: validClientId,
          date: "2025-01-24",
          amount: 12,
          userId: validId,
        },
      ];

      const mockSort = jest.fn().mockResolvedValue(mockInvoices);
      Invoice.find.mockReturnValue({ sort: mockSort });

      await invoiceController.getAllInvoices(req, res);

      expect(Invoice.find).toHaveBeenCalled();

      const filterArg = Invoice.find.mock.calls[0][0];
      expect(filterArg).toHaveProperty("user_id", validId);
      expect(filterArg).toHaveProperty("date");
      expect(filterArg.date).toHaveProperty("$gte");
      expect(filterArg.date).toHaveProperty("$lte");
      expect(filterArg.date.$gte).toBeInstanceOf(Date);
      expect(filterArg.date.$lte).toBeInstanceOf(Date);

      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockInvoices);
    });

    test("Returns 400 when clientId is invalid", async () => {
      req.query.clientId = "invalid-id";

      await invoiceController.getAllInvoices(req, res);

      expect(Invoice.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid client id",
      });
    });

    test("Returns 400 when startDate is invalid", async () => {
      req.query.startDate = "invalid-date";

      await invoiceController.getAllInvoices(req, res);

      expect(Invoice.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid start date",
      });
    });

    test("Returns 400 when endDate is invalid", async () => {
      req.query.endDate = "invalid-date";

      await invoiceController.getAllInvoices(req, res);

      expect(Invoice.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid end date",
      });
    });

    test("Returns 500 when database query fails", async () => {
      const mockSort = jest.fn().mockRejectedValue(new Error(errorMessage));
      Invoice.find.mockReturnValue({ sort: mockSort });

      await invoiceController.getAllInvoices(req, res);

      expect(Invoice.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Get All Client Invoices", () => {
    test("Successfully gets all invoices for a client", async () => {
      req.params.id = validClientId;

      const mockInvoices = [
        {
          _id: validId,
          date: new Date(),
          clientId: validClientId,
          amount: 100,
          description: "Test invoice",
        },
      ];

      const mockSort = jest.fn().mockResolvedValue(mockInvoices);
      Invoice.find.mockReturnValue({ sort: mockSort });

      await invoiceController.getAllClientInvoices(req, res);

      expect(Invoice.find).toHaveBeenCalledWith({ clientId: validClientId });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockInvoices);
    });

    test("Returns 400 when client id is invalid", async () => {
      req.params.id = "invalid-id";

      await invoiceController.getAllClientInvoices(req, res);

      expect(Invoice.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid client id",
      });
    });

    test("Returns 500 when database query fails", async () => {
      req.params.id = validClientId;

      const mockSort = jest.fn().mockRejectedValue(new Error(errorMessage));
      Invoice.find.mockReturnValue({ sort: mockSort });

      await invoiceController.getAllClientInvoices(req, res);

      expect(Invoice.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Get Invoice", () => {
    test("Successfully gets a single invoice", async () => {
      req.params.id = validId;

      const mockInvoice = {
        _id: validId,
        date: new Date(),
        clientId: validClientId,
        amount: 100,
        description: "Test invoice",
      };

      Invoice.findById.mockResolvedValue(mockInvoice);

      await invoiceController.getInvoice(req, res);

      expect(Invoice.findById).toHaveBeenCalledWith(validId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockInvoice);
    });

    test("Returns 400 when id is invalid", async () => {
      req.params.id = "invalid-id";

      await invoiceController.getInvoice(req, res);

      expect(Invoice.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid id",
      });
    });

    test("Returns 404 when invoice is not found", async () => {
      req.params.id = validId;

      Invoice.findById.mockResolvedValue(null);

      await invoiceController.getInvoice(req, res);

      expect(Invoice.findById).toHaveBeenCalledWith(validId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No invoice found",
      });
    });

    test("Returns 500 when database query fails", async () => {
      req.params.id = validId;

      Invoice.findById.mockRejectedValue(new Error(errorMessage));

      await invoiceController.getInvoice(req, res);

      expect(Invoice.findById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Create Invoices", () => {
    test("Successfully creates an invoice", async () => {
      req.body = { amount: 20, clientId: validClientId, date: "2025-01-15" };

      const mockDateTime = new Date("2025-01-15T12:00:00.000Z");
      const mockMoment = {
        set: jest.fn().mockReturnThis(),
        toDate: jest.fn().mockReturnValue(mockDateTime),
      };

      const mockClient = {
        _id: validClientId,
        clientName: "Test Client",
      };

      const mockBalance = {
        _id: validClientId,
        currentBalance: 500,
      };

      const mockInvoice = {
        _id: validId,
        date: mockMoment,
        clientId: validClientId,
        amount: 20,
        user_id: validId,
      };

      moment.tz = jest.fn().mockReturnValue(mockMoment);
      Client.findById.mockResolvedValue(mockClient);
      Balance.findOne.mockResolvedValue(mockBalance);
      Invoice.create.mockResolvedValue(mockInvoice);
      Balance.updateOne.mockResolvedValue({});

      await invoiceController.createInvoice(req, res);

      expect(Client.findById).toHaveBeenCalledWith(validClientId);
      expect(Balance.findOne).toHaveBeenCalledWith({ _id: validClientId });
      expect(Invoice.create).toHaveBeenCalledWith({
        date: mockMoment,
        clientId: validClientId,
        amount: 20,
        user_id: validId,
      });
      expect(Balance.updateOne).toHaveBeenCalledWith(
        { _id: validClientId },
        { currentBalance: 480 }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockInvoice);
    });

    test("Returns 400 when clientId is missing", async () => {
      req.body = {
        date: "2025-01-15",
        amount: 100,
      };

      await invoiceController.createInvoice(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: ["clientName"],
      });
    });

    test("Returns 400 when date is missing", async () => {
      req.body = {
        clientId: validClientId,
        amount: 100,
      };

      await invoiceController.createInvoice(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: ["date"],
      });
    });

    test("Returns 400 when amount is missing", async () => {
      req.body = {
        date: "2025-01-15",
        clientId: validClientId,
      };

      await invoiceController.createInvoice(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: ["amount"],
      });
    });

    test("Returns 400 when all fields are missing", async () => {
      req.body = {};

      await invoiceController.createInvoice(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: ["amount", "clientName", "date"],
      });
    });

    test("Returns 400 when clientId is invalid", async () => {
      req.body = {
        date: "2025-01-15",
        clientId: "invalid-id",
        amount: 100,
      };

      await invoiceController.createInvoice(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid client id",
      });
    });

    test("Returns 404 when client is not found", async () => {
      req.body = {
        date: "2025-01-15",
        clientId: validClientId,
        amount: 100,
      };

      const mockDateTime = new Date("2025-01-15T12:00:00.000Z");
      const mockMoment = {
        set: jest.fn().mockReturnThis(),
        toDate: jest.fn().mockReturnValue(mockDateTime),
      };
      moment.tz = jest.fn().mockReturnValue(mockMoment);

      Client.findById.mockResolvedValue(null);

      await invoiceController.createInvoice(req, res);

      expect(Client.findById).toHaveBeenCalledWith(validClientId);
      expect(Balance.findOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Client not found",
      });
    });

    test("Returns 404 when balance is not found", async () => {
      req.body = {
        date: "2025-01-15",
        clientId: validClientId,
        amount: 100,
      };

      const mockClient = {
        _id: validClientId,
        clientName: "Test Client",
      };

      const mockDateTime = new Date("2025-01-15T12:00:00.000Z");
      const mockMoment = {
        set: jest.fn().mockReturnThis(),
        toDate: jest.fn().mockReturnValue(mockDateTime),
      };
      moment.tz = jest.fn().mockReturnValue(mockMoment);

      Client.findById.mockResolvedValue(mockClient);
      Balance.findOne.mockResolvedValue(null);

      await invoiceController.createInvoice(req, res);

      expect(Client.findById).toHaveBeenCalledWith(validClientId);
      expect(Balance.findOne).toHaveBeenCalledWith({ _id: validClientId });
      expect(Invoice.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No balance found for the given client id",
      });
    });

    test("Returns 500 when invoice creation fails", async () => {
      req.body = {
        date: "2025-01-15",
        clientId: validClientId,
        amount: 100,
      };

      const mockClient = {
        _id: validClientId,
        clientName: "Test Client",
      };

      const mockBalance = {
        _id: validClientId,
        currentBalance: 500,
      };

      const mockDateTime = new Date("2025-01-15T12:00:00.000Z");
      const mockMoment = {
        set: jest.fn().mockReturnThis(),
        toDate: jest.fn().mockReturnValue(mockDateTime),
      };
      moment.tz = jest.fn().mockReturnValue(mockMoment);

      Client.findById.mockResolvedValue(mockClient);
      Balance.findOne.mockResolvedValue(mockBalance);
      Invoice.create.mockRejectedValue(new Error(errorMessage));

      await invoiceController.createInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Delete Invoices", () => {
    test("Deletes invoices successfully", async () => {
      req.params.id = validId;

      const mockInvoice = {
        _id: validId,
        date: new Date(),
        clientId: validClientId,
        amount: 100,
      };

      const mockBalance = {
        _id: validClientId,
        currentBalance: 400,
      };

      Invoice.findOneAndDelete.mockResolvedValue(mockInvoice);
      Balance.findOne.mockResolvedValue(mockBalance);
      Balance.updateOne.mockResolvedValue({});

      await invoiceController.deleteInvoice(req, res);

      expect(Invoice.findOneAndDelete).toHaveBeenCalledWith({ _id: validId });
      expect(Balance.findOne).toHaveBeenCalledWith({ _id: validClientId });
      expect(Balance.updateOne).toHaveBeenCalledWith(
        { _id: validClientId },
        { currentBalance: 500 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockInvoice);
    });

    test("Returns 400 when id is invalid", async () => {
      req.params.id = "invalid-id";

      await invoiceController.deleteInvoice(req, res);

      expect(Invoice.findOneAndDelete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid id",
      });
    });

    test("Returns 404 when invoice is not found", async () => {
      req.params.id = validId;

      Invoice.findOneAndDelete.mockResolvedValue(null);

      await invoiceController.deleteInvoice(req, res);

      expect(Invoice.findOneAndDelete).toHaveBeenCalledWith({ _id: validId });
      expect(Balance.findOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No invoice found",
      });
    });

    test("Returns 404 when balance is not found", async () => {
      req.params.id = validId;

      const mockInvoice = {
        _id: validId,
        clientId: validClientId,
        amount: 100,
      };

      Invoice.findOneAndDelete.mockResolvedValue(mockInvoice);
      Balance.findOne.mockResolvedValue(null);

      await invoiceController.deleteInvoice(req, res);

      expect(Invoice.findOneAndDelete).toHaveBeenCalledWith({ _id: validId });
      expect(Balance.findOne).toHaveBeenCalledWith({ _id: validClientId });
      expect(Balance.updateOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No balance found for the given client id",
      });
    });

    test("Returns 500 when deletion fails", async () => {
      req.params.id = validId;

      Invoice.findOneAndDelete.mockRejectedValue(new Error(errorMessage));

      await invoiceController.deleteInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Update Invoices", () => {
    test("Successfully updates invoices", async () => {
      req.params.id = validId;
      req.body = {
        date: "2025-01-15",
        description: "Testing",
      };

      const mockDateTime = new Date("2025-01-15T12:00:00.000Z");
      const mockMoment = {
        set: jest.fn().mockReturnThis(),
        toDate: jest.fn().mockReturnValue(mockDateTime),
      };
      moment.tz = jest.fn().mockReturnValue(mockMoment);

      const mockUpdatedInvoice = {
        _id: validId,
        date: mockMoment,
        clientId: validClientId,
        amount: 100,
        description: "Testing",
      };

      Invoice.findOneAndUpdate.mockResolvedValue(mockUpdatedInvoice);

      await invoiceController.updateInvoice(req, res);

      expect(Invoice.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validId },
        { date: mockMoment, description: "Testing" },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedInvoice);
    });

    test("Returns 400 when id is invalid", async () => {
      req.params.id = "invalid-id";

      await invoiceController.updateInvoice(req, res);

      expect(Invoice.findOneAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid id",
      });
    });

    test("Returns 404 when invoice is not found", async () => {
      req.params.id = validId;
      req.body = {
        amount: 200,
      };

      Invoice.findOneAndUpdate.mockResolvedValue(null);

      await invoiceController.updateInvoice(req, res);

      expect(Invoice.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No invoice found",
      });
    });

    test("Returns 500 when update fails", async () => {
      req.params.id = validId;
      req.body = {
        amount: 200,
      };

      Invoice.findOneAndUpdate.mockRejectedValue(new Error(errorMessage));

      await invoiceController.updateInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });
});
