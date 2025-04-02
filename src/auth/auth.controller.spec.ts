import "reflect-metadata";
import { Request, Response } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Logger } from "@spinanda/__shared/infrastructure/logger";
import { IRequest } from "@spinanda/__shared/domain/interface";
import { UserRoleEnum } from "@spinanda/__shared/domain/enum";

describe("AuthController", () => {
  let authController: AuthController;
  let mockAuthService: Partial<AuthService>;
  let mockLogger: Partial<Logger>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockAuthService = {
      login: jest.fn().mockResolvedValue({ token: "fake-jwt-token" }),
      register: jest.fn().mockResolvedValue({
        id: "7e5d01f8-0d80-11f0-bac5-0242ac160002",
        email: "test@example.com",
        name: "Test User",
      }),
      getUserProfile: jest.fn().mockResolvedValue({
        id: "user-id",
        email: "user@example.com",
        name: "User",
      }),
    };
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };
    authController = new AuthController(
      mockAuthService as AuthService,
      mockLogger as Logger
    );
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("login", () => {
    it("should authenticate user and return a token", async () => {
      mockRequest = {
        body: { email: "test@example.com", password: "password123" },
      };

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        token: "fake-jwt-token",
      });
    });

    it("should handle login error", async () => {
      const error = new Error("Invalid credentials");
      (mockAuthService.login as jest.Mock).mockRejectedValue(error);

      mockRequest = {
        body: { email: "test@example.com", password: "wrongpass" },
      };

      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error during login request, ${error.message}`
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
  });

  describe("register", () => {
    it("should register a new user and return user data", async () => {
      mockRequest = {
        body: {
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        },
      };

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockAuthService.register).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "7e5d01f8-0d80-11f0-bac5-0242ac160002",
          email: "test@example.com",
          name: "Test User",
        })
      );
    });

    it("should handle registration error", async () => {
      const error = new Error("User already exists");
      (mockAuthService.register as jest.Mock).mockRejectedValue(error);

      mockRequest = {
        body: {
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        },
      };

      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error during registration request, ${error.message}`
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
  });

  describe("profile", () => {
    it("should return user profile when user exists", async () => {
      const mockRequest = {
        user: {
          id: "user-id",
          role: UserRoleEnum.ADMIN,
          email: "test@gmail.com",
        },
      };

      await authController.profile(
        mockRequest as IRequest,
        mockResponse as Response
      );

      expect(mockAuthService.getUserProfile).toHaveBeenCalledWith("user-id");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: "user-id",
        email: "user@example.com",
        name: "User",
      });
    });

    it("should return 404 if user not found", async () => {
      (mockAuthService.getUserProfile as jest.Mock).mockResolvedValue(null);

      const mockRequest = {
        user: { id: "non-existing-id" },
      };

      await authController.profile(
        mockRequest as IRequest,
        mockResponse as Response
      );

      expect(mockAuthService.getUserProfile).toHaveBeenCalledWith(
        "non-existing-id"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    it("should handle profile error", async () => {
      const error = new Error("Database error");
      (mockAuthService.getUserProfile as jest.Mock).mockRejectedValue(error);

      const mockRequest = {
        user: { id: "user-id" },
      };

      await authController.profile(
        mockRequest as IRequest,
        mockResponse as Response
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error during profile request, ${error.message}`
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
  });
});
