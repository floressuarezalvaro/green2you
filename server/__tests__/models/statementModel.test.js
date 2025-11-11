const Statement = require("../../models/statementModel");

describe("Statement Model", () => {
  describe("Schema validation", () => {
    test("Creates statement with all required fields", () => {
      const statementData = {
        clientId: "507f1f77bcf86cd799439011",
        invoiceData: [],
        historicalStatementsData: [],
        balanceData: [],
        clientPlan: "Premium",
        totalAmount: 150.75,
        issuedStartDate: new Date("2025-01-01"),
        issuedEndDate: new Date("2025-01-31"),
        creationMethod: "manual",
        isPaid: false,
        paidAmount: 0,
        user_id: "507f1f77bcf86cd799439012",
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeUndefined();
      expect(statement.clientId).toBe("507f1f77bcf86cd799439011");
      expect(statement.clientPlan).toBe("Premium");
      expect(statement.totalAmount).toBe(150.75);
      expect(statement.issuedStartDate).toEqual(new Date("2025-01-01"));
      expect(statement.issuedEndDate).toEqual(new Date("2025-01-31"));
      expect(statement.creationMethod).toBe("manual");
      expect(statement.isPaid).toBe(false);
      expect(statement.paidAmount).toBe(0);
      expect(statement.user_id).toBe("507f1f77bcf86cd799439012");
    });

    test("Accepts 'auto' as valid creationMethod", () => {
      const statementData = {
        clientId: "507f1f77bcf86cd799439011",
        invoiceData: [],
        clientPlan: "Basic",
        totalAmount: 100.0,
        issuedStartDate: new Date("2025-01-01"),
        issuedEndDate: new Date("2025-01-31"),
        creationMethod: "auto",
        isPaid: true,
        paidAmount: 100.0,
        user_id: "507f1f77bcf86cd799439012",
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeUndefined();
      expect(statement.creationMethod).toBe("auto");
    });

    test("Fails validation when clientId is missing", () => {
      const statementData = {
        invoiceData: [],
        clientPlan: "Premium",
        totalAmount: 150.75,
        issuedStartDate: new Date("2025-01-01"),
        issuedEndDate: new Date("2025-01-31"),
        creationMethod: "manual",
        isPaid: false,
        paidAmount: 0,
        user_id: "507f1f77bcf86cd799439012",
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.clientId).toBeDefined();
    });

    test("Fails validation when clientPlan is missing", () => {
      const statementData = {
        clientId: "507f1f77bcf86cd799439011",
        invoiceData: [],
        totalAmount: 150.75,
        issuedStartDate: new Date("2025-01-01"),
        issuedEndDate: new Date("2025-01-31"),
        creationMethod: "manual",
        isPaid: false,
        paidAmount: 0,
        user_id: "507f1f77bcf86cd799439012",
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.clientPlan).toBeDefined();
    });

    test("Fails validation when totalAmount is missing", () => {
      const statementData = {
        clientId: "507f1f77bcf86cd799439011",
        invoiceData: [],
        clientPlan: "Premium",
        issuedStartDate: new Date("2025-01-01"),
        issuedEndDate: new Date("2025-01-31"),
        creationMethod: "manual",
        isPaid: false,
        paidAmount: 0,
        user_id: "507f1f77bcf86cd799439012",
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.totalAmount).toBeDefined();
    });

    test("Fails validation when issuedStartDate is missing", () => {
      const statementData = {
        clientId: "507f1f77bcf86cd799439011",
        invoiceData: [],
        clientPlan: "Premium",
        totalAmount: 150.75,
        issuedEndDate: new Date("2025-01-31"),
        creationMethod: "manual",
        isPaid: false,
        paidAmount: 0,
        user_id: "507f1f77bcf86cd799439012",
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.issuedStartDate).toBeDefined();
    });

    test("Fails validation when issuedEndDate is missing", () => {
      const statementData = {
        clientId: "507f1f77bcf86cd799439011",
        invoiceData: [],
        clientPlan: "Premium",
        totalAmount: 150.75,
        issuedStartDate: new Date("2025-01-01"),
        creationMethod: "manual",
        isPaid: false,
        paidAmount: 0,
        user_id: "507f1f77bcf86cd799439012",
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.issuedEndDate).toBeDefined();
    });

    test("Fails validation when creationMethod is missing", () => {
      const statementData = {
        clientId: "507f1f77bcf86cd799439011",
        invoiceData: [],
        clientPlan: "Premium",
        totalAmount: 150.75,
        issuedStartDate: new Date("2025-01-01"),
        issuedEndDate: new Date("2025-01-31"),
        isPaid: false,
        paidAmount: 0,
        user_id: "507f1f77bcf86cd799439012",
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.creationMethod).toBeDefined();
    });

    test("Fails validation when creationMethod is not 'auto' or 'manual'", () => {
      const statementData = {
        clientId: "507f1f77bcf86cd799439011",
        invoiceData: [],
        clientPlan: "Premium",
        totalAmount: 150.75,
        issuedStartDate: new Date("2025-01-01"),
        issuedEndDate: new Date("2025-01-31"),
        creationMethod: "invalid_method",
        isPaid: false,
        paidAmount: 0,
        user_id: "507f1f77bcf86cd799439012",
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.creationMethod).toBeDefined();
      expect(validationError.errors.creationMethod.message).toContain(
        "is not a valid enum value"
      );
    });

    test("Fails validation when isPaid is missing", () => {
      const statementData = {
        clientId: "507f1f77bcf86cd799439011",
        invoiceData: [],
        clientPlan: "Premium",
        totalAmount: 150.75,
        issuedStartDate: new Date("2025-01-01"),
        issuedEndDate: new Date("2025-01-31"),
        creationMethod: "manual",
        paidAmount: 0,
        user_id: "507f1f77bcf86cd799439012",
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.isPaid).toBeDefined();
    });

    test("Fails validation when paidAmount is missing", () => {
      const statementData = {
        clientId: "507f1f77bcf86cd799439011",
        invoiceData: [],
        clientPlan: "Premium",
        totalAmount: 150.75,
        issuedStartDate: new Date("2025-01-01"),
        issuedEndDate: new Date("2025-01-31"),
        creationMethod: "manual",
        isPaid: false,
        user_id: "507f1f77bcf86cd799439012",
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.paidAmount).toBeDefined();
    });

    test("Fails validation when user_id is missing", () => {
      const statementData = {
        clientId: "507f1f77bcf86cd799439011",
        invoiceData: [],
        clientPlan: "Premium",
        totalAmount: 150.75,
        issuedStartDate: new Date("2025-01-01"),
        issuedEndDate: new Date("2025-01-31"),
        creationMethod: "manual",
        isPaid: false,
        paidAmount: 0,
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeDefined();
      expect(validationError.errors.user_id).toBeDefined();
    });

    test("Accepts optional checkNumber field", () => {
      const statementData = {
        clientId: "507f1f77bcf86cd799439011",
        invoiceData: [],
        clientPlan: "Premium",
        totalAmount: 150.75,
        issuedStartDate: new Date("2025-01-01"),
        issuedEndDate: new Date("2025-01-31"),
        creationMethod: "manual",
        isPaid: true,
        paidAmount: 150.75,
        checkNumber: "1234",
        user_id: "507f1f77bcf86cd799439012",
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeUndefined();
      expect(statement.checkNumber).toBe("1234");
    });

    test("Accepts optional checkDate field", () => {
      const statementData = {
        clientId: "507f1f77bcf86cd799439011",
        invoiceData: [],
        clientPlan: "Premium",
        totalAmount: 150.75,
        issuedStartDate: new Date("2025-01-01"),
        issuedEndDate: new Date("2025-01-31"),
        creationMethod: "manual",
        isPaid: true,
        paidAmount: 150.75,
        checkDate: new Date("2025-02-01"),
        user_id: "507f1f77bcf86cd799439012",
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeUndefined();
      expect(statement.checkDate).toEqual(new Date("2025-02-01"));
    });

    test("Handles statement with invoice data", () => {
      const statementData = {
        clientId: "507f1f77bcf86cd799439011",
        invoiceData: [
          {
            clientId: "507f1f77bcf86cd799439011",
            date: new Date("2025-01-15"),
            amount: 75.0,
            user_id: "507f1f77bcf86cd799439012",
          },
        ],
        clientPlan: "Premium",
        totalAmount: 75.0,
        issuedStartDate: new Date("2025-01-01"),
        issuedEndDate: new Date("2025-01-31"),
        creationMethod: "auto",
        isPaid: false,
        paidAmount: 0,
        user_id: "507f1f77bcf86cd799439012",
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeUndefined();
      expect(statement.invoiceData).toHaveLength(1);
      expect(statement.invoiceData[0].amount).toBe(75.0);
    });

    test("Handles statement with historical statements data", () => {
      const statementData = {
        clientId: "507f1f77bcf86cd799439011",
        invoiceData: [],
        historicalStatementsData: [
          {
            _id: "507f1f77bcf86cd799439999",
            issuedStartDate: new Date("2024-12-01"),
            issuedEndDate: new Date("2024-12-31"),
            totalAmount: 100.0,
            paidAmount: 100.0,
            checkNumber: "5678",
            checkDate: new Date("2025-01-05"),
          },
        ],
        clientPlan: "Premium",
        totalAmount: 150.75,
        issuedStartDate: new Date("2025-01-01"),
        issuedEndDate: new Date("2025-01-31"),
        creationMethod: "auto",
        isPaid: false,
        paidAmount: 0,
        user_id: "507f1f77bcf86cd799439012",
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeUndefined();
      expect(statement.historicalStatementsData).toHaveLength(1);
      expect(statement.historicalStatementsData[0].totalAmount).toBe(100.0);
    });

    test("Handles statement with balance data", () => {
      const statementData = {
        clientId: "507f1f77bcf86cd799439011",
        invoiceData: [],
        balanceData: [
          {
            currentBalance: 150.75,
            clientId: "507f1f77bcf86cd799439011",
          },
        ],
        clientPlan: "Premium",
        totalAmount: 150.75,
        issuedStartDate: new Date("2025-01-01"),
        issuedEndDate: new Date("2025-01-31"),
        creationMethod: "auto",
        isPaid: false,
        paidAmount: 0,
        user_id: "507f1f77bcf86cd799439012",
      };

      const statement = new Statement(statementData);
      const validationError = statement.validateSync();

      expect(validationError).toBeUndefined();
      expect(statement.balanceData).toHaveLength(1);
      expect(statement.balanceData[0].currentBalance).toBe(150.75);
    });
  });
});
