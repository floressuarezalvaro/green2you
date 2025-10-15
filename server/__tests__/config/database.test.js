jest.mock("mongoose", () => ({
  connect: jest.fn(() => Promise.resolve()),
}));

describe("Testing database connections", () => {
  let connectWithRetry;
  let consoleLogSpy;
  let consoleErrorSpy;
  let mongoose;

  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    jest.spyOn(global, "setTimeout");
    mongoose = require("mongoose");
    connectWithRetry = require("../../config/database");
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    process.env.MONGO_URI = "mongodb://fake-uri";
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("calls mongoose.connect with process.env.MONGO_URI", async () => {
    mongoose.connect.mockResolvedValueOnce();

    await connectWithRetry();

    expect(mongoose.connect).toHaveBeenCalledWith("mongodb://fake-uri");
    expect(consoleLogSpy).toHaveBeenCalledWith("Connected to database");
  });

  test("logs error and retries connection", async () => {
    const fakeError = new Error("Connection failed");
    mongoose.connect.mockRejectedValueOnce(fakeError);

    await connectWithRetry();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Database connection failed, retrying in 5 seconds...",
      fakeError
    );

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
  });
});
