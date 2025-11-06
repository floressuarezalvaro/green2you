const mongoose = require("mongoose");
const validator = require("validator");

jest.mock("validator");
jest.mock("../../models/balanceModel");

const Client = require("../../models/clientModel");
const Balance = require("../../models/balanceModel");

describe("Client Model", () => {
  describe("signupClient", () => {
    test("Successfully validates a new client with valid email", async () => {
      validator.isEmail.mockReturnValue(true);
      jest.spyOn(Client, "findOne").mockResolvedValue(null);

      await expect(
        Client.signupClient("newclient@test.com")
      ).resolves.toBeUndefined();

      expect(validator.isEmail).toHaveBeenCalledWith("newclient@test.com");
      expect(Client.findOne).toHaveBeenCalledWith({
        clientEmail: "newclient@test.com",
      });
    });

    test("Throws error when email is invalid", async () => {
      validator.isEmail.mockReturnValue(false);

      await expect(Client.signupClient("invalid-email")).rejects.toThrow(
        "This is not a valid email"
      );

      expect(validator.isEmail).toHaveBeenCalledWith("invalid-email");
    });

    test("Throws error when email already exists", async () => {
      const existingClient = {
        _id: "507f1f77bcf86cd799439011",
        clientEmail: "existing@test.com",
        clientName: "Existing Client",
      };

      validator.isEmail.mockReturnValue(true);
      jest.spyOn(Client, "findOne").mockResolvedValue(existingClient);

      await expect(Client.signupClient("existing@test.com")).rejects.toThrow(
        "Email exists"
      );

      expect(Client.findOne).toHaveBeenCalledWith({
        clientEmail: "existing@test.com",
      });
    });

    test("Validates email format before checking database", async () => {
      validator.isEmail.mockReturnValue(false);
      const findOneSpy = jest.spyOn(Client, "findOne");

      await expect(Client.signupClient("notanemail")).rejects.toThrow(
        "This is not a valid email"
      );

      expect(validator.isEmail).toHaveBeenCalledWith("notanemail");
      expect(findOneSpy).not.toHaveBeenCalled();
    });
  });

  describe("createClientBalance", () => {
    test("Successfully creates balance for valid client ID", async () => {
      const validClientId = "507f1f77bcf86cd799439011";

      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      Balance.create = jest.fn().mockResolvedValue({
        _id: validClientId,
        clientId: validClientId,
        currentBalance: 0,
      });

      await expect(
        Client.createClientBalance(validClientId)
      ).resolves.toBeUndefined();

      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(
        validClientId
      );
      expect(Balance.create).toHaveBeenCalledWith({
        _id: validClientId,
        clientId: validClientId,
        currentBalance: 0,
      });
    });

    test("Throws error when client ID is invalid", async () => {
      const invalidClientId = "invalid-id";

      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      await expect(Client.createClientBalance(invalidClientId)).rejects.toThrow(
        `This is not a valid Client ID: ${invalidClientId}`
      );

      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith(
        invalidClientId
      );
    });

    test("Throws error when client ID is null", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      await expect(Client.createClientBalance(null)).rejects.toThrow(
        "This is not a valid Client ID: null"
      );
    });

    test("Throws error when client ID is undefined", async () => {
      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      await expect(Client.createClientBalance(undefined)).rejects.toThrow(
        "This is not a valid Client ID: undefined"
      );
    });

    test("Initializes balance at 0 for new client", async () => {
      const validClientId = "507f1f77bcf86cd799439011";

      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);
      Balance.create = jest.fn().mockResolvedValue({
        _id: validClientId,
        clientId: validClientId,
        currentBalance: 0,
      });

      await Client.createClientBalance(validClientId);

      expect(Balance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          currentBalance: 0,
        })
      );
    });

    test("Does not create balance if validation fails", async () => {
      const invalidClientId = "bad-id";

      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);
      Balance.create = jest.fn();

      await expect(
        Client.createClientBalance(invalidClientId)
      ).rejects.toThrow();

      expect(Balance.create).not.toHaveBeenCalled();
    });
  });
});
