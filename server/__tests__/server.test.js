jest.mock("../config/environment.js");
jest.mock("../config/database.js");
jest.mock("../app.js");

describe("Server initialization", () => {
  let app;
  let connectDb;
  let consoleLogSpy;
  let originalPort;

  beforeEach(() => {
    jest.resetModules();

    originalPort = process.env.PORT;
    process.env.PORT = "3000";

    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    connectDb = require("../config/database");
    app = require("../app");

    app.listen = jest.fn((port, callback) => {
      callback();
      return { close: jest.fn() };
    });
  });

  afterEach(() => {
    process.env.PORT = originalPort;
    consoleLogSpy.mockRestore();
  });

  test("connects to database and starts server on specified port", async () => {
    connectDb.mockResolvedValueOnce();

    require("../server");

    await new Promise(process.nextTick);

    expect(connectDb).toHaveBeenCalledTimes(1);
    expect(app.listen).toHaveBeenCalledWith("3000", expect.any(Function));
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Server listening on port",
      process.env.PORT
    );
  });

  test("does not start server if database can't connect", async () => {
    const fakeError = new Error("Could not connect to db");
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const processExitSpy = jest.spyOn(process, "exit").mockImplementation();

    connectDb.mockRejectedValue(fakeError);

    require("../server");

    await new Promise(process.nextTick);

    expect(connectDb).toHaveBeenCalledTimes(1);
    expect(app.listen).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to start server:",
      fakeError
    );
    expect(processExitSpy).toHaveBeenCalledWith(1);

    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });
});
