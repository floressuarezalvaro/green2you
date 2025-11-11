const bcrypt = require("bcrypt");
const validator = require("validator");

jest.mock("bcrypt");
jest.mock("validator");

const User = require("../../models/userModel");

describe("User Model", () => {
  describe("signup", () => {
    test("Successfully creates a new user with valid credentials", async () => {
      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        email: "newuser@test.com",
        password: "hashedPassword123",
        role: "admin",
      };

      validator.isEmail.mockReturnValue(true);
      validator.isStrongPassword.mockReturnValue(true);

      jest.spyOn(User, "findOne").mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("hashedPassword123");
      jest.spyOn(User, "create").mockResolvedValue(mockUser);

      const result = await User.signup(
        "newuser@test.com",
        "StrongPass123!",
        "admin"
      );

      expect(validator.isEmail).toHaveBeenCalledWith("newuser@test.com");
      expect(validator.isStrongPassword).toHaveBeenCalledWith("StrongPass123!");
      expect(User.findOne).toHaveBeenCalledWith({ email: "newuser@test.com" });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith("StrongPass123!", "salt");
      expect(User.create).toHaveBeenCalledWith({
        email: "newuser@test.com",
        password: "hashedPassword123",
        role: "admin",
      });
      expect(result).toEqual(mockUser);
    });

    test("Throws error when email is missing", async () => {
      await expect(User.signup("", "StrongPass123!", "admin")).rejects.toThrow(
        "Email or Password is missing"
      );
    });

    test("Throws error when password is missing", async () => {
      await expect(User.signup("user@test.com", "", "admin")).rejects.toThrow(
        "Email or Password is missing"
      );
    });

    test("Throws error when email is invalid", async () => {
      validator.isEmail.mockReturnValue(false);

      await expect(
        User.signup("invalid-email", "StrongPass123!", "admin")
      ).rejects.toThrow("This is not a valid email");

      expect(validator.isEmail).toHaveBeenCalledWith("invalid-email");
    });

    test("Throws error when password is not strong enough", async () => {
      validator.isEmail.mockReturnValue(true);
      validator.isStrongPassword.mockReturnValue(false);

      await expect(
        User.signup("user@test.com", "weak", "admin")
      ).rejects.toThrow("This password is not strong enough");

      expect(validator.isStrongPassword).toHaveBeenCalledWith("weak");
    });

    test("Throws error when email already exists", async () => {
      validator.isEmail.mockReturnValue(true);
      validator.isStrongPassword.mockReturnValue(true);

      const existingUser = {
        _id: "507f1f77bcf86cd799439011",
        email: "existing@test.com",
        role: "admin",
      };

      jest.spyOn(User, "findOne").mockResolvedValue(existingUser);

      await expect(
        User.signup("existing@test.com", "StrongPass123!", "admin")
      ).rejects.toThrow("Email exists");

      expect(User.findOne).toHaveBeenCalledWith({ email: "existing@test.com" });
    });
  });

  describe("login", () => {
    test("Successfully logs in user with valid credentials", async () => {
      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        email: "user@test.com",
        password: "hashedPassword123",
        role: "admin",
      };

      jest.spyOn(User, "findOne").mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await User.login("user@test.com", "correctPassword");

      expect(User.findOne).toHaveBeenCalledWith({ email: "user@test.com" });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "correctPassword",
        "hashedPassword123"
      );
      expect(result).toEqual(mockUser);
    });

    test("Throws error when email is missing", async () => {
      await expect(User.login("", "password123")).rejects.toThrow(
        "Email or Password is missing"
      );
    });

    test("Throws error when password is missing", async () => {
      await expect(User.login("user@test.com", "")).rejects.toThrow(
        "Email or Password is missing"
      );
    });

    test("Throws error when user does not exist", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(null);

      await expect(
        User.login("nonexistent@test.com", "password123")
      ).rejects.toThrow("Invalid login credential");

      expect(User.findOne).toHaveBeenCalledWith({
        email: "nonexistent@test.com",
      });
    });

    test("Throws error when password is incorrect", async () => {
      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        email: "user@test.com",
        password: "hashedPassword123",
        role: "admin",
      };

      jest.spyOn(User, "findOne").mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        User.login("user@test.com", "wrongPassword")
      ).rejects.toThrow("Invalid login credentials");

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrongPassword",
        "hashedPassword123"
      );
    });
  });

  describe("resetPassword", () => {
    describe("With token (forgot password flow)", () => {
      test("Successfully resets password with valid token", async () => {
        const mockUser = {
          _id: "507f1f77bcf86cd799439011",
          email: "user@test.com",
          password: "oldHashedPassword",
          resetPasswordToken: "validToken",
          resetPasswordExpires: Date.now() + 10000,
          save: jest.fn().mockResolvedValue(true),
        };

        jest.spyOn(User, "findOne").mockResolvedValue(mockUser);
        validator.isStrongPassword.mockReturnValue(true);
        bcrypt.genSalt.mockResolvedValue("newSalt");
        bcrypt.hash.mockResolvedValue("newHashedPassword");

        const result = await User.resetPassword(
          null,
          null,
          "NewStrongPass123!",
          "validToken"
        );

        expect(User.findOne).toHaveBeenCalledWith({
          resetPasswordToken: "validToken",
          resetPasswordExpires: { $gt: expect.any(Number) },
        });
        expect(validator.isStrongPassword).toHaveBeenCalledWith(
          "NewStrongPass123!"
        );
        expect(bcrypt.hash).toHaveBeenCalledWith(
          "NewStrongPass123!",
          "newSalt"
        );
        expect(mockUser.password).toBe("newHashedPassword");
        expect(mockUser.resetPasswordToken).toBeUndefined();
        expect(mockUser.resetPasswordExpires).toBeUndefined();
        expect(mockUser.save).toHaveBeenCalled();
        expect(result).toEqual(mockUser);
      });

      test("Throws error when token is invalid or expired", async () => {
        jest.spyOn(User, "findOne").mockResolvedValue(null);

        await expect(
          User.resetPassword(null, null, "NewStrongPass123!", "invalidToken")
        ).rejects.toThrow("Invalid or expired password reset token");
      });

      test("Throws error when new password is not strong enough", async () => {
        const mockUser = {
          _id: "507f1f77bcf86cd799439011",
          email: "user@test.com",
          resetPasswordToken: "validToken",
          resetPasswordExpires: Date.now() + 10000,
        };

        jest.spyOn(User, "findOne").mockResolvedValue(mockUser);
        validator.isStrongPassword.mockReturnValue(false);

        await expect(
          User.resetPassword(null, null, "weak", "validToken")
        ).rejects.toThrow("New password is not strong enough");
      });
    });

    describe("Without token (authenticated user changing password)", () => {
      test("Successfully resets password with correct old password", async () => {
        const mockUser = {
          _id: "507f1f77bcf86cd799439011",
          email: "user@test.com",
          password: "oldHashedPassword",
          save: jest.fn().mockResolvedValue(true),
        };

        jest.spyOn(User, "findOne").mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        validator.isStrongPassword.mockReturnValue(true);
        bcrypt.genSalt.mockResolvedValue("newSalt");
        bcrypt.hash.mockResolvedValue("newHashedPassword");

        const result = await User.resetPassword(
          "user@test.com",
          "OldPass123!",
          "NewStrongPass123!"
        );

        expect(User.findOne).toHaveBeenCalledWith({ email: "user@test.com" });
        expect(bcrypt.compare).toHaveBeenCalledWith(
          "OldPass123!",
          "oldHashedPassword"
        );
        expect(validator.isStrongPassword).toHaveBeenCalledWith(
          "NewStrongPass123!"
        );
        expect(mockUser.password).toBe("newHashedPassword");
        expect(mockUser.save).toHaveBeenCalled();
        expect(result).toEqual(mockUser);
      });

      test("Throws error when email is missing", async () => {
        await expect(
          User.resetPassword("", "OldPass123!", "NewStrongPass123!")
        ).rejects.toThrow("All fields are required");
      });

      test("Throws error when old password is missing", async () => {
        await expect(
          User.resetPassword("user@test.com", "", "NewStrongPass123!")
        ).rejects.toThrow("All fields are required");
      });

      test("Throws error when new password is missing", async () => {
        await expect(
          User.resetPassword("user@test.com", "OldPass123!", "")
        ).rejects.toThrow("All fields are required");
      });

      test("Throws error when user does not exist", async () => {
        jest.spyOn(User, "findOne").mockResolvedValue(null);

        await expect(
          User.resetPassword(
            "nonexistent@test.com",
            "OldPass123!",
            "NewStrongPass123!"
          )
        ).rejects.toThrow("Invalid login credential");
      });

      test("Throws error when old password is incorrect", async () => {
        const mockUser = {
          _id: "507f1f77bcf86cd799439011",
          email: "user@test.com",
          password: "oldHashedPassword",
        };

        jest.spyOn(User, "findOne").mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        await expect(
          User.resetPassword(
            "user@test.com",
            "WrongOldPass!",
            "NewStrongPass123!"
          )
        ).rejects.toThrow("Old password is incorrect");
      });

      test("Throws error when new password is not strong enough", async () => {
        const mockUser = {
          _id: "507f1f77bcf86cd799439011",
          email: "user@test.com",
          password: "oldHashedPassword",
        };

        jest.spyOn(User, "findOne").mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        validator.isStrongPassword.mockReturnValue(false);

        await expect(
          User.resetPassword("user@test.com", "OldPass123!", "weak")
        ).rejects.toThrow("New password is not strong enough");
      });
    });
  });

  describe("forgotPassword", () => {
    test("Successfully generates reset token for valid email", async () => {
      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        email: "user@test.com",
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, "findOne").mockResolvedValue(mockUser);
      jest.spyOn(Math, "random").mockReturnValue(0.123456789);

      const token = await User.forgotPassword("user@test.com");

      expect(User.findOne).toHaveBeenCalledWith({ email: "user@test.com" });
      expect(mockUser.resetPasswordToken).toBeDefined();
      expect(mockUser.resetPasswordExpires).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    test("Throws error when email is missing", async () => {
      await expect(User.forgotPassword("")).rejects.toThrow(
        "Email is required"
      );
    });

    test("Throws error when user with email does not exist", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(null);

      await expect(User.forgotPassword("nonexistent@test.com")).rejects.toThrow(
        "Invalid Email"
      );

      expect(User.findOne).toHaveBeenCalledWith({
        email: "nonexistent@test.com",
      });
    });

    test("Sets resetPasswordExpires to 24 hours from now", async () => {
      const mockUser = {
        _id: "507f1f77bcf86cd799439011",
        email: "user@test.com",
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, "findOne").mockResolvedValue(mockUser);
      const now = Date.now();

      await User.forgotPassword("user@test.com");

      expect(mockUser.resetPasswordExpires).toBeGreaterThanOrEqual(
        now + 86400000 - 1000
      );
      expect(mockUser.resetPasswordExpires).toBeLessThanOrEqual(
        now + 86400000 + 1000
      );
    });
  });

  describe("signupClient", () => {
    test("Successfully creates a client user with valid email", async () => {
      const clientId = "507f1f77bcf86cd799439011";
      const mockUser = {
        _id: clientId,
        email: "client@test.com",
        role: "client",
      };

      validator.isEmail.mockReturnValue(true);
      jest.spyOn(User, "findOne").mockResolvedValue(null);
      jest.spyOn(User, "create").mockResolvedValue(mockUser);

      const result = await User.signupClient("client@test.com", clientId);

      expect(validator.isEmail).toHaveBeenCalledWith("client@test.com");
      expect(User.findOne).toHaveBeenCalledWith({ email: "client@test.com" });
      expect(User.create).toHaveBeenCalledWith({
        _id: clientId,
        email: "client@test.com",
        role: "client",
      });
      expect(result).toEqual(mockUser);
    });

    test("Throws error when email is missing", async () => {
      await expect(
        User.signupClient("", "507f1f77bcf86cd799439011")
      ).rejects.toThrow("Email is missing");
    });

    test("Throws error when email is invalid", async () => {
      validator.isEmail.mockReturnValue(false);

      await expect(
        User.signupClient("invalid-email", "507f1f77bcf86cd799439011")
      ).rejects.toThrow("This is not a valid email");

      expect(validator.isEmail).toHaveBeenCalledWith("invalid-email");
    });

    test("Throws error when email already exists", async () => {
      const existingUser = {
        _id: "507f1f77bcf86cd799439011",
        email: "existing@test.com",
        role: "client",
      };

      validator.isEmail.mockReturnValue(true);
      jest.spyOn(User, "findOne").mockResolvedValue(existingUser);

      await expect(
        User.signupClient("existing@test.com", "507f1f77bcf86cd799439012")
      ).rejects.toThrow("Email exists");

      expect(User.findOne).toHaveBeenCalledWith({ email: "existing@test.com" });
    });
  });
});
