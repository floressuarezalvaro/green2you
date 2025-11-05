const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../../models/userModel");
const {
  requireAdminAuth,
  requireClientAuth,
} = require("../../middleware/requireAdminOrClientAuth");

jest.mock("jsonwebtoken");
jest.mock("../../models/userModel.js");

describe("requireAdminOrClientAuth Middleware", () => {
  let req, res, next;
  const mockToken = "mock-jwt-token";
  const validId = new mongoose.Types.ObjectId().toString();
  process.env.JWTSECRET = "test-secret";

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    req = {
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  describe("Require admin auth", () => {
    test("Successfully authenticates admin user", async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      const mockUser = {
        _id: validId,
        email: "test@gmail.com",
        role: "admin",
      };

      jwt.verify.mockReturnValue({ _id: validId });
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({ select: mockSelect });

      await requireAdminAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
      expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
      expect(mockSelect).toHaveBeenCalledWith("_id role");
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    test("Returns 401 when authorization header is missing", async () => {
      await requireAdminAuth(req, res, next);

      expect(jwt.verify).not.toHaveBeenCalled();
      expect(User.findOne).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Authorization is Required",
      });
    });

    test("Returns 401 when authorization header is empty string", async () => {
      req.headers.authorization = "";

      await requireAdminAuth(req, res, next);

      expect(jwt.verify).not.toHaveBeenCalled();
      expect(User.findOne).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Authorization is Required",
      });
    });

    test("Returns 401 when user is not found", async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      jwt.verify.mockReturnValue({ _id: validId });
      const mockSelect = jest.fn().mockResolvedValue(null);
      User.findOne.mockReturnValue({ select: mockSelect });

      await requireAdminAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
      expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
      expect(mockSelect).toHaveBeenCalledWith("_id role");
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    test("Returns 401 when user has client role", async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      const mockUser = {
        _id: validId,
        role: "client",
      };

      jwt.verify.mockReturnValue({ _id: validId });
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({ select: mockSelect });

      await requireAdminAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
      expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
      expect(req.user).toEqual(mockUser);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "You do not have permission to perform this action.",
      });
    });

    test("Returns 401 when user has invalid role", async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      const mockUser = {
        _id: validId,
        role: "guest",
      };

      jwt.verify.mockReturnValue({ _id: validId });
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({ select: mockSelect });

      await requireAdminAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
      expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
      expect(req.user).toEqual(mockUser);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "You do not have permission to perform this action.",
      });
    });

    test("Returns 401 when token verification fails", async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await requireAdminAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
      expect(User.findOne).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Credentials timed out. Log in again.",
      });
    });

    test("Returns 401 when token is expired", async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      jwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError("jwt expired", new Date());
      });

      await requireAdminAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
      expect(User.findOne).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Credentials timed out. Log in again.",
      });
    });

    test("Returns 401 when User.findOne throws error", async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      jwt.verify.mockReturnValue({ _id: validId });
      const mockSelect = jest.fn().mockRejectedValue(new Error("DB error"));
      User.findOne.mockReturnValue({ select: mockSelect });

      await requireAdminAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
      expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Credentials timed out. Log in again.",
      });
    });
  });

  describe("requireClientAuth", () => {
    test("Successfully authenticates admin user", async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      const mockUser = {
        _id: validId,
        role: "admin",
      };

      jwt.verify.mockReturnValue({ _id: validId });
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({ select: mockSelect });

      await requireClientAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
      expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
      expect(mockSelect).toHaveBeenCalledWith("_id role");
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test("Successfully authenticates client user", async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      const mockUser = {
        _id: validId,
        role: "client",
      };

      jwt.verify.mockReturnValue({ _id: validId });
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({ select: mockSelect });

      await requireClientAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
      expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
      expect(mockSelect).toHaveBeenCalledWith("_id role");
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test("Returns 401 when authorization header is missing", async () => {
      await requireClientAuth(req, res, next);

      expect(jwt.verify).not.toHaveBeenCalled();
      expect(User.findOne).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Authorization is Required",
      });
    });

    test("Returns 401 when authorization header is empty string", async () => {
      req.headers.authorization = "";

      await requireClientAuth(req, res, next);

      expect(jwt.verify).not.toHaveBeenCalled();
      expect(User.findOne).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Authorization is Required",
      });
    });

    test("Returns 401 when user is not found", async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      jwt.verify.mockReturnValue({ _id: validId });
      const mockSelect = jest.fn().mockResolvedValue(null);
      User.findOne.mockReturnValue({ select: mockSelect });

      await requireClientAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
      expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
      expect(mockSelect).toHaveBeenCalledWith("_id role");
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    test("Returns 401 when user has guest role", async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      const mockUser = {
        _id: validId,
        role: "guest",
      };

      jwt.verify.mockReturnValue({ _id: validId });
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({ select: mockSelect });

      await requireClientAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
      expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
      expect(req.user).toEqual(mockUser);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "You do not have permission to perform this action.",
      });
    });

    test("Returns 401 when user has invalid role", async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      const mockUser = {
        _id: validId,
        role: "moderator",
      };

      jwt.verify.mockReturnValue({ _id: validId });
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({ select: mockSelect });

      await requireClientAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
      expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
      expect(req.user).toEqual(mockUser);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "You do not have permission to perform this action.",
      });
    });

    test("Returns 401 when token verification fails", async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      jwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await requireClientAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
      expect(User.findOne).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Credentials timed out. Log in again.",
      });
    });

    test("Returns 401 when token is expired", async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      jwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError("jwt expired", new Date());
      });

      await requireClientAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
      expect(User.findOne).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Credentials timed out. Log in again.",
      });
    });

    test("Returns 401 when User.findOne throws error", async () => {
      req.headers.authorization = `Bearer ${mockToken}`;

      jwt.verify.mockReturnValue({ _id: validId });
      const mockSelect = jest.fn().mockRejectedValue(new Error("DB error"));
      User.findOne.mockReturnValue({ select: mockSelect });

      await requireClientAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
      expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Credentials timed out. Log in again.",
      });
    });
  });
});
