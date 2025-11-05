const mongoose = require("mongoose");

const Client = require("../../models/clientModel");
const emailTracker = require("../../models/emailTrackerModel");
const Statement = require("../../models/statementModel");

const emailController = require("../../controllers/emailController");

const { sendStatementByEmail } = require("../../utils/emailHandler");

jest.mock("../../models/emailTrackerModel");
jest.mock("../../models/clientModel");
jest.mock("../../models/statementModel");
jest.mock("../../utils/emailHandler");

describe("Email controller", () => {
  let req, res, mockEmails;
  const validId = new mongoose.Types.ObjectId().toString();
  const validId2 = new mongoose.Types.ObjectId().toString();
  const errorMessage = "System could not process";

  const dateToday = new Date();
  const date60DaysAgo = new Date(dateToday.setDate(dateToday.getDate() - 60));

  beforeEach(() => {
    req = {
      query: {},
      body: {},
      user: {
        _id: validId,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("Get emails", () => {
    test("Successfully gets all emails", async () => {
      mockEmails = [
        {
          _id: validId,
          emailType: "Monthly Statement",
          emailTo: "test1@gmail.com",
          emailSubject: "Re: Green 2 You Billing",
          emailText: "Please find attached your monthly statement.",
          emailSuccess: true,
          emailError: null,
          createdAt: dateToday,
          updatedAt: dateToday,
          __v: 0,
        },
        {
          _id: validId2,
          emailType: "Monthly Statement",
          emailTo: "test2@gmail.com",
          emailSubject: "Re: Green 2 You Billing",
          emailText: "Please find attached your monthly statement.",
          emailSuccess: true,
          emailError: null,
          createdAt: date60DaysAgo,
          updatedAt: date60DaysAgo,
          __v: 0,
        },
      ];

      const mockSort = jest.fn().mockResolvedValue(mockEmails);
      emailTracker.find.mockReturnValue({ sort: mockSort });

      await emailController.getAllEmails(req, res);

      expect(emailTracker.find).toHaveBeenCalledWith({ user_id: validId });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toBeCalledWith(200);
      expect(res.json).toBeCalledWith(mockEmails);
    });

    test("Gets emails over the last 30 days", async () => {
      req.query.days = 30;

      const mockEmails = [
        {
          _id: validId,
          emailType: "Monthly Statement",
          emailTo: "test1@gmail.com",
          emailSubject: "Re: Green 2 You Billing",
          emailText: "Please find attached your monthly statement.",
          emailSuccess: true,
          emailError: null,
          createdAt: dateToday,
          updatedAt: dateToday,
          __v: 0,
        },
      ];
      const mockSort = jest.fn().mockResolvedValue(mockEmails);
      emailTracker.find.mockReturnValue({ sort: mockSort });

      await emailController.getAllEmails(req, res);

      expect(emailTracker.find).toHaveBeenCalled();
      const filterArg = emailTracker.find.mock.calls[0][0];
      expect(filterArg).toHaveProperty("user_id", validId);
      expect(filterArg).toHaveProperty("createdAt");
      expect(filterArg.createdAt).toHaveProperty("$gte");
      expect(filterArg.createdAt.$gte).toBeInstanceOf(Date);

      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEmails);
    });

    test("Ignores invalid day parameters", async () => {
      req.query.days = "invalid-days";

      mockEmails = [];

      const mockSort = jest.fn().mockResolvedValue(mockEmails);
      emailTracker.find.mockReturnValue({ sort: mockSort });

      await emailController.getAllEmails(req, res);

      expect(emailTracker.find).toHaveBeenCalledWith({ user_id: validId });
      expect(res.status).toBeCalledWith(200);
      expect(res.json).toBeCalledWith(mockEmails);
    });

    test("Returns a 500 error if system could not process", async () => {
      const mockSort = jest.fn().mockRejectedValue(new Error(errorMessage));
      emailTracker.find.mockReturnValue({ sort: mockSort });

      await emailController.getAllEmails(req, res);

      expect(emailTracker.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal server error",
        message: errorMessage,
      });
    });
  });

  describe("Send manual statement email", () => {
    test("Successfully sends email", async () => {
      req.body = { clientEmail: "test@gmail.com", statementId: validId };

      Client.exists.mockResolvedValue(true);
      Statement.exists.mockResolvedValue(true);
      sendStatementByEmail.mockResolvedValue();

      await emailController.sendManualStatementEmail(req, res);

      expect(Client.exists).toHaveBeenCalledWith({
        clientEmail: "test@gmail.com",
      });
      expect(Statement.exists).toHaveBeenCalledWith({ _id: validId });
      expect(sendStatementByEmail).toHaveBeenCalledWith(
        "test@gmail.com",
        validId,
        validId
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email sent successfully",
      });
    });

    test("Returns 400 when clientEmail is missing", async () => {
      req.body = {
        statementId: validId,
      };

      await emailController.sendManualStatementEmail(req, res);

      expect(Client.exists).not.toHaveBeenCalled();
      expect(Statement.exists).not.toHaveBeenCalled();
      expect(sendStatementByEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: ["clientEmail"],
      });
    });

    test("Returns 400 when statementId is missing", async () => {
      req.body = {
        clientEmail: "test@gmail.com",
      };

      await emailController.sendManualStatementEmail(req, res);

      expect(Client.exists).not.toHaveBeenCalled();
      expect(Statement.exists).not.toHaveBeenCalled();
      expect(sendStatementByEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: ["statementId"],
      });
    });
    test("Returns 400 when clientEmail and statementId fields are missing", async () => {
      await emailController.sendManualStatementEmail(req, res);

      expect(Client.exists).not.toHaveBeenCalled();
      expect(Statement.exists).not.toHaveBeenCalled();
      expect(sendStatementByEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please check the highlighted fields and try again.",
        emptyFields: ["clientEmail", "statementId"],
      });
    });
    test("Returns 400 when clientEmail is not a valid email", async () => {
      req.body = { clientEmail: "test", statementId: validId };

      await emailController.sendManualStatementEmail(req, res);

      expect(Client.exists).not.toHaveBeenCalled();
      expect(Statement.exists).not.toHaveBeenCalled();
      expect(sendStatementByEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "This is not a valid email",
      });
    });
    test("Returns 404 when client email is not found", async () => {
      req.body = { clientEmail: "test@gmail.com", statementId: validId };

      Client.exists.mockResolvedValue(false);

      await emailController.sendManualStatementEmail(req, res);

      expect(Client.exists).toHaveBeenCalledWith({
        clientEmail: "test@gmail.com",
      });
      expect(Statement.exists).not.toHaveBeenCalled();
      expect(sendStatementByEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Client email not found",
      });
    });
    test("Returns 404 when statement is not found", async () => {
      req.body = { clientEmail: "test@gmail.com", statementId: validId };

      Client.exists.mockResolvedValue(true);
      Statement.exists.mockResolvedValue(false);

      await emailController.sendManualStatementEmail(req, res);

      expect(Client.exists).toHaveBeenCalled();
      expect(Statement.exists).toHaveBeenCalled();
      expect(sendStatementByEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Statement not found",
      });
    });
    test("Returns 500 when email sending fails", async () => {
      req.body = { clientEmail: "test@gmail.com", statementId: validId };

      Client.exists.mockResolvedValue(true);
      Statement.exists.mockResolvedValue(true);
      sendStatementByEmail.mockRejectedValue(new Error(errorMessage));

      await emailController.sendManualStatementEmail(req, res);

      expect(Client.exists).toHaveBeenCalled();
      expect(Statement.exists).toHaveBeenCalled();
      expect(sendStatementByEmail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to send email",
        error: new Error(errorMessage),
      });
    });
    test("Returns 500 when database query fails", async () => {
      req.body = { clientEmail: "test@gmail.com", statementId: validId };

      Client.exists.mockResolvedValue(new Error(errorMessage));

      await emailController.sendManualStatementEmail(req, res);

      expect(Client.exists).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to send email",
        error: new Error(errorMessage),
      });
    });
  });
});
