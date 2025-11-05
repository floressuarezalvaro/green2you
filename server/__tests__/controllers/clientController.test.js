const mongoose = require("mongoose");

const Balance = require("../../models/balanceModel");
const Client = require("../../models/clientModel");
const Invoice = require("../../models/invoiceModel");
const Payment = require("../../models/paymentModel");
const Statement = require("../../models/statementModel");
const User = require("../../models/userModel");

const clientController = require("../../controllers/clientController");

jest.mock("../../models/clientModel");
jest.mock("../../models/paymentModel");
jest.mock("../../models/statementModel");
jest.mock("../../models/userModel");

describe("Client Controller", () => {
  let req, res;
  const errorMessage = "System could not process";
  const validId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    Invoice.deleteMany = jest.fn();
    Balance.deleteMany = jest.fn();
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

  describe("Get All Clients", () => {
    test("Successfully gets all clients for user", async () => {
      const mockClients = [
        {
          _id: validId,
          clientName: "Test Client 1",
          clientEmail: "test1@example.com",
          user_id: validId,
        },
        {
          _id: new mongoose.Types.ObjectId().toString(),
          clientName: "Test Client 2",
          clientEmail: "test2@example.com",
          user_id: validId,
        },
      ];

      const mockSort = jest.fn().mockResolvedValue(mockClients);
      Client.find.mockReturnValue({ sort: mockSort });

      await clientController.getAllClients(req, res);

      expect(Client.find).toHaveBeenCalledWith({ user_id: validId });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockClients);
    });

    test("Returns 500 when database query fails", async () => {
      const mockSort = jest.fn().mockRejectedValue(new Error(errorMessage));
      Client.find.mockReturnValue({ sort: mockSort });

      await clientController.getAllClients(req, res);

      expect(Client.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Get Client", () => {
    test("Successfully gets a single client", async () => {
      req.params.id = validId;

      const mockClient = {
        _id: validId,
        clientName: "Test Client",
        clientEmail: "test@example.com",
      };

      Client.findById.mockResolvedValue(mockClient);

      await clientController.getClient(req, res);

      expect(Client.findById).toHaveBeenCalledWith(validId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockClient);
    });

    test("Returns 400 when id is invalid", async () => {
      req.params.id = "invalid-id";

      await clientController.getClient(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid id",
      });
    });

    test("Returns 404 when client is not found", async () => {
      req.params.id = validId;

      Client.findById.mockResolvedValue(null);

      await clientController.getClient(req, res);

      expect(Client.findById).toHaveBeenCalledWith(validId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No client found",
      });
    });

    test("Returns 500 when database query fails", async () => {
      req.params.id = validId;

      Client.findById.mockRejectedValue(new Error(errorMessage));

      await clientController.getClient(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Create Client", () => {
    test("Successfully creates a client", async () => {
      req.body = {
        clientName: "Test Client",
        clientEmail: "test@example.com",
        clientPhoneNumber: "555-1234",
        clientStreetLineOne: "123 Main St",
        clientStreetLineTwo: "Apt 1",
        clientCity: "Los Angeles",
        clientState: "CA",
        clientZip: "90001",
        clientCycleDate: 15,
        clientWelcomeEmailEnabled: true,
        clientAutoCreateStatementsEnabled: true,
        clientAutoEmailStatementsEnabled: true,
        clientStatementCreateDate: 10,
        clientPlan: "monthly",
        clientMonthly: 100,
      };

      const mockClient = {
        _id: validId,
        ...req.body,
        user_id: validId,
      };

      Client.signupClient.mockResolvedValue();
      Client.create.mockResolvedValue(mockClient);
      Client.createClientBalance.mockResolvedValue();

      await clientController.createClient(req, res);

      expect(Client.signupClient).toHaveBeenCalledWith("test@example.com");
      expect(Client.create).toHaveBeenCalledWith({
        clientName: "Test Client",
        clientEmail: "test@example.com",
        clientPhoneNumber: "555-1234",
        clientStreetLineOne: "123 Main St",
        clientStreetLineTwo: "Apt 1",
        clientCity: "Los Angeles",
        clientState: "CA",
        clientZip: "90001",
        clientCycleDate: 15,
        clientWelcomeEmailEnabled: true,
        clientAutoCreateStatementsEnabled: true,
        clientAutoEmailStatementsEnabled: true,
        clientStatementCreateDate: 10,
        clientPlan: "monthly",
        clientMonthly: 100,
        user_id: validId,
      });
      expect(Client.createClientBalance).toHaveBeenCalledWith(validId);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockClient);
    });

    test("Auto-disables email statements when auto-create is disabled", async () => {
      req.body = {
        clientName: "Test Client",
        clientEmail: "test@example.com",
        clientStreetLineOne: "123 Main St",
        clientCity: "Los Angeles",
        clientState: "CA",
        clientZip: "90001",
        clientCycleDate: 15,
        clientAutoCreateStatementsEnabled: false,
        clientAutoEmailStatementsEnabled: true,
        clientStatementCreateDate: 10,
        clientPlan: "monthly",
      };

      const mockClient = {
        _id: validId,
        ...req.body,
        clientAutoEmailStatementsEnabled: false,
        user_id: validId,
      };

      Client.signupClient.mockResolvedValue();
      Client.create.mockResolvedValue(mockClient);
      Client.createClientBalance.mockResolvedValue();

      await clientController.createClient(req, res);

      expect(Client.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clientAutoCreateStatementsEnabled: false,
          clientAutoEmailStatementsEnabled: false,
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("Returns 400 when clientName is missing", async () => {
      req.body = {
        clientEmail: "test@example.com",
        clientStreetLineOne: "123 Main St",
        clientCity: "Los Angeles",
        clientState: "CA",
        clientZip: "90001",
        clientCycleDate: 15,
        clientStatementCreateDate: 10,
        clientPlan: "monthly",
      };

      await clientController.createClient(req, res);

      expect(Client.signupClient).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: ["clientName"],
      });
    });

    test("Returns 400 when clientEmail is missing", async () => {
      req.body = {
        clientName: "Test Client",
        clientStreetLineOne: "123 Main St",
        clientCity: "Los Angeles",
        clientState: "CA",
        clientZip: "90001",
        clientCycleDate: 15,
        clientStatementCreateDate: 10,
        clientPlan: "monthly",
      };

      await clientController.createClient(req, res);

      expect(Client.signupClient).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: ["clientEmail"],
      });
    });

    test("Returns 400 when multiple required fields are missing", async () => {
      req.body = {
        clientName: "Test Client",
      };

      await clientController.createClient(req, res);

      expect(Client.signupClient).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: [
          "clientEmail",
          "clientStreetLineOne",
          "clientCity",
          "clientState",
          "clientZip",
          "clientCycleDate",
          "clientStatementCreateDate",
          "clientPlan",
        ],
      });
    });

    test("Returns 400 when clientCycleDate is less than 1", async () => {
      req.body = {
        clientName: "Test Client",
        clientEmail: "test@example.com",
        clientStreetLineOne: "123 Main St",
        clientCity: "Los Angeles",
        clientState: "CA",
        clientZip: "90001",
        clientCycleDate: 0,
        clientStatementCreateDate: 10,
        clientPlan: "monthly",
      };

      await clientController.createClient(req, res);

      expect(Client.signupClient).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: ["clientCycleDate", "clientCycleDate"],
      });
    });

    test("Returns 400 when clientCycleDate is greater than 31", async () => {
      req.body = {
        clientName: "Test Client",
        clientEmail: "test@example.com",
        clientStreetLineOne: "123 Main St",
        clientCity: "Los Angeles",
        clientState: "CA",
        clientZip: "90001",
        clientCycleDate: 32,
        clientStatementCreateDate: 10,
        clientPlan: "monthly",
      };

      await clientController.createClient(req, res);

      expect(Client.signupClient).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: ["clientCycleDate"],
      });
    });

    test("Returns 400 when clientStatementCreateDate is less than 1", async () => {
      req.body = {
        clientName: "Test Client",
        clientEmail: "test@example.com",
        clientStreetLineOne: "123 Main St",
        clientCity: "Los Angeles",
        clientState: "CA",
        clientZip: "90001",
        clientCycleDate: 15,
        clientStatementCreateDate: 0,
        clientPlan: "monthly",
      };

      await clientController.createClient(req, res);

      expect(Client.signupClient).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: ["clientStatementCreateDate", "clientStatementCreateDate"],
      });
    });

    test("Returns 400 when clientStatementCreateDate is greater than 31", async () => {
      req.body = {
        clientName: "Test Client",
        clientEmail: "test@example.com",
        clientStreetLineOne: "123 Main St",
        clientCity: "Los Angeles",
        clientState: "CA",
        clientZip: "90001",
        clientCycleDate: 15,
        clientStatementCreateDate: 32,
        clientPlan: "monthly",
      };

      await clientController.createClient(req, res);

      expect(Client.signupClient).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: ["clientStatementCreateDate"],
      });
    });

    test("Returns 400 when email is invalid", async () => {
      req.body = {
        clientName: "Test Client",
        clientEmail: "invalid-email",
        clientStreetLineOne: "123 Main St",
        clientCity: "Los Angeles",
        clientState: "CA",
        clientZip: "90001",
        clientCycleDate: 15,
        clientStatementCreateDate: 10,
        clientPlan: "monthly",
      };

      Client.signupClient.mockRejectedValue(
        new Error("This is not a valid email")
      );

      await clientController.createClient(req, res);

      expect(Client.signupClient).toHaveBeenCalledWith("invalid-email");
      expect(Client.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid email",
        emptyFields: ["clientEmail"],
      });
    });

    test("Returns 400 when email already exists", async () => {
      req.body = {
        clientName: "Test Client",
        clientEmail: "existing@example.com",
        clientStreetLineOne: "123 Main St",
        clientCity: "Los Angeles",
        clientState: "CA",
        clientZip: "90001",
        clientCycleDate: 15,
        clientStatementCreateDate: 10,
        clientPlan: "monthly",
      };

      Client.signupClient.mockRejectedValue(new Error("Email exists"));

      await clientController.createClient(req, res);

      expect(Client.signupClient).toHaveBeenCalledWith("existing@example.com");
      expect(Client.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email exists",
        emptyFields: ["clientEmail"],
      });
    });

    test("Returns 500 when client creation fails", async () => {
      req.body = {
        clientName: "Test Client",
        clientEmail: "test@example.com",
        clientStreetLineOne: "123 Main St",
        clientCity: "Los Angeles",
        clientState: "CA",
        clientZip: "90001",
        clientCycleDate: 15,
        clientStatementCreateDate: 10,
        clientPlan: "monthly",
      };

      Client.signupClient.mockResolvedValue();
      Client.create.mockRejectedValue(new Error(errorMessage));

      await clientController.createClient(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Delete Client", () => {
    test("Successfully deletes a client and all related data", async () => {
      req.params.id = validId;

      const mockClient = {
        _id: validId,
        clientName: "Test Client",
        clientEmail: "test@example.com",
      };

      Invoice.deleteMany.mockResolvedValue({});
      Statement.deleteMany.mockResolvedValue({});
      Balance.deleteMany.mockResolvedValue({});
      Payment.deleteMany.mockResolvedValue({});
      User.findOneAndDelete.mockResolvedValue({});
      Client.findOneAndDelete.mockResolvedValue(mockClient);

      await clientController.deleteClient(req, res);

      expect(Invoice.deleteMany).toHaveBeenCalledWith({ clientId: validId });
      expect(Statement.deleteMany).toHaveBeenCalledWith({ clientId: validId });
      expect(Balance.deleteMany).toHaveBeenCalledWith({ clientId: validId });
      expect(Payment.deleteMany).toHaveBeenCalledWith({ clientId: validId });
      expect(User.findOneAndDelete).toHaveBeenCalledWith({ _id: validId });
      expect(Client.findOneAndDelete).toHaveBeenCalledWith({ _id: validId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockClient);
    });

    test("Returns 400 when id is invalid", async () => {
      req.params.id = "invalid-id";

      await clientController.deleteClient(req, res);

      expect(Invoice.deleteMany).not.toHaveBeenCalled();
      expect(Client.findOneAndDelete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid id",
      });
    });

    test("Returns 404 when client is not found", async () => {
      req.params.id = validId;

      Invoice.deleteMany.mockResolvedValue({});
      Statement.deleteMany.mockResolvedValue({});
      Balance.deleteMany.mockResolvedValue({});
      Payment.deleteMany.mockResolvedValue({});
      User.findOneAndDelete.mockResolvedValue({});
      Client.findOneAndDelete.mockResolvedValue(null);

      await clientController.deleteClient(req, res);

      expect(Invoice.deleteMany).toHaveBeenCalled();
      expect(Client.findOneAndDelete).toHaveBeenCalledWith({ _id: validId });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No client found",
      });
    });

    test("Returns 500 when deletion fails", async () => {
      req.params.id = validId;

      Invoice.deleteMany.mockRejectedValue(new Error(errorMessage));

      await clientController.deleteClient(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Update Client", () => {
    test("Successfully updates a client", async () => {
      req.params.id = validId;
      req.body = {
        clientName: "Updated Client",
        clientPhoneNumber: "555-5678",
      };

      const mockUpdatedClient = {
        _id: validId,
        clientName: "Updated Client",
        clientPhoneNumber: "555-5678",
      };

      Client.findOneAndUpdate.mockResolvedValue(mockUpdatedClient);

      await clientController.updateClient(req, res);

      expect(Client.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validId },
        expect.objectContaining({
          clientName: "Updated Client",
          clientPhoneNumber: "555-5678",
        }),
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedClient);
    });

    test("Updates client email and syncs with user", async () => {
      req.params.id = validId;
      req.body = {
        clientEmail: "newemail@example.com",
      };

      const mockUpdatedClient = {
        _id: validId,
        clientEmail: "newemail@example.com",
      };

      Client.findOneAndUpdate.mockResolvedValue(mockUpdatedClient);
      User.findOneAndUpdate.mockResolvedValue({});

      await clientController.updateClient(req, res);

      expect(Client.findOneAndUpdate).toHaveBeenCalled();
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validId },
        { email: "newemail@example.com" },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedClient);
    });

    test("Auto-disables email statements when auto-create is disabled", async () => {
      req.params.id = validId;
      req.body = {
        clientAutoCreateStatementsEnabled: false,
        clientAutoEmailStatementsEnabled: true,
      };

      const mockUpdatedClient = {
        _id: validId,
        clientAutoCreateStatementsEnabled: false,
        clientAutoEmailStatementsEnabled: false,
      };

      Client.findOneAndUpdate.mockResolvedValue(mockUpdatedClient);

      await clientController.updateClient(req, res);

      expect(Client.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validId },
        expect.objectContaining({
          clientAutoCreateStatementsEnabled: false,
          clientAutoEmailStatementsEnabled: false,
        }),
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("Returns 400 when id is invalid", async () => {
      req.params.id = "invalid-id";
      req.body = {
        clientName: "Updated Client",
      };

      await clientController.updateClient(req, res);

      expect(Client.findOneAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid id",
      });
    });

    test("Returns 400 when clientCycleDate is less than 1", async () => {
      req.params.id = validId;
      req.body = {
        clientCycleDate: -1,
      };

      await clientController.updateClient(req, res);

      expect(Client.findOneAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid cycle date",
      });
    });

    test("Returns 400 when clientCycleDate is greater than 31", async () => {
      req.params.id = validId;
      req.body = {
        clientCycleDate: 32,
      };

      await clientController.updateClient(req, res);

      expect(Client.findOneAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid cycle date",
      });
    });

    test("Returns 400 when clientStatementCreateDate is less than 1", async () => {
      req.params.id = validId;
      req.body = {
        clientStatementCreateDate: -1,
      };

      await clientController.updateClient(req, res);

      expect(Client.findOneAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid statement create date",
      });
    });

    test("Returns 400 when clientStatementCreateDate is greater than 31", async () => {
      req.params.id = validId;
      req.body = {
        clientStatementCreateDate: 32,
      };

      await clientController.updateClient(req, res);

      expect(Client.findOneAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid statement create date",
      });
    });

    test("Returns 404 when client is not found", async () => {
      req.params.id = validId;
      req.body = {
        clientName: "Updated Client",
      };

      Client.findOneAndUpdate.mockResolvedValue(null);

      await clientController.updateClient(req, res);

      expect(Client.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No client found",
      });
    });

    test("Returns 500 when update fails", async () => {
      req.params.id = validId;
      req.body = {
        clientName: "Updated Client",
      };

      Client.findOneAndUpdate.mockRejectedValue(new Error(errorMessage));

      await clientController.updateClient(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });
});
