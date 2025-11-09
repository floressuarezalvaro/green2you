const EmailTracker = require("../../models/emailTrackerModel");

jest.mock("../../models/emailTrackerModel");
jest.mock("../../utils/PDFCreator", () => ({
  generateStatementPDF: jest.fn(),
}));

const mockSendMail = jest.fn();
const mockTransporter = {
  sendMail: mockSendMail,
};
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(() => mockTransporter),
}));

const { sendEmail, sendStatementByEmail } = require("../../utils/emailHandler");
const { generateStatementPDF } = require("../../utils/PDFCreator");

describe("Email Handler Utils", () => {
  const validUserId = "507f1f77bcf86cd799439011";

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});

    mockSendMail.mockResolvedValue({ messageId: "test-message-id" });

    process.env.EMAIL_USER = "test@gmail.com";
    process.env.EMAIL_PASS = "test-password";

    generateStatementPDF.mockClear();
  });

  describe("sendEmail", () => {
    test("Successfully sends email without attachment", async () => {
      const mockSave = jest.fn().mockResolvedValue({});
      EmailTracker.mockImplementation(() => ({
        save: mockSave,
      }));

      await sendEmail(
        "Test Type",
        "recipient@example.com",
        "Test Subject",
        "Test message body",
        null,
        validUserId
      );

      expect(mockSendMail).toHaveBeenCalledWith({
        from: "test@gmail.com",
        to: "recipient@example.com",
        subject: "Test Subject",
        text: "Test message body",
        attachments: [],
      });

      expect(EmailTracker).toHaveBeenCalledWith({
        emailType: "Test Type",
        emailTo: "recipient@example.com",
        emailSubject: "Test Subject",
        emailText: "Test message body",
        emailSuccess: true,
        emailError: null,
        user_id: validUserId,
      });

      expect(mockSave).toHaveBeenCalled();
    });

    test("Successfully sends email with attachment", async () => {
      const mockAttachment = {
        filename: "test.pdf",
        content: Buffer.from("test content"),
        contentType: "application/pdf",
      };

      const mockSave = jest.fn().mockResolvedValue({});
      EmailTracker.mockImplementation(() => ({
        save: mockSave,
      }));

      await sendEmail(
        "Statement",
        "recipient@example.com",
        "Monthly Statement",
        "Please find attached",
        mockAttachment,
        validUserId
      );

      expect(mockSendMail).toHaveBeenCalledWith({
        from: "test@gmail.com",
        to: "recipient@example.com",
        subject: "Monthly Statement",
        text: "Please find attached",
        attachments: [mockAttachment],
      });

      expect(EmailTracker).toHaveBeenCalledWith({
        emailType: "Statement",
        emailTo: "recipient@example.com",
        emailSubject: "Monthly Statement",
        emailText: "Please find attached",
        emailSuccess: true,
        emailError: null,
        user_id: validUserId,
      });

      expect(mockSave).toHaveBeenCalled();
    });

    test("Logs error when email sending fails", async () => {
      const mockError = new Error("SMTP connection failed");

      mockSendMail.mockRejectedValue(mockError);

      const mockSave = jest.fn().mockResolvedValue({});
      EmailTracker.mockImplementation(() => ({
        save: mockSave,
      }));

      await sendEmail(
        "Test Type",
        "recipient@example.com",
        "Test Subject",
        "Test message body",
        null,
        validUserId
      );

      expect(mockSendMail).toHaveBeenCalled();

      expect(EmailTracker).toHaveBeenCalledWith({
        emailType: "Test Type",
        emailTo: "recipient@example.com",
        emailSubject: "Test Subject",
        emailText: "Test message body",
        emailSuccess: false,
        emailError: "SMTP connection failed",
        user_id: validUserId,
      });

      expect(mockSave).toHaveBeenCalled();
    });

    test("Sends email without user_id (unauthenticated flows)", async () => {
      const mockSave = jest.fn().mockResolvedValue({});
      EmailTracker.mockImplementation(() => ({
        save: mockSave,
      }));

      await sendEmail(
        "Password Reset",
        "user@example.com",
        "Reset Password",
        "Click link to reset",
        null,
        null
      );

      expect(mockSendMail).toHaveBeenCalled();

      expect(EmailTracker).toHaveBeenCalledWith({
        emailType: "Password Reset",
        emailTo: "user@example.com",
        emailSubject: "Reset Password",
        emailText: "Click link to reset",
        emailSuccess: true,
        emailError: null,
        user_id: null,
      });

      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe("sendStatementByEmail", () => {
    test("Successfully sends statement email with PDF attachment", async () => {
      const statementId = "507f1f77bcf86cd799439012";
      const clientEmail = "client@example.com";

      const mockPDFBuffer = Buffer.from("mock pdf content");
      generateStatementPDF.mockResolvedValue({
        buffer: mockPDFBuffer,
        filename: "ClientName(Jan 1-Jan 31).pdf",
      });

      const mockSave = jest.fn().mockResolvedValue({});
      EmailTracker.mockImplementation(() => ({
        save: mockSave,
      }));

      await sendStatementByEmail(clientEmail, statementId, validUserId);

      expect(generateStatementPDF).toHaveBeenCalledWith(statementId);

      expect(mockSendMail).toHaveBeenCalledWith({
        from: "test@gmail.com",
        to: clientEmail,
        subject: "Re: Green 2 You Billing",
        text: "Please find attached your monthly statement.",
        attachments: [
          {
            filename: "ClientName(Jan 1-Jan 31).pdf",
            content: expect.any(Buffer),
            contentType: "application/pdf",
          },
        ],
      });

      expect(console.log).toHaveBeenCalledWith(
        `Statement sent by email to: ${clientEmail}`
      );
    });

    test("Logs error when PDF generation fails", async () => {
      const statementId = "507f1f77bcf86cd799439012";
      const clientEmail = "client@example.com";
      const mockError = new Error("Statement not found");

      generateStatementPDF.mockRejectedValue(mockError);

      await sendStatementByEmail(clientEmail, statementId, validUserId);

      expect(generateStatementPDF).toHaveBeenCalled();
      expect(mockSendMail).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        `Error sending statement to ${clientEmail}:`,
        mockError
      );
    });

    test("Logs error when email sending fails after successful PDF generation", async () => {
      const statementId = "507f1f77bcf86cd799439012";
      const clientEmail = "client@example.com";

      const mockPDFBuffer = Buffer.from("mock pdf content");
      generateStatementPDF.mockResolvedValue({
        buffer: mockPDFBuffer,
        filename: "test.pdf",
      });
      mockSendMail.mockRejectedValue(new Error("Email send failed"));

      const mockSave = jest.fn().mockResolvedValue({});
      EmailTracker.mockImplementation(() => ({
        save: mockSave,
      }));

      await sendStatementByEmail(clientEmail, statementId, validUserId);

      expect(generateStatementPDF).toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalled();

      expect(EmailTracker).toHaveBeenCalledWith(
        expect.objectContaining({
          emailSuccess: false,
          emailError: "Email send failed",
        })
      );
    });
  });
});
