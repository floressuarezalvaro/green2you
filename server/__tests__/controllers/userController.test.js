const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Client = require("../../models/clientModel");
const User = require("../../models/userModel");
const userController = require("../../controllers/userController");

const { sendEmail } = require("../../utils/emailHandler");

jest.mock("../../models/clientModel");
jest.mock("../../models/userModel");
jest.mock("../../utils/emailHandler");
jest.mock("jsonwebtoken");

describe("User Controller", () => {
  let req, res;
  const errorMessage = "System could not process";
  const mockToken = "mock-jwt-token";
  const validId = new mongoose.Types.ObjectId().toString();
  process.env.JWTSECRET = "test-secret";
  process.env.FRONTEND_URL = "http://localhost:3000";

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("Log In User", () => {
    test("Successfully logs in user ", async () => {
      req.body = { email: "test@gmail.com", password: "password123@" };

      const mockUser = {
        _id: validId,
        email: "test@gmail.com",
        role: "client",
      };

      User.login.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue(mockToken);

      await userController.loginUser(req, res);

      expect(User.login).toHaveBeenCalledWith("test@gmail.com", "password123@");
      expect(jwt.sign).toHaveBeenCalledWith({ _id: validId }, "test-secret", {
        expiresIn: "1d",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: validId,
        email: "test@gmail.com",
        token: mockToken,
        role: "client",
      });
    });

    test("Returns 400 when login fails", async () => {
      req.body = { email: "test@gmail.com", password: "password123@" };

      User.login.mockRejectedValue(new Error("Invalid Credentials"));

      await userController.loginUser(req, res);

      expect(User.login).toHaveBeenCalled();
      expect(res.status).toBeCalledWith(400);
      expect(res.json).toBeCalledWith({ error: "Invalid Credentials" });
    });
  });

  describe("Sign Up User", () => {
    test("Successfully signs up user", async () => {
      req.body = {
        email: "test@gmail.com",
        password: "password123@",
        role: "client",
      };

      const mockUser = {
        _id: validId,
        email: "test@gmail.com",
        role: "client",
      };

      User.signup.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue(mockToken);

      await userController.signUpUser(req, res);

      expect(User.signup).toHaveBeenCalledWith(
        "test@gmail.com",
        "password123@",
        "client"
      );
      expect(jwt.sign).toHaveBeenCalledWith({ _id: validId }, "test-secret", {
        expiresIn: "1d",
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        email: "test@gmail.com",
        role: "client",
        token: mockToken,
      });
    });

    test("Returns 400 when signup fails", async () => {
      req.body = {
        email: "test@gmail.com",
        password: "weak",
        role: "user",
      };

      User.signup.mockRejectedValue(
        new Error("This password is not strong enough")
      );

      await userController.signUpUser(req, res);

      expect(User.signup).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This password is not strong enough",
      });
    });
  });

  describe("Sign Up Client", () => {
    test("Successfully signs up a new client", async () => {
      req.body = {
        email: "client@example.com",
        clientId: validId,
      };

      const mockClient = {
        _id: validId,
        clientName: "Test Client",
        clientEmail: "client@example.com",
      };

      const mockUser = {
        _id: validId,
        email: "client@example.com",
        role: "client",
      };

      const mockToken = "mock-jwt-token";
      const mockPasswordToken = "mock-password-token";

      Client.findById.mockResolvedValue(mockClient);
      Client.findOneAndUpdate.mockResolvedValue(mockClient);
      User.signupClient.mockResolvedValue(mockUser);
      User.forgotPassword.mockResolvedValue(mockPasswordToken);
      jwt.sign.mockReturnValue(mockToken);
      sendEmail.mockResolvedValue();

      await userController.signUpClient(req, res);

      expect(Client.findById).toHaveBeenCalledWith(validId);
      expect(Client.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validId },
        { $set: { clientWelcomeEmailEnabled: true } }
      );
      expect(User.signupClient).toHaveBeenCalledWith(
        "client@example.com",
        validId
      );
      expect(User.forgotPassword).toHaveBeenCalledWith("client@example.com");
      expect(sendEmail).toHaveBeenCalledWith(
        "Password Set",
        "client@example.com",
        "Access Account - Set Password",
        expect.stringContaining("Test Client"),
        null
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        email: "client@example.com",
        token: mockToken,
        role: "client",
      });
    });

    test("Returns 400 when email is missing", async () => {
      req.body = {
        clientId: validId,
      };

      await userController.signUpClient(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email and Client ID are required",
      });
    });

    test("Returns 400 when clientId is missing", async () => {
      req.body = {
        email: "client@example.com",
      };

      await userController.signUpClient(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email and Client ID are required",
      });
    });

    test("Returns 400 when clientId is invalid", async () => {
      req.body = {
        email: "client@example.com",
        clientId: "invalid-id",
      };

      await userController.signUpClient(req, res);

      expect(Client.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid Client ID",
      });
    });

    test("Returns 404 when client is not found", async () => {
      req.body = {
        email: "client@example.com",
        clientId: validId,
      };

      Client.findById.mockResolvedValue(null);
      Client.findOneAndUpdate.mockResolvedValue(null);

      await userController.signUpClient(req, res);

      expect(Client.findById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Client not found",
      });
    });

    test("Returns 400 when signup fails", async () => {
      req.body = {
        email: "client@example.com",
        clientId: validId,
      };

      const mockClient = {
        _id: validId,
        clientName: "Test Client",
      };

      Client.findById.mockResolvedValue(mockClient);
      Client.findOneAndUpdate.mockResolvedValue(mockClient);
      User.signupClient.mockRejectedValue(new Error("Email already exists"));

      await userController.signUpClient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email already exists",
      });
    });
  });

  describe("Reset Password", () => {
    test("Successfully resets password", async () => {
      req.body = {
        email: "test@example.com",
        oldPassword: "oldpass123",
        newPassword: "newpass123",
      };

      const mockUser = {
        _id: validId,
        email: "test@example.com",
      };

      User.resetPassword.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue(mockToken);

      await userController.resetPassword(req, res);

      expect(User.resetPassword).toHaveBeenCalledWith(
        "test@example.com",
        "oldpass123",
        "newpass123"
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        email: "test@example.com",
        token: mockToken,
        message: "Password reset successful",
      });
    });

    test("Returns 400 when email is missing", async () => {
      req.body = {
        oldPassword: "oldpass123",
        newPassword: "newpass123",
      };

      await userController.resetPassword(req, res);

      expect(User.resetPassword).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "All fields are required",
      });
    });

    test("Returns 400 when oldPassword is missing", async () => {
      req.body = {
        email: "test@example.com",
        newPassword: "newpass123",
      };

      await userController.resetPassword(req, res);

      expect(User.resetPassword).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "All fields are required",
      });
    });

    test("Returns 400 when newPassword is missing", async () => {
      req.body = {
        email: "test@example.com",
        oldPassword: "oldpass123",
      };

      await userController.resetPassword(req, res);

      expect(User.resetPassword).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "All fields are required",
      });
    });

    test("Returns 400 when reset fails", async () => {
      req.body = {
        email: "test@example.com",
        oldPassword: "wrongpass",
        newPassword: "newpass123",
      };

      User.resetPassword.mockRejectedValue(new Error("Invalid old password"));

      await userController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid old password",
      });
    });
  });

  describe("Forgot Password", () => {
    test("Successfully sends forgot password email", async () => {
      req.body = {
        email: "test@example.com",
      };

      User.forgotPassword.mockResolvedValue(mockToken);
      sendEmail.mockResolvedValue();

      await userController.forgotPassword(req, res);

      expect(User.forgotPassword).toHaveBeenCalledWith("test@example.com");
      expect(sendEmail).toHaveBeenCalledWith(
        "Password Reset",
        "test@example.com",
        "Password Reset Request",
        expect.stringContaining(
          "http://localhost:3000/set-password/mock-jwt-token"
        ),
        null
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Password reset link sent to email",
      });
    });

    test("Returns 400 when email is missing", async () => {
      req.body = {};

      await userController.forgotPassword(req, res);

      expect(User.forgotPassword).not.toHaveBeenCalled();
      expect(sendEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Email is required",
      });
    });

    test("Returns 400 when user is not found", async () => {
      req.body = {
        email: "nonexistent@example.com",
      };

      User.forgotPassword.mockRejectedValue(new Error("User not found"));

      await userController.forgotPassword(req, res);

      expect(User.forgotPassword).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "User not found",
      });
    });
  });

  describe("Reset Password With Token", () => {
    test("Successfully resets password with token", async () => {
      req.params.token = "valid-reset-token";
      req.body = {
        password: "newpassword123",
      };

      User.resetPassword.mockResolvedValue();

      await userController.resetPasswordWithToken(req, res);

      expect(User.resetPassword).toHaveBeenCalledWith(
        null,
        null,
        "newpassword123",
        "valid-reset-token"
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Password reset successful",
      });
    });

    test("Returns 400 when password is missing", async () => {
      req.params.token = "valid-reset-token";
      req.body = {};

      await userController.resetPasswordWithToken(req, res);

      expect(User.resetPassword).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "New password is required",
      });
    });

    test("Returns 400 when token is invalid", async () => {
      req.params.token = "invalid-token";
      req.body = {
        password: "newpassword123",
      };

      User.resetPassword.mockRejectedValue(
        new Error("Invalid or expired token")
      );

      await userController.resetPasswordWithToken(req, res);

      expect(User.resetPassword).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid or expired token",
      });
    });
  });

  describe("Get All Users", () => {
    test("Successfully gets all users", async () => {
      const validId2 = new mongoose.Types.ObjectId().toString();

      const mockUsers = [
        { _id: validId, email: "user1@example.com", role: "admin" },
        { _id: validId2, email: "user2@example.com", role: "user" },
      ];

      const mockSort = jest.fn().mockResolvedValue(mockUsers);
      User.find.mockReturnValue({ sort: mockSort });

      await userController.getAllUsers(req, res);

      expect(User.find).toHaveBeenCalledWith({});
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    test("Returns 500 when server can't respond", async () => {
      const mockSort = jest.fn().mockRejectedValue(new Error(errorMessage));
      User.find.mockReturnValue({ sort: mockSort });

      await userController.getAllUsers(req, res);

      expect(User.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Get User", () => {
    test("Successfully gets a user", async () => {
      req.params.id = validId;

      const mockUser = {
        _id: validId,
        email: "test@example.com",
        role: "user",
      };

      User.findById.mockResolvedValue(mockUser);

      await userController.getUser(req, res);

      expect(User.findById).toHaveBeenCalledWith(validId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test("Returns 400 when id is not valid", async () => {
      req.params.id = "invalid-id";

      await userController.getUser(req, res);

      expect(User.findById).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid id",
      });
    });

    test("Returns 404 when user is not found", async () => {
      req.params.id = validId;

      User.findById.mockResolvedValue(null);

      await userController.getUser(req, res);

      expect(User.findById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No user found",
      });
    });

    test("Returns 500 when server can't respond", async () => {
      req.params.id = validId;

      User.findById.mockRejectedValue(new Error(errorMessage));

      await userController.getUser(req, res);

      expect(User.findById).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Delete User", () => {
    test("Successfully deletes a user", async () => {
      req.params.id = validId;

      const mockUser = {
        _id: validId,
        email: "test@example.com",
        role: "user",
      };

      User.findOneAndDelete.mockResolvedValue(mockUser);

      await userController.deleteUser(req, res);

      expect(User.findOneAndDelete).toHaveBeenCalledWith({ _id: validId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test("Returns 400 when id is not valid", async () => {
      req.params.id = "invalid-id";

      await userController.deleteUser(req, res);

      expect(User.findOneAndDelete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid id",
      });
    });

    test("Returns 404 when user is not found", async () => {
      req.params.id = validId;

      User.findOneAndDelete.mockResolvedValue(null);

      await userController.deleteUser(req, res);

      expect(User.findOneAndDelete).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No user found",
      });
    });

    test("Returns 500 when server can't respond", async () => {
      req.params.id = validId;

      User.findOneAndDelete.mockRejectedValue(new Error(errorMessage));

      await userController.deleteUser(req, res);

      expect(User.findOneAndDelete).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Update User", () => {
    test("Successfully updates a user", async () => {
      req.params.id = validId;
      req.body = {
        email: "updated@example.com",
        role: "admin",
      };

      const mockUser = {
        _id: validId,
        email: "updated@example.com",
        role: "admin",
      };

      User.findOneAndUpdate.mockResolvedValue(mockUser);

      await userController.updateUser(req, res);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validId },
        { email: "updated@example.com", role: "admin" },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test("Returns 400 when id is not valid", async () => {
      req.params.id = "invalid-id";

      await userController.updateUser(req, res);

      expect(User.findOneAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid id",
      });
    });

    test("Returns 404 when user is not found", async () => {
      req.params.id = validId;
      req.body = { email: "updated@example.com" };

      User.findOneAndUpdate.mockResolvedValue(null);

      await userController.updateUser(req, res);

      expect(User.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "No user found",
      });
    });

    test("Returns 500 when server can't respond", async () => {
      req.params.id = validId;
      req.body = { email: "updated@example.com" };

      User.findOneAndUpdate.mockRejectedValue(new Error(errorMessage));

      await userController.updateUser(req, res);

      expect(User.findOneAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });
});
