const mongoose = require("mongoose");

const Balance = require("../../models/balanceModel");
const Client = require("../../models/clientModel");

const balanceController = require("../../controllers/balanceController");

jest.mock("../../models/balanceModel.js");
jest.mock("../../models/clientModel.js");

describe("Balance controllers", () => {
  const validId = new mongoose.Types.ObjectId().toString();
  const errorMessage = "System could not process";
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("Create Balance", () => {
    test("Successfully creates a balance", async () => {
      req.params.id = validId;
      req.body.currentBalance = 100;

      const mockClient = { _id: validId, name: "Test Client" };
      const mockBalance = {
        _id: validId,
        clientId: validId,
        currentBalance: 100,
      };

      Client.findById.mockResolvedValue(mockClient);
      Balance.create.mockResolvedValue(mockBalance);

      await balanceController.createBalance(req, res);

      expect(Client.findById).toHaveBeenCalledWith(validId);
      expect(Balance.create).toHaveBeenCalledWith({
        _id: validId,
        clientId: validId,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockBalance);
    });

    test("Should default to currentBalance 0 if not provided", async () => {
      req.params.id = validId;
      req.body.currentBalance = undefined;

      const mockClient = { _id: validId, name: "Test Client" };
      const mockBalance = { _id: validId, clientId: validId };

      Client.findById.mockResolvedValue(mockClient);
      Balance.create.mockResolvedValue(mockBalance);

      await balanceController.createBalance(req, res);

      expect(Balance.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("Should return a 400 if balance is not a number", async () => {
      req.params.id = validId;
      req.body.currentBalance = "not a number";

      await balanceController.createBalance(req, res);

      expect(Balance.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "All fields must be valid numbers",
      });
    });

    test("Should  return a 400 if balance is an empty string", async () => {
      req.params.id = validId;
      req.body.currentBalance = "";

      await balanceController.createBalance(req, res);

      expect(Balance.create).not.toHaveBeenCalledWith();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "All fields are required",
      });
    });

    test("Should return a 400 when client id is not valid", async () => {
      req.params.id = "invalid-id";

      await balanceController.createBalance(req, res);

      expect(Balance.create).not.toHaveBeenCalledWith();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid id",
      });
    });

    test("Should return a 404 when client not found", async () => {
      req.params.id = validId;

      Client.findById.mockResolvedValue(null);

      await balanceController.createBalance(req, res);

      expect(Balance.create).not.toHaveBeenCalledWith();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Client not found",
      });
    });

    test("Should return a 500 on server error", async () => {
      req.params.id = validId;

      Client.findById.mockRejectedValue(new Error(errorMessage));

      await balanceController.createBalance(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenLastCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Get Balance", () => {
    test("Should successfully get a users balance", async () => {
      req.params.id = validId;

      const mockBalance = {
        _id: validId,
        clientId: validId,
        currentBalance: 100,
      };

      Balance.findById.mockResolvedValue(mockBalance);

      await balanceController.getBalance(req, res);

      expect(Balance.findById).toHaveBeenCalledWith(validId);
      expect(res.status).toBeCalledWith(200);
      expect(res.json).toBeCalledWith(mockBalance);
    });

    test("Returns 400 if id is not valid", async () => {
      req.params.id = "invalid-id";

      await balanceController.getBalance(req, res);

      expect(Balance.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid id",
      });
    });

    test("Returns 404 if client balance is not found", async () => {
      req.params.id = validId;

      Balance.findById.mockResolvedValue(null);

      await balanceController.getBalance(req, res);

      expect(Balance.findById).toHaveBeenCalled();
      expect(res.status).toBeCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Client balance not found",
      });
    });

    test("Returns a 500 when server can't respond", async () => {
      req.params.id = validId;

      Balance.findById.mockRejectedValue(new Error(errorMessage));

      await balanceController.getBalance(req, res);

      expect(Balance.findById).toHaveBeenCalled();
      expect(res.status).toBeCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Gets all balances", () => {
    test("Successfully gets all balances", async () => {
      const validId2 = new mongoose.Types.ObjectId().toString();

      const mockBalances = [
        { _id: validId, clientId: validId, currentBalance: 100 },
        { _id: validId2, clientId: validId2, currentBalance: 200 },
      ];

      const mockSort = jest.fn().mockResolvedValue(mockBalances);
      Balance.find.mockReturnValue({ sort: mockSort });

      await balanceController.getAllBalances(req, res);

      expect(Balance.find).toHaveBeenCalled();
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockBalances);
    });

    test("Returns 500 when server can't respond", async () => {
      req.params.id = validId;

      const mockSort = jest.fn().mockRejectedValue(new Error(errorMessage));
      Balance.find.mockReturnValue({ sort: mockSort });

      await balanceController.getAllBalances(req, res);

      expect(Balance.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Update Balance", () => {
    test("Successfully updates balance", async () => {
      req.params.id = validId;
      req.body = { currentBalance: 150 };

      const mockUpdatedBalance = {
        _id: validId,
        clientId: validId,
        currentBalance: 150,
      };

      Balance.findOneAndUpdate.mockResolvedValue(mockUpdatedBalance);

      await balanceController.updateBalance(req, res);

      expect(Balance.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validId },
        { ...req.body },
        { new: true }
      );
      expect(res.status).toBeCalledWith(200);
      expect(res.json).toBeCalledWith(mockUpdatedBalance);
    });

    test("Returns 400 error when id is not valid", async () => {
      req.params.id = "invalid-id";

      await balanceController.updateBalance(req, res);

      expect(Balance.findOneAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toBeCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid id",
      });
    });

    test("Returns 404 when balance can't be found", async () => {
      req.params.id = validId;

      Balance.findOneAndUpdate.mockResolvedValue(null);
      await balanceController.updateBalance(req, res);

      expect(Balance.findOneAndUpdate).toBeCalled();
      expect(res.status).toBeCalledWith(404);
      expect(res.json).toBeCalledWith({ error: "No balance found" });
    });

    test("Returns 500 error when server can't respond", async () => {
      req.params.id = validId;

      Balance.findOneAndUpdate.mockRejectedValue(new Error(errorMessage));

      await balanceController.updateBalance(req, res);

      expect(Balance.findOneAndUpdate).toBeCalled();
      expect(res.status).toBeCalledWith(500);
      expect(res.json).toBeCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Delete Balance", () => {
    test("Successfully deletes a balance", async () => {
      req.params.id = validId;

      const mockDeletedBalance = {
        _id: validId,
        clientId: validId,
        currentBalance: 100,
      };

      Balance.findOneAndDelete.mockResolvedValue(mockDeletedBalance);

      await balanceController.deleteBalance(req, res);

      expect(Balance.findOneAndDelete).toHaveBeenCalledWith({ _id: validId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockDeletedBalance);
    });

    test("Returns 400 if not a valid id", async () => {
      req.params.id = "invalid-id";

      await balanceController.deleteBalance(req, res);

      expect(Balance.findOneAndDelete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid id",
      });
    });

    test("Returns 404 when the balance is not found", async () => {
      req.params.id = validId;

      Balance.findOneAndDelete.mockResolvedValue(null);

      await balanceController.deleteBalance(req, res);

      expect(Balance.findOneAndDelete).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No balance found",
      });
    });

    test("Returns a 500 error when system can't process", async () => {
      req.params.id = validId;

      Balance.findOneAndDelete.mockRejectedValue(new Error(errorMessage));
      await balanceController.deleteBalance(req, res);

      expect(Balance.findOneAndDelete).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });
});
