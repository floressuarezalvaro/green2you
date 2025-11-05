const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../../models/userModel");
const requireAPIKeyOrAuth = require("../../middleware/requireAPIKeyOrAuth");

jest.mock("jsonwebtoken");
jest.mock("../../models/userModel");

describe("requireAPIKeyOrAuth Middleware", () => {
  let req, res, next;
  const validId = new mongoose.Types.ObjectId().toString();
  const mockToken = "mock-jwt-token";
  const validAPIKey = "test-api-key-123";
  process.env.API_KEY = validAPIKey;
  process.env.JWTSECRET = "test-secret";

  const waitForAsync = () => new Promise((resolve) => setImmediate(resolve));

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

  test("Successfully authenticates with valid API key", () => {
    req.headers["x-api-key"] = validAPIKey;

    requireAPIKeyOrAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(User.findOne).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("Successfully authenticates with valid API key (case sensitive)", () => {
    req.headers["x-api-key"] = "test-api-key-123";

    requireAPIKeyOrAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(User.findOne).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("Falls back to auth when API key is missing", async () => {
    req.headers.authorization = `Bearer ${mockToken}`;

    const mockUser = {
      _id: validId,
      role: "admin",
    };

    jwt.verify.mockReturnValue({ _id: validId });
    const mockSelect = jest.fn().mockResolvedValue(mockUser);
    User.findOne.mockReturnValue({ select: mockSelect });

    requireAPIKeyOrAuth(req, res, next);
    await waitForAsync();

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
    expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
    expect(mockSelect).toHaveBeenCalledWith("_id role");
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("Falls back to auth when API key is invalid", async () => {
    req.headers["x-api-key"] = "invalid-api-key";
    req.headers.authorization = `Bearer ${mockToken}`;

    const mockUser = {
      _id: validId,
      role: "client",
    };

    jwt.verify.mockReturnValue({ _id: validId });
    const mockSelect = jest.fn().mockResolvedValue(mockUser);
    User.findOne.mockReturnValue({ select: mockSelect });

    requireAPIKeyOrAuth(req, res, next);
    await waitForAsync();

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
    expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
    expect(mockSelect).toHaveBeenCalledWith("_id role");
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("Falls back to auth when API key is empty string", async () => {
    req.headers["x-api-key"] = "";
    req.headers.authorization = `Bearer ${mockToken}`;

    const mockUser = {
      _id: validId,
      role: "admin",
    };

    jwt.verify.mockReturnValue({ _id: validId });
    const mockSelect = jest.fn().mockResolvedValue(mockUser);
    User.findOne.mockReturnValue({ select: mockSelect });

    requireAPIKeyOrAuth(req, res, next);
    await waitForAsync();

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
    expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
    expect(next).toHaveBeenCalled();
  });

  test("Returns 401 when both API key and authorization are missing", async () => {
    requireAPIKeyOrAuth(req, res, next);
    await waitForAsync();

    expect(jwt.verify).not.toHaveBeenCalled();
    expect(User.findOne).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Authorization is Required",
    });
  });

  test("Returns 401 when API key is invalid and authorization is missing", async () => {
    req.headers["x-api-key"] = "wrong-key";

    requireAPIKeyOrAuth(req, res, next);
    await waitForAsync();

    expect(jwt.verify).not.toHaveBeenCalled();
    expect(User.findOne).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Authorization is Required",
    });
  });

  test("Returns 401 when API key is invalid and token is invalid", async () => {
    req.headers["x-api-key"] = "wrong-key";
    req.headers.authorization = `Bearer ${mockToken}`;

    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    requireAPIKeyOrAuth(req, res, next);
    await waitForAsync();

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
    expect(User.findOne).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Credentials timed out. Log in again.",
    });
  });

  test("Returns 401 when API key is invalid and user is not found", async () => {
    req.headers["x-api-key"] = "wrong-key";
    req.headers.authorization = `Bearer ${mockToken}`;

    jwt.verify.mockReturnValue({ _id: validId });
    const mockSelect = jest.fn().mockResolvedValue(null);
    User.findOne.mockReturnValue({ select: mockSelect });

    requireAPIKeyOrAuth(req, res, next);
    await waitForAsync();

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
    expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });

  test("Returns 401 when API key is invalid and user has insufficient permissions", async () => {
    req.headers["x-api-key"] = "wrong-key";
    req.headers.authorization = `Bearer ${mockToken}`;

    const mockUser = {
      _id: validId,
      role: "guest",
    };

    jwt.verify.mockReturnValue({ _id: validId });
    const mockSelect = jest.fn().mockResolvedValue(mockUser);
    User.findOne.mockReturnValue({ select: mockSelect });

    requireAPIKeyOrAuth(req, res, next);
    await waitForAsync();

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
    expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
    expect(req.user).toEqual(mockUser);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "You do not have permission to perform this action.",
    });
  });

  test("API key takes precedence over invalid authorization", async () => {
    req.headers["x-api-key"] = validAPIKey;
    req.headers.authorization = "Bearer invalid-token";

    requireAPIKeyOrAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(User.findOne).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("API key takes precedence over missing user", async () => {
    req.headers["x-api-key"] = validAPIKey;
    req.headers.authorization = `Bearer ${mockToken}`;

    requireAPIKeyOrAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(User.findOne).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("Handles API key with extra whitespace", async () => {
    req.headers["x-api-key"] = "  test-api-key-123  ";
    req.headers.authorization = `Bearer ${mockToken}`;

    const mockUser = {
      _id: validId,
      role: "admin",
    };

    jwt.verify.mockReturnValue({ _id: validId });
    const mockSelect = jest.fn().mockResolvedValue(mockUser);
    User.findOne.mockReturnValue({ select: mockSelect });

    requireAPIKeyOrAuth(req, res, next);
    await waitForAsync();

    // API key with whitespace doesn't match, so falls back to auth
    expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
    expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
    expect(next).toHaveBeenCalled();
  });

  test("Successfully authenticates admin user via fallback auth", async () => {
    req.headers.authorization = `Bearer ${mockToken}`;

    const mockUser = {
      _id: validId,
      role: "admin",
    };

    jwt.verify.mockReturnValue({ _id: validId });
    const mockSelect = jest.fn().mockResolvedValue(mockUser);
    User.findOne.mockReturnValue({ select: mockSelect });

    requireAPIKeyOrAuth(req, res, next);
    await waitForAsync();

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
    expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  test("Successfully authenticates client user via fallback auth", async () => {
    req.headers.authorization = `Bearer ${mockToken}`;

    const mockUser = {
      _id: validId,
      role: "client",
    };

    jwt.verify.mockReturnValue({ _id: validId });
    const mockSelect = jest.fn().mockResolvedValue(mockUser);
    User.findOne.mockReturnValue({ select: mockSelect });

    requireAPIKeyOrAuth(req, res, next);
    await waitForAsync();

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, "test-secret");
    expect(User.findOne).toHaveBeenCalledWith({ _id: validId });
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });
});
