jest.mock("dotenv", () => ({
  config: jest.fn().mockReturnValue({ parsed: {} }),
}));

describe("Tests setting the correct environment", () => {
  let consoleLogSpy;
  let dotenv;
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;

    jest.resetModules();
    dotenv = require("dotenv");

    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    consoleLogSpy.mockRestore();
  });

  test("sets default ENV environment", () => {
    delete process.env.NODE_ENV;

    const config = require("../../config/environment");

    expect(config.ENV).toBe("development");
    expect(config.isProd).toBe(false);
  });

  test("sets development environment", () => {
    process.env.NODE_ENV = "development";
    const config = require("../../config/environment");

    expect(dotenv.config).toHaveBeenCalledWith({ path: ".env.development" });
    expect(config.ENV).toBe("development");
    expect(config.isProd).toBe(false);
  });

  test("sets production environment", () => {
    process.env.NODE_ENV = "production";
    const config = require("../../config/environment");

    expect(dotenv.config).toHaveBeenCalledWith({ path: ".env.production" });
    expect(config.ENV).toBe("production");
    expect(config.isProd).toBe(true);
  });

  test("logs correct message for development mode", () => {
    process.env.NODE_ENV = "development";

    require("../../config/environment");

    expect(consoleLogSpy).toHaveBeenCalledWith("You're in development mode!");
  });

  test("logs correct message for production mode", () => {
    process.env.NODE_ENV = "production";

    require("../../config/environment");

    expect(consoleLogSpy).toHaveBeenCalledWith("You're in production mode!");
  });
});
