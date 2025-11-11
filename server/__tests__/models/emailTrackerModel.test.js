const EmailTracker = require("../../models/emailTrackerModel");

describe("EmailTracker Model", () => {
  describe("Schema validation", () => {
    test("Creates email tracker with all required fields", () => {
      const emailData = {
        emailType: "Statement",
        emailTo: "client@test.com",
        emailSubject: "Monthly Statement",
        emailText: "Please find your statement attached",
        emailSuccess: true,
      };

      const emailTracker = new EmailTracker(emailData);
      const validationError = emailTracker.validateSync();

      expect(validationError).toBeUndefined();
      expect(emailTracker.emailType).toBe("Statement");
      expect(emailTracker.emailTo).toBe("client@test.com");
      expect(emailTracker.emailSubject).toBe("Monthly Statement");
      expect(emailTracker.emailText).toBe(
        "Please find your statement attached"
      );
      expect(emailTracker.emailSuccess).toBe(true);
    });

    test("Fails validation when emailType is missing", () => {
      const emailData = {
        emailTo: "client@test.com",
        emailSubject: "Monthly Statement",
        emailText: "Please find your statement attached",
        emailSuccess: true,
      };

      const emailTracker = new EmailTracker(emailData);
      const validationError = emailTracker.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.emailType).toBeDefined();
    });

    test("Fails validation when emailTo is missing", () => {
      const emailData = {
        emailType: "Statement",
        emailSubject: "Monthly Statement",
        emailText: "Please find your statement attached",
        emailSuccess: true,
      };

      const emailTracker = new EmailTracker(emailData);
      const validationError = emailTracker.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.emailTo).toBeDefined();
    });

    test("Fails validation when emailSubject is missing", () => {
      const emailData = {
        emailType: "Statement",
        emailTo: "client@test.com",
        emailText: "Please find your statement attached",
        emailSuccess: true,
      };

      const emailTracker = new EmailTracker(emailData);
      const validationError = emailTracker.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.emailSubject).toBeDefined();
    });

    test("Fails validation when emailText is missing", () => {
      const emailData = {
        emailType: "Statement",
        emailTo: "client@test.com",
        emailSubject: "Monthly Statement",
        emailSuccess: true,
      };

      const emailTracker = new EmailTracker(emailData);
      const validationError = emailTracker.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.emailText).toBeDefined();
    });

    test("Fails validation when emailSuccess is missing", () => {
      const emailData = {
        emailType: "Statement",
        emailTo: "client@test.com",
        emailSubject: "Monthly Statement",
        emailText: "Please find your statement attached",
      };

      const emailTracker = new EmailTracker(emailData);
      const validationError = emailTracker.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.emailSuccess).toBeDefined();
    });

    test("Accepts optional emailError field", () => {
      const emailData = {
        emailType: "Statement",
        emailTo: "client@test.com",
        emailSubject: "Monthly Statement",
        emailText: "Please find your statement attached",
        emailSuccess: false,
        emailError: "SMTP connection failed",
      };

      const emailTracker = new EmailTracker(emailData);
      const validationError = emailTracker.validateSync();

      expect(validationError).toBeUndefined();
      expect(emailTracker.emailError).toBe("SMTP connection failed");
    });

    test("Accepts optional user_id field", () => {
      const emailData = {
        emailType: "Statement",
        emailTo: "client@test.com",
        emailSubject: "Monthly Statement",
        emailText: "Please find your statement attached",
        emailSuccess: true,
        user_id: "507f1f77bcf86cd799439011",
      };

      const emailTracker = new EmailTracker(emailData);
      const validationError = emailTracker.validateSync();

      expect(validationError).toBeUndefined();
      expect(emailTracker.user_id).toBe("507f1f77bcf86cd799439011");
    });

    test("Creates email tracker without optional fields", () => {
      const emailData = {
        emailType: "Welcome",
        emailTo: "newuser@test.com",
        emailSubject: "Welcome!",
        emailText: "Welcome to our service",
        emailSuccess: true,
      };

      const emailTracker = new EmailTracker(emailData);
      const validationError = emailTracker.validateSync();

      expect(validationError).toBeUndefined();
      expect(emailTracker.emailError).toBeUndefined();
      expect(emailTracker.user_id).toBeUndefined();
    });

    test("Tracks failed email with error message", () => {
      const emailData = {
        emailType: "Password Reset",
        emailTo: "user@test.com",
        emailSubject: "Reset Your Password",
        emailText: "Click the link to reset your password",
        emailSuccess: false,
        emailError: "Invalid email address",
      };

      const emailTracker = new EmailTracker(emailData);
      const validationError = emailTracker.validateSync();

      expect(validationError).toBeUndefined();
      expect(emailTracker.emailSuccess).toBe(false);
      expect(emailTracker.emailError).toBe("Invalid email address");
    });

    test("Handles multiple email types", () => {
      const emailTypes = [
        "Statement",
        "Welcome",
        "Password Reset",
        "Invoice",
        "Notification",
      ];

      emailTypes.forEach((type) => {
        const emailData = {
          emailType: type,
          emailTo: "test@test.com",
          emailSubject: "Test",
          emailText: "Test email",
          emailSuccess: true,
        };

        const emailTracker = new EmailTracker(emailData);
        const validationError = emailTracker.validateSync();

        expect(validationError).toBeUndefined();
        expect(emailTracker.emailType).toBe(type);
      });
    });

    test("Handles null user_id for unauthenticated emails", () => {
      const emailData = {
        emailType: "Password Reset",
        emailTo: "user@test.com",
        emailSubject: "Reset Password",
        emailText: "Click to reset",
        emailSuccess: true,
        user_id: null,
      };

      const emailTracker = new EmailTracker(emailData);
      const validationError = emailTracker.validateSync();

      expect(validationError).toBeUndefined();
      expect(emailTracker.user_id).toBeNull();
    });

    test("Tracks email with long text content", () => {
      const longText = "A".repeat(5000);
      const emailData = {
        emailType: "Newsletter",
        emailTo: "subscriber@test.com",
        emailSubject: "Monthly Newsletter",
        emailText: longText,
        emailSuccess: true,
      };

      const emailTracker = new EmailTracker(emailData);
      const validationError = emailTracker.validateSync();

      expect(validationError).toBeUndefined();
      expect(emailTracker.emailText).toBe(longText);
      expect(emailTracker.emailText.length).toBe(5000);
    });
  });
});
