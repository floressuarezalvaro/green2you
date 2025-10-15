const rateLimit = require("express-rate-limit");
const setLimit = require("../../utils/setLimit.js");

jest.mock("express-rate-limit");

describe("Tests the API rate limiting function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("sets default limit", () => {
    setLimit();
    expect(rateLimit).toHaveBeenCalledTimes(1);
    expect(rateLimit).toHaveBeenCalledWith({
      windowMs: 10 * 60 * 1000,
      limit: 50,
      message: {
        error: "Limit maxed out. Try again later.",
      },
      standardHeaders: false,
      legacyHeaders: false,
      ipv6Subnet: 56,
      skipSuccessfulRequests: true,
    });
  });

  test("sets custom limit", () => {
    const customLimit = 10;
    setLimit(customLimit);

    expect(rateLimit).toHaveBeenCalledTimes(1);
    expect(rateLimit).toHaveBeenCalledWith({
      windowMs: 10 * 60 * 1000,
      limit: 10,
      message: {
        error: "Limit maxed out. Try again later.",
      },
      standardHeaders: false,
      legacyHeaders: false,
      ipv6Subnet: 56,
      skipSuccessfulRequests: true,
    });
  });
});
