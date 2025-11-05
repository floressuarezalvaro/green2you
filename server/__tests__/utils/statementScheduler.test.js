const Client = require("../../models/clientModel");
const emailHandler = require("../../utils/emailHandler");
const statementsController = require("../../controllers/statementsController");

const statementScheduler = require("../../utils/statementScheduler");

jest.mock("../../models/clientModel");
jest.mock("../../controllers/statementsController");
jest.mock("../../utils/emailHandler");

describe("Statement Scheduler Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});

    process.env.USER_ID = "507f1f77bcf86cd799439011";
  });

  describe("statementScheduler", () => {
    test("Skips client when auto create statements is disabled", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-01-15T12:00:00.000Z"));

      const mockClients = [
        {
          _id: "client1",
          clientEmail: "client1@test.com",
          clientCycleDate: 15,
          clientAutoCreateStatementsEnabled: false,
          clientAutoEmailStatementsEnabled: true,
        },
      ];

      Client.find.mockResolvedValue(mockClients);
      statementsController.createStatement = jest.fn();

      await statementScheduler();

      expect(Client.find).toHaveBeenCalled();
      expect(statementsController.createStatement).not.toHaveBeenCalled();
      expect(emailHandler.sendStatementByEmail).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    test("Handles errors during scheduler execution", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-01-15T12:00:00.000Z"));

      const mockError = new Error("Database connection failed");
      Client.find.mockRejectedValue(mockError);

      await statementScheduler();

      expect(console.error).toHaveBeenCalledWith(
        "Error generating or sending monthly statements:",
        mockError
      );

      jest.useRealTimers();
    });

    test("Returns empty array when no clients match", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-01-25T12:00:00.000Z"));

      Client.find.mockResolvedValue([]);

      await statementScheduler();

      expect(Client.find).toHaveBeenCalledWith({
        clientStatementCreateDate: 25,
      });

      expect(statementsController.createStatement).not.toHaveBeenCalled();
      expect(emailHandler.sendStatementByEmail).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        "Monthly statements processing completed."
      );

      jest.useRealTimers();
    });

    test("Queries for last day of month clients correctly", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-01-31T12:00:00.000Z"));

      Client.find.mockResolvedValue([]);

      await statementScheduler();

      expect(Client.find).toHaveBeenCalledWith({
        $or: [
          { clientStatementCreateDate: 31 },
          { clientStatementCreateDate: { $gt: 31 } },
        ],
      });

      jest.useRealTimers();
    });

    test("Queries for mid-month clients correctly", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-02-15T12:00:00.000Z"));

      Client.find.mockResolvedValue([]);

      await statementScheduler();

      expect(Client.find).toHaveBeenCalledWith({
        clientStatementCreateDate: 15,
      });

      jest.useRealTimers();
    });

    test("Logs today's date and max days in month", async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-02-20T12:00:00.000Z"));

      Client.find.mockResolvedValue([]);

      await statementScheduler();

      expect(console.log).toHaveBeenCalledWith("Today is:", 20);
      expect(console.log).toHaveBeenCalledWith("Max days in this month:", 28);

      jest.useRealTimers();
    });
  });
});
