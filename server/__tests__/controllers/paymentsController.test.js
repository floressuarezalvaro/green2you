const mongoose = require("mongoose");
const moment = require("moment-timezone");

const Balance = require("../../models/balanceModel");
const Client = require("../../models/clientModel");
const Payment = require("../../models/paymentModel");
const Statement = require("../../models/statementModel");

const paymentsController = require("../../controllers/paymentsController");

jest.mock("../../models/clientModel");
jest.mock("../../models/paymentModel");
jest.mock("moment-timezone");

describe("Payments Controller", () => {
  let req, res;
  const errorMessage = "System could not process";
  const validId = new mongoose.Types.ObjectId().toString();
  const validClientId = new mongoose.Types.ObjectId().toString();
  const validStatementId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    Balance.findOne = jest.fn();
    Balance.updateOne = jest.fn();
    Statement.findById = jest.fn();
    Statement.findOneAndUpdate = jest.fn();
    Statement.updateOne = jest.fn();

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

  describe("Make Payment", () => {
    test("Successfully creates a credit payment", async () => {
      req.body = {
        clientId: validClientId,
        statementId: validStatementId,
        type: "credit",
        amount: 100,
        checkDate: "2025-01-15",
        checkNumber: "1234",
      };

      const mockDateTime = new Date("2025-01-15T12:00:00.000Z");
      const mockMoment = {
        set: jest.fn().mockReturnThis(),
        toDate: jest.fn().mockReturnValue(mockDateTime),
      };
      moment.tz = jest.fn().mockReturnValue(mockMoment);

      const mockClient = {
        _id: validClientId,
        clientName: "Test Client",
      };

      const mockStatement = {
        _id: validStatementId,
      };

      const mockBalance = {
        _id: validClientId,
        currentBalance: 500,
      };

      const mockPayment = {
        _id: validId,
        clientId: validClientId,
        statementId: validStatementId,
        type: "credit",
        amount: 100,
        checkDate: mockMoment,
        checkNumber: "1234",
        user_id: validId,
      };

      Client.findById.mockResolvedValue(mockClient);
      Statement.findById.mockResolvedValue(mockStatement);
      Balance.findOne.mockResolvedValue(mockBalance);
      Payment.create.mockResolvedValue(mockPayment);
      Balance.updateOne.mockResolvedValue({});
      Statement.updateOne.mockResolvedValue({});

      await paymentsController.makePayment(req, res);

      expect(Client.findById).toHaveBeenCalledWith(validClientId);
      expect(Statement.findById).toHaveBeenCalledWith(validStatementId);
      expect(Balance.findOne).toHaveBeenCalledWith({ _id: validClientId });
      expect(Payment.create).toHaveBeenCalledWith({
        clientId: validClientId,
        statementId: validStatementId,
        type: "credit",
        amount: 100,
        checkDate: mockMoment,
        checkNumber: "1234",
        user_id: validId,
      });
      expect(Balance.updateOne).toHaveBeenCalledWith(
        { _id: validClientId },
        { currentBalance: 600 }
      );
      expect(Statement.updateOne).toHaveBeenCalledWith(
        { _id: validStatementId },
        {
          isPaid: true,
          paidAmount: 100,
          checkDate: "2025-01-15",
          checkNumber: "1234",
        }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPayment);
    });

    test("Successfully creates a debit payment", async () => {
      req.body = {
        clientId: validClientId,
        statementId: validStatementId,
        type: "debit",
        amount: 50,
        checkDate: "2025-01-15",
        checkNumber: "5678",
      };

      const mockDateTime = new Date("2025-01-15T12:00:00.000Z");
      const mockMoment = {
        set: jest.fn().mockReturnThis(),
        toDate: jest.fn().mockReturnValue(mockDateTime),
      };
      moment.tz = jest.fn().mockReturnValue(mockMoment);

      const mockClient = { _id: validClientId };
      const mockStatement = { _id: validStatementId };
      const mockBalance = { _id: validClientId, currentBalance: 500 };
      const mockPayment = {
        _id: validId,
        clientId: validClientId,
        statementId: validStatementId,
        type: "debit",
        amount: 50,
        checkDate: mockMoment,
        checkNumber: "5678",
        user_id: validId,
      };

      Client.findById.mockResolvedValue(mockClient);
      Statement.findById.mockResolvedValue(mockStatement);
      Balance.findOne.mockResolvedValue(mockBalance);
      Payment.create.mockResolvedValue(mockPayment);
      Balance.updateOne.mockResolvedValue({});

      await paymentsController.makePayment(req, res);

      expect(Balance.updateOne).toHaveBeenCalledWith(
        { _id: validClientId },
        { currentBalance: 450 }
      );
      expect(Statement.updateOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPayment);
    });

    test("Returns 400 when clientId is missing", async () => {
      req.body = {
        statementId: validStatementId,
        type: "credit",
        amount: 100,
        checkDate: "2025-01-15",
        checkNumber: "1234",
      };

      await paymentsController.makePayment(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: ["clientName"],
      });
    });

    test("Returns 400 when all required fields are missing", async () => {
      req.body = {};

      await paymentsController.makePayment(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: [
          "clientName",
          "statementId",
          "type",
          "amount",
          "checkDate",
          "checkNumber",
        ],
      });
    });

    test("Returns 400 when clientId is invalid", async () => {
      req.body = {
        clientId: "invalid-id",
        statementId: validStatementId,
        type: "credit",
        amount: 100,
        checkDate: "2025-01-15",
        checkNumber: "1234",
      };

      await paymentsController.makePayment(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid client id",
      });
    });

    test("Returns 400 when statementId is invalid", async () => {
      req.body = {
        clientId: validClientId,
        statementId: "invalid-id",
        type: "credit",
        amount: 100,
        checkDate: "2025-01-15",
        checkNumber: "1234",
      };

      await paymentsController.makePayment(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid statement id",
      });
    });

    test("Returns 404 when client is not found", async () => {
      req.body = {
        clientId: validClientId,
        statementId: validStatementId,
        type: "credit",
        amount: 100,
        checkDate: "2025-01-15",
        checkNumber: "1234",
      };

      const mockDateTime = new Date("2025-01-15T12:00:00.000Z");
      const mockMoment = {
        set: jest.fn().mockReturnThis(),
        toDate: jest.fn().mockReturnValue(mockDateTime),
      };
      moment.tz = jest.fn().mockReturnValue(mockMoment);

      Client.findById.mockResolvedValue(null);

      await paymentsController.makePayment(req, res);

      expect(Client.findById).toHaveBeenCalledWith(validClientId);
      expect(Statement.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Client not found",
      });
    });

    test("Returns 404 when statement is not found", async () => {
      req.body = {
        clientId: validClientId,
        statementId: validStatementId,
        type: "credit",
        amount: 100,
        checkDate: "2025-01-15",
        checkNumber: "1234",
      };

      const mockDateTime = new Date("2025-01-15T12:00:00.000Z");
      const mockMoment = {
        set: jest.fn().mockReturnThis(),
        toDate: jest.fn().mockReturnValue(mockDateTime),
      };
      moment.tz = jest.fn().mockReturnValue(mockMoment);

      const mockClient = { _id: validClientId };

      Client.findById.mockResolvedValue(mockClient);
      Statement.findById.mockResolvedValue(null);

      await paymentsController.makePayment(req, res);

      expect(Client.findById).toHaveBeenCalledWith(validClientId);
      expect(Statement.findById).toHaveBeenCalledWith(validStatementId);
      expect(Balance.findOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Statement not found",
      });
    });

    test("Returns 404 when balance is not found", async () => {
      req.body = {
        clientId: validClientId,
        statementId: validStatementId,
        type: "credit",
        amount: 100,
        checkDate: "2025-01-15",
        checkNumber: "1234",
      };

      const mockDateTime = new Date("2025-01-15T12:00:00.000Z");
      const mockMoment = {
        set: jest.fn().mockReturnThis(),
        toDate: jest.fn().mockReturnValue(mockDateTime),
      };
      moment.tz = jest.fn().mockReturnValue(mockMoment);

      const mockClient = { _id: validClientId };
      const mockStatement = { _id: validStatementId };

      Client.findById.mockResolvedValue(mockClient);
      Statement.findById.mockResolvedValue(mockStatement);
      Balance.findOne.mockResolvedValue(null);

      await paymentsController.makePayment(req, res);

      expect(Balance.findOne).toHaveBeenCalledWith({ _id: validClientId });
      expect(Payment.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No balance found for the given client id",
      });
    });

    test("Returns 500 when payment creation fails", async () => {
      req.body = {
        clientId: validClientId,
        statementId: validStatementId,
        type: "credit",
        amount: 100,
        checkDate: "2025-01-15",
        checkNumber: "1234",
      };

      const mockDateTime = new Date("2025-01-15T12:00:00.000Z");
      const mockMoment = {
        set: jest.fn().mockReturnThis(),
        toDate: jest.fn().mockReturnValue(mockDateTime),
      };
      moment.tz = jest.fn().mockReturnValue(mockMoment);

      const mockClient = { _id: validClientId };
      const mockStatement = { _id: validStatementId };
      const mockBalance = { _id: validClientId, currentBalance: 500 };

      Client.findById.mockResolvedValue(mockClient);
      Statement.findById.mockResolvedValue(mockStatement);
      Balance.findOne.mockResolvedValue(mockBalance);
      Payment.create.mockRejectedValue(new Error(errorMessage));

      await paymentsController.makePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Get All Payments", () => {
    test("Successfully gets all payments for user", async () => {
      const mockPayments = [
        {
          _id: validId,
          clientId: validClientId,
          amount: 100,
          type: "credit",
          user_id: validId,
        },
      ];

      const mockSort = jest.fn().mockResolvedValue(mockPayments);
      Payment.find.mockReturnValue({ sort: mockSort });

      await paymentsController.getAllPayments(req, res);

      expect(Payment.find).toHaveBeenCalledWith({ user_id: validId });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPayments);
    });

    test("Returns 404 when user_id is invalid", async () => {
      req.user._id = "invalid-id";

      await paymentsController.getAllPayments(req, res);

      expect(Payment.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid client id",
      });
    });

    test("Returns 500 when database query fails", async () => {
      const mockSort = jest.fn().mockRejectedValue(new Error(errorMessage));
      Payment.find.mockReturnValue({ sort: mockSort });

      await paymentsController.getAllPayments(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Get Payments By Client", () => {
    test("Successfully gets payments for a client", async () => {
      req.params.clientId = validClientId;

      const mockClient = { _id: validClientId };
      const mockPayments = [
        {
          _id: validId,
          clientId: validClientId,
          amount: 100,
          type: "credit",
        },
      ];

      Client.findById.mockResolvedValue(mockClient);
      const mockSort = jest.fn().mockResolvedValue(mockPayments);
      Payment.find.mockReturnValue({ sort: mockSort });

      await paymentsController.getPaymentsByClient(req, res);

      expect(Client.findById).toHaveBeenCalledWith(validClientId);
      expect(Payment.find).toHaveBeenCalledWith({ clientId: validClientId });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPayments);
    });

    test("Returns 400 when clientId is invalid", async () => {
      req.params.clientId = "invalid-id";

      await paymentsController.getPaymentsByClient(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid client id",
      });
    });

    test("Returns 404 when client is not found", async () => {
      req.params.clientId = validClientId;

      Client.findById.mockResolvedValue(null);

      await paymentsController.getPaymentsByClient(req, res);

      expect(Client.findById).toHaveBeenCalledWith(validClientId);
      expect(Payment.find).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Client not found",
      });
    });

    test("Returns 500 when database query fails", async () => {
      req.params.clientId = validClientId;

      const mockClient = { _id: validClientId };
      Client.findById.mockResolvedValue(mockClient);

      const mockSort = jest.fn().mockRejectedValue(new Error(errorMessage));
      Payment.find.mockReturnValue({ sort: mockSort });

      await paymentsController.getPaymentsByClient(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Get Payment By Id", () => {
    test("Successfully gets a payment by id", async () => {
      req.params.id = validId;

      const mockPayment = {
        _id: validId,
        clientId: validClientId,
        amount: 100,
        type: "credit",
      };

      Payment.findById.mockResolvedValue(mockPayment);

      await paymentsController.getPaymentsById(req, res);

      expect(Payment.findById).toHaveBeenCalledWith(validId);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPayment);
    });

    test("Returns 400 when id is invalid", async () => {
      req.params.id = "invalid-id";

      await paymentsController.getPaymentsById(req, res);

      expect(Payment.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid client id",
      });
    });

    test("Returns 404 when payment is not found", async () => {
      req.params.id = validId;

      Payment.findById.mockResolvedValue(null);

      await paymentsController.getPaymentsById(req, res);

      expect(Payment.findById).toHaveBeenCalledWith(validId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Payment not found",
      });
    });

    test("Returns 500 when database query fails", async () => {
      req.params.id = validId;

      Payment.findById.mockRejectedValue(new Error(errorMessage));

      await paymentsController.getPaymentsById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Update Payment", () => {
    test("Successfully updates a payment", async () => {
      req.params.id = validId;
      req.body = {
        amount: 200,
        checkDate: "2025-02-15",
        checkNumber: "9999",
      };

      const mockDateTime = new Date("2025-02-15T12:00:00.000Z");
      const mockMoment = {
        set: jest.fn().mockReturnThis(),
        toDate: jest.fn().mockReturnValue(mockDateTime),
      };
      moment.tz = jest.fn().mockReturnValue(mockMoment);

      const mockPayment = {
        _id: validId,
        statementId: validStatementId,
        amount: 200,
        checkDate: mockMoment,
        checkNumber: "9999",
      };

      const mockStatement = { _id: validStatementId };

      Payment.findOneAndUpdate.mockResolvedValue(mockPayment);
      Statement.findOneAndUpdate.mockResolvedValue(mockStatement);

      await paymentsController.updatePayment(req, res);

      expect(Payment.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validId },
        {
          amount: 200,
          checkDate: mockMoment,
          checkNumber: "9999",
        },
        { new: true, runValidators: true }
      );
      expect(Statement.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validStatementId },
        {
          paidAmount: 200,
          checkDate: mockMoment,
          checkNumber: "9999",
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPayment);
    });

    test("Returns 400 when id is invalid", async () => {
      req.params.id = "invalid-id";
      req.body = { amount: 200 };

      await paymentsController.updatePayment(req, res);

      expect(Payment.findOneAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid client id",
      });
    });

    test("Returns 404 when payment is not found", async () => {
      req.params.id = validId;
      req.body = { amount: 200 };

      Payment.findOneAndUpdate.mockResolvedValue(null);

      await paymentsController.updatePayment(req, res);

      expect(Payment.findOneAndUpdate).toHaveBeenCalled();
      expect(Statement.findOneAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Payment not found",
      });
    });

    test("Returns 404 when statement is not found", async () => {
      req.params.id = validId;
      req.body = { amount: 200 };

      const mockPayment = {
        _id: validId,
        statementId: validStatementId,
        amount: 200,
      };

      Payment.findOneAndUpdate.mockResolvedValue(mockPayment);
      Statement.findOneAndUpdate.mockResolvedValue(null);

      await paymentsController.updatePayment(req, res);

      expect(Statement.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Statement not found",
      });
    });

    test("Returns 500 when update fails", async () => {
      req.params.id = validId;
      req.body = { amount: 200 };

      Payment.findOneAndUpdate.mockRejectedValue(new Error(errorMessage));

      await paymentsController.updatePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Delete Payment", () => {
    test("Successfully deletes a credit payment and reverses balance", async () => {
      req.params.id = validId;

      const mockPayment = {
        _id: validId,
        clientId: validClientId,
        statementId: validStatementId,
        type: "credit",
        amount: 100,
      };

      const mockBalance = {
        _id: validClientId,
        currentBalance: 600,
      };

      const mockStatement = { _id: validStatementId };

      Payment.findByIdAndDelete.mockResolvedValue(mockPayment);
      Balance.findOne.mockResolvedValue(mockBalance);
      Balance.updateOne.mockResolvedValue({});
      Statement.findOneAndUpdate.mockResolvedValue(mockStatement);

      await paymentsController.deletePayment(req, res);

      expect(Payment.findByIdAndDelete).toHaveBeenCalledWith(validId);
      expect(Balance.findOne).toHaveBeenCalledWith({ _id: validClientId });
      expect(Balance.updateOne).toHaveBeenCalledWith(
        { _id: validClientId },
        { currentBalance: 500 }
      );
      expect(Statement.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validStatementId },
        {
          isPaid: false,
          paidAmount: 0,
          checkDate: null,
          checkNumber: null,
        }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPayment);
    });

    test("Successfully deletes a debit payment and reverses balance", async () => {
      req.params.id = validId;

      const mockPayment = {
        _id: validId,
        clientId: validClientId,
        statementId: validStatementId,
        type: "debit",
        amount: 50,
      };

      const mockBalance = {
        _id: validClientId,
        currentBalance: 450,
      };

      const mockStatement = { _id: validStatementId };

      Payment.findByIdAndDelete.mockResolvedValue(mockPayment);
      Balance.findOne.mockResolvedValue(mockBalance);
      Balance.updateOne.mockResolvedValue({});
      Statement.findOneAndUpdate.mockResolvedValue(mockStatement);

      await paymentsController.deletePayment(req, res);

      expect(Balance.updateOne).toHaveBeenCalledWith(
        { _id: validClientId },
        { currentBalance: 400 }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPayment);
    });

    test("Returns 400 when id is invalid", async () => {
      req.params.id = "invalid-id";

      await paymentsController.deletePayment(req, res);

      expect(Payment.findByIdAndDelete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid client id",
      });
    });

    test("Returns 404 when payment is not found", async () => {
      req.params.id = validId;

      Payment.findByIdAndDelete.mockResolvedValue(null);

      await paymentsController.deletePayment(req, res);

      expect(Payment.findByIdAndDelete).toHaveBeenCalledWith(validId);
      expect(Balance.findOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Payment not found",
      });
    });

    test("Returns 404 when clientId is missing from payment", async () => {
      req.params.id = validId;

      const mockPayment = {
        _id: validId,
        clientId: null,
        statementId: validStatementId,
        type: "credit",
        amount: 100,
      };

      Payment.findByIdAndDelete.mockResolvedValue(mockPayment);

      await paymentsController.deletePayment(req, res);

      expect(Balance.findOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Payment not found",
      });
    });

    test("Returns 404 when statement is not found", async () => {
      req.params.id = validId;

      const mockPayment = {
        _id: validId,
        clientId: validClientId,
        statementId: validStatementId,
        type: "credit",
        amount: 100,
      };

      const mockBalance = {
        _id: validClientId,
        currentBalance: 600,
      };

      Payment.findByIdAndDelete.mockResolvedValue(mockPayment);
      Balance.findOne.mockResolvedValue(mockBalance);
      Balance.updateOne.mockResolvedValue({});
      Statement.findOneAndUpdate.mockResolvedValue(null);

      await paymentsController.deletePayment(req, res);

      expect(Statement.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Statement not found",
      });
    });

    test("Returns 500 when deletion fails", async () => {
      req.params.id = validId;

      Payment.findByIdAndDelete.mockRejectedValue(new Error(errorMessage));

      await paymentsController.deletePayment(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });
});
