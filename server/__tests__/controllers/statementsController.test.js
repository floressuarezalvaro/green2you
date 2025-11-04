const mongoose = require("mongoose");
const moment = require("moment-timezone");

const Balance = require("../../models/balanceModel");
const Client = require("../../models/clientModel");
const Invoice = require("../../models/invoiceModel");
const Payment = require("../../models/paymentModel");
const Statement = require("../../models/statementModel");

const statementsController = require("../../controllers/statementsController");

jest.mock("../../models/clientModel");
jest.mock("../../models/paymentModel");
jest.mock("../../models/statementModel");
jest.mock("moment-timezone");

describe("Statements Controller", () => {
  let req, res;
  const errorMessage = "System could not process";
  const validId = new mongoose.Types.ObjectId().toString();
  const validClientId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Invoice and Balance methods (real models, not mocked modules)
    Invoice.find = jest.fn();
    Balance.findOne = jest.fn();
    Balance.updateOne = jest.fn();

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

  describe("Create Statement", () => {
    test("Successfully creates a statement", async () => {
      req.body = {
        clientId: validClientId,
        issuedStartDate: "2025-01-01",
        issuedEndDate: "2025-01-31",
        creationMethod: "manual",
      };

      const mockStartDate = new Date("2025-01-01T00:00:00.000Z");
      const mockEndDate = new Date("2025-01-31T23:59:59.999Z");

      const mockStartMoment = {
        set: jest.fn().mockReturnThis(),
        toDate: jest.fn().mockReturnValue(mockStartDate),
      };

      const mockEndMoment = {
        set: jest.fn().mockReturnThis(),
        toDate: jest.fn().mockReturnValue(mockEndDate),
      };

      moment.tz
        .mockReturnValueOnce(mockStartMoment)
        .mockReturnValueOnce(mockEndMoment);

      const mockClient = {
        _id: validClientId,
        clientPlan: "monthly",
        user_id: validId,
      };

      const mockInvoices = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          date: new Date("2025-01-15"),
          amount: 100,
          description: "Invoice 1",
          clientId: validClientId,
          user_id: validId,
        },
        {
          _id: new mongoose.Types.ObjectId().toString(),
          date: new Date("2025-01-20"),
          amount: 150,
          description: "Invoice 2",
          clientId: validClientId,
          user_id: validId,
        },
      ];

      const mockBalance = {
        _id: validClientId,
        currentBalance: 500,
      };

      const mockHistoricalStatements = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          issuedStartDate: new Date("2024-12-01"),
          issuedEndDate: new Date("2024-12-31"),
          totalAmount: 200,
          paidAmount: 200,
          checkNumber: "1234",
          checkDate: new Date("2025-01-05"),
        },
      ];

      const mockStatement = {
        _id: validId,
        clientId: validClientId,
        invoiceData: mockInvoices,
        historicalStatementsData: mockHistoricalStatements,
        balanceData: mockBalance,
        totalAmount: 250,
        issuedStartDate: mockStartMoment,
        issuedEndDate: mockEndMoment,
        creationMethod: "manual",
        clientPlan: "monthly",
        user_id: validId,
        isPaid: false,
        paidAmount: 0,
        checkNumber: 0,
        checkDate: 0,
      };

      Client.findById.mockResolvedValue(mockClient);
      const mockSort = jest.fn().mockResolvedValue(null);
      Statement.findOne.mockReturnValue({ sort: mockSort });
      Balance.findOne.mockResolvedValue(mockBalance);
      Invoice.find.mockResolvedValue(mockInvoices);
      Statement.find.mockResolvedValue(mockHistoricalStatements);
      Statement.create.mockResolvedValue(mockStatement);

      await statementsController.createStatement(req, res);

      expect(Client.findById).toHaveBeenCalledWith(validClientId);
      expect(Statement.findOne).toHaveBeenCalledWith({
        clientId: validClientId,
      });
      expect(Balance.findOne).toHaveBeenCalled();
      expect(Invoice.find).toHaveBeenCalled();
      expect(Statement.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockStatement);
    });

    test("Returns 400 when clientId is missing", async () => {
      req.body = {
        issuedStartDate: "2025-01-01",
        issuedEndDate: "2025-01-31",
        creationMethod: "manual",
      };

      await statementsController.createStatement(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: ["clientName"],
      });
    });

    test("Returns 400 when all required fields are missing", async () => {
      req.body = {};

      await statementsController.createStatement(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: [
          "clientName",
          "issuedStartDate",
          "issuedEndDate",
          "creationMethod",
        ],
      });
    });

    test("Returns 400 when clientId is invalid", async () => {
      req.body = {
        clientId: "invalid-id",
        issuedStartDate: "2025-01-01",
        issuedEndDate: "2025-01-31",
        creationMethod: "manual",
      };

      await statementsController.createStatement(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid client id",
      });
    });

    test("Returns 404 when client is not found", async () => {
      req.body = {
        clientId: validClientId,
        issuedStartDate: "2025-01-01",
        issuedEndDate: "2025-01-31",
        creationMethod: "manual",
      };

      Client.findById.mockResolvedValue(null);

      await statementsController.createStatement(req, res);

      expect(Client.findById).toHaveBeenCalledWith(validClientId);
      expect(Statement.findOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Client not found",
      });
    });

    test("Returns 400 when client has unpaid statement", async () => {
      req.body = {
        clientId: validClientId,
        issuedStartDate: "2025-01-01",
        issuedEndDate: "2025-01-31",
        creationMethod: "manual",
      };

      const mockClient = {
        _id: validClientId,
        clientPlan: "monthly",
        user_id: validId,
      };

      const mockUnpaidStatement = {
        _id: validId,
        clientId: validClientId,
        isPaid: false,
      };

      Client.findById.mockResolvedValue(mockClient);
      const mockSort = jest.fn().mockResolvedValue(mockUnpaidStatement);
      Statement.findOne.mockReturnValue({ sort: mockSort });

      await statementsController.createStatement(req, res);

      expect(Statement.findOne).toHaveBeenCalledWith({
        clientId: validClientId,
      });
      expect(Balance.findOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "There is an unpaid statement for this client. This statement was not created.",
      });
    });

    test("Returns 404 when balance is not found", async () => {
      req.body = {
        clientId: validClientId,
        issuedStartDate: "2025-01-01",
        issuedEndDate: "2025-01-31",
        creationMethod: "manual",
      };

      const mockClient = {
        _id: validClientId,
        clientPlan: "monthly",
        user_id: validId,
      };

      Client.findById.mockResolvedValue(mockClient);
      const mockSort = jest.fn().mockResolvedValue(null);
      Statement.findOne.mockReturnValue({ sort: mockSort });
      Balance.findOne.mockResolvedValue(null);

      await statementsController.createStatement(req, res);

      expect(Balance.findOne).toHaveBeenCalledWith({ _id: validClientId });
      expect(Invoice.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Balance not found",
      });
    });

    test("Returns 500 when statement creation fails", async () => {
      req.body = {
        clientId: validClientId,
        issuedStartDate: "2025-01-01",
        issuedEndDate: "2025-01-31",
        creationMethod: "manual",
      };

      const mockStartDate = new Date("2025-01-01T00:00:00.000Z");
      const mockEndDate = new Date("2025-01-31T23:59:59.999Z");

      const mockStartMoment = {
        set: jest.fn().mockReturnThis(),
        toDate: jest.fn().mockReturnValue(mockStartDate),
      };

      const mockEndMoment = {
        set: jest.fn().mockReturnThis(),
        toDate: jest.fn().mockReturnValue(mockEndDate),
      };

      moment.tz
        .mockReturnValueOnce(mockStartMoment)
        .mockReturnValueOnce(mockEndMoment);

      const mockClient = {
        _id: validClientId,
        clientPlan: "monthly",
        user_id: validId,
      };

      const mockBalance = { _id: validClientId, currentBalance: 500 };

      Client.findById.mockResolvedValue(mockClient);
      const mockSort = jest.fn().mockResolvedValue(null);
      Statement.findOne.mockReturnValue({ sort: mockSort });
      Balance.findOne.mockResolvedValue(mockBalance);
      Invoice.find.mockResolvedValue([]);
      Statement.find.mockResolvedValue([]);
      Statement.create.mockRejectedValue(new Error(errorMessage));

      await statementsController.createStatement(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Get All Statements", () => {
    test("Successfully gets all statements for user", async () => {
      const mockStatements = [
        {
          _id: validId,
          clientId: validClientId,
          totalAmount: 250,
          user_id: validId,
        },
      ];

      const mockSort = jest.fn().mockResolvedValue(mockStatements);
      Statement.find.mockReturnValue({ sort: mockSort });

      await statementsController.getAllStatements(req, res);

      expect(Statement.find).toHaveBeenCalledWith({ user_id: validId });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStatements);
    });

    test("Returns 500 when database query fails", async () => {
      const mockSort = jest.fn().mockRejectedValue(new Error(errorMessage));
      Statement.find.mockReturnValue({ sort: mockSort });

      await statementsController.getAllStatements(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Get All Client Statements", () => {
    test("Successfully gets all statements for a client", async () => {
      req.params.clientId = validClientId;

      const mockStatements = [
        {
          _id: validId,
          clientId: validClientId,
          totalAmount: 250,
        },
      ];

      const mockSort = jest.fn().mockResolvedValue(mockStatements);
      Statement.find.mockReturnValue({ sort: mockSort });

      await statementsController.getAllClientStatements(req, res);

      expect(Statement.find).toHaveBeenCalledWith({ clientId: validClientId });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStatements);
    });

    test("Successfully gets statements filtered by month and year", async () => {
      req.params.clientId = validClientId;
      req.query = {
        month: "1",
        year: "2025",
      };

      const mockStatements = [
        {
          _id: validId,
          clientId: validClientId,
          totalAmount: 250,
        },
      ];

      const mockSort = jest.fn().mockResolvedValue(mockStatements);
      Statement.find.mockReturnValue({ sort: mockSort });

      await statementsController.getAllClientStatements(req, res);

      expect(Statement.find).toHaveBeenCalled();
      const filterArg = Statement.find.mock.calls[0][0];
      expect(filterArg).toHaveProperty("clientId", validClientId);
      expect(filterArg).toHaveProperty("issuedStartDate");
      expect(filterArg).toHaveProperty("issuedEndDate");
      expect(filterArg.issuedStartDate).toHaveProperty("$gte");
      expect(filterArg.issuedEndDate).toHaveProperty("$lte");

      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStatements);
    });

    test("Returns 400 when clientId is invalid", async () => {
      req.params.clientId = "invalid-id";

      await statementsController.getAllClientStatements(req, res);

      expect(Statement.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid client id",
      });
    });

    test("Returns 500 when database query fails", async () => {
      req.params.clientId = validClientId;

      const mockSort = jest.fn().mockRejectedValue(new Error(errorMessage));
      Statement.find.mockReturnValue({ sort: mockSort });

      await statementsController.getAllClientStatements(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Get Statement", () => {
    test("Successfully gets a single statement", async () => {
      req.params.id = validId;

      const mockStatement = {
        _id: validId,
        clientId: validClientId,
        totalAmount: 250,
      };

      Statement.findById.mockResolvedValue(mockStatement);

      await statementsController.getStatement(req, res);

      expect(Statement.findById).toHaveBeenCalledWith(validId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStatement);
    });

    test("Returns 400 when id is invalid", async () => {
      req.params.id = "invalid-id";

      await statementsController.getStatement(req, res);

      expect(Statement.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid id",
      });
    });

    test("Returns 404 when statement is not found", async () => {
      req.params.id = validId;

      Statement.findById.mockResolvedValue(null);

      await statementsController.getStatement(req, res);

      expect(Statement.findById).toHaveBeenCalledWith(validId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No statement found",
      });
    });

    test("Returns 500 when database query fails", async () => {
      req.params.id = validId;

      Statement.findById.mockRejectedValue(new Error(errorMessage));

      await statementsController.getStatement(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Delete Statement", () => {
    test("Successfully deletes a statement with payment and updates balance", async () => {
      req.params.id = validId;

      const mockStatement = {
        _id: validId,
        clientId: validClientId,
        totalAmount: 250,
      };

      const mockPayment = {
        _id: new mongoose.Types.ObjectId().toString(),
        statementId: validId,
        clientId: validClientId,
        amount: 100,
      };

      const mockBalance = {
        _id: validClientId,
        currentBalance: 600,
      };

      Statement.findOneAndDelete.mockResolvedValue(mockStatement);
      Payment.findOneAndDelete.mockResolvedValue(mockPayment);
      Balance.findOne.mockResolvedValue(mockBalance);
      Balance.updateOne.mockResolvedValue({});

      await statementsController.deleteStatement(req, res);

      expect(Statement.findOneAndDelete).toHaveBeenCalledWith({ _id: validId });
      expect(Payment.findOneAndDelete).toHaveBeenCalledWith({
        statementId: validId,
      });
      expect(Balance.findOne).toHaveBeenCalledWith({ _id: validClientId });
      expect(Balance.updateOne).toHaveBeenCalledWith(
        { _id: validClientId },
        { currentBalance: 500 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStatement);
    });

    test("Successfully deletes a statement without payment", async () => {
      req.params.id = validId;

      const mockStatement = {
        _id: validId,
        clientId: validClientId,
        totalAmount: 250,
      };

      Statement.findOneAndDelete.mockResolvedValue(mockStatement);
      Payment.findOneAndDelete.mockResolvedValue(null);

      await statementsController.deleteStatement(req, res);

      expect(Statement.findOneAndDelete).toHaveBeenCalledWith({ _id: validId });
      expect(Payment.findOneAndDelete).toHaveBeenCalledWith({
        statementId: validId,
      });
      expect(Balance.findOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStatement);
    });

    test("Returns 400 when id is invalid", async () => {
      req.params.id = "invalid-id";

      await statementsController.deleteStatement(req, res);

      expect(Statement.findOneAndDelete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid id",
      });
    });

    test("Returns 404 when statement is not found", async () => {
      req.params.id = validId;

      Statement.findOneAndDelete.mockResolvedValue(null);

      await statementsController.deleteStatement(req, res);

      expect(Statement.findOneAndDelete).toHaveBeenCalledWith({ _id: validId });
      expect(Payment.findOneAndDelete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No statement found",
      });
    });

    test("Returns 500 when deletion fails", async () => {
      req.params.id = validId;

      Statement.findOneAndDelete.mockRejectedValue(new Error(errorMessage));

      await statementsController.deleteStatement(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Update Statement", () => {
    test("Successfully updates a statement", async () => {
      req.params.id = validId;
      req.body = {
        user_id: validClientId,
      };

      const mockStatement = {
        _id: validId,
        user_id: validClientId,
      };

      Statement.findOneAndUpdate.mockResolvedValue(mockStatement);

      await statementsController.updateStatement(req, res);

      expect(Statement.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validId },
        { $set: { user_id: validClientId } },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStatement);
    });

    test("Returns 400 when id is invalid", async () => {
      req.params.id = "invalid-id";
      req.body = {
        user_id: validClientId,
      };

      await statementsController.updateStatement(req, res);

      expect(Statement.findOneAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid id",
      });
    });

    test("Returns 404 when statement is not found", async () => {
      req.params.id = validId;
      req.body = {
        user_id: validClientId,
      };

      Statement.findOneAndUpdate.mockResolvedValue(null);

      await statementsController.updateStatement(req, res);

      expect(Statement.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No statement found",
      });
    });

    test("Returns 500 when update fails", async () => {
      req.params.id = validId;
      req.body = {
        user_id: validClientId,
      };

      Statement.findOneAndUpdate.mockRejectedValue(new Error(errorMessage));

      await statementsController.updateStatement(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });
});
