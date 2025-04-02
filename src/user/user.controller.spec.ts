import { Request, Response } from "express";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { Logger } from "@spinanda/__shared/infrastructure/logger";

describe("UserController", () => {
  let userController: UserController;
  let mockUserService: Partial<UserService>;
  let mockLogger: Partial<Logger>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockUserService = {
      getAllUsers: jest.fn().mockResolvedValue([
        {
          id: "7e5d01f8-0d80-11f0-bac5-0242ac160002",
          email: "user@example.com",
          name: "User",
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
      getUserById: jest.fn().mockResolvedValue({
        id: "7e5d01f8-0d80-11f0-bac5-0242ac160002",
        email: "user@example.com",
        name: "User",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      updateUser: jest.fn().mockResolvedValue({
        id: "7e5d01f8-0d80-11f0-bac5-0242ac160002",
        email: "user@example.com",
        name: "Updated User",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      deleteUser: jest.fn().mockResolvedValue({
        id: "7e5d01f8-0d80-11f0-bac5-0242ac160002",
        email: "user@example.com",
        name: "User",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };
    userController = new UserController(
      mockUserService as UserService,
      mockLogger as Logger
    );

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getAllUsers", () => {
    it("should return a list of users", async () => {
      await userController.getAllUsers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockUserService.getAllUsers).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            email: expect.any(String),
          }),
        ])
      );
    });

    it("should handle error during getAllUsers", async () => {
      (mockUserService.getAllUsers as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );

      await userController.getAllUsers(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error during get user list request")
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
  });

  describe("getUserById", () => {
    it("should return the user if found", async () => {
      mockRequest = {
        params: { id: "7e5d01f8-0d80-11f0-bac5-0242ac160002" },
      };

      await userController.getUserById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockUserService.getUserById).toHaveBeenCalledWith(
        "7e5d01f8-0d80-11f0-bac5-0242ac160002"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if user not found", async () => {
      (mockUserService.getUserById as jest.Mock).mockResolvedValueOnce(null);
      mockRequest = { params: { id: "non-existent-id" } };

      await userController.getUserById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    it("should handle error during getUserById", async () => {
      (mockUserService.getUserById as jest.Mock).mockRejectedValueOnce(
        new Error("Unexpected error")
      );
      mockRequest = { params: { id: "error-id" } };

      await userController.getUserById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error during get user request")
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
  });

  describe("updateUser", () => {
    it("should update the user and return updated data", async () => {
      mockRequest = {
        params: { id: "7e5d01f8-0d80-11f0-bac5-0242ac160002" },
        body: { name: "Updated User" },
      };

      await userController.updateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        "7e5d01f8-0d80-11f0-bac5-0242ac160002",
        { name: "Updated User" }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Updated User",
          email: expect.any(String),
        })
      );
    });

    it("should handle error during updateUser", async () => {
      (mockUserService.updateUser as jest.Mock).mockRejectedValueOnce(
        new Error("Update failed")
      );
      mockRequest = {
        params: { id: "7e5d01f8-0d80-11f0-bac5-0242ac160002" },
        body: { name: "Failed Update" },
      };

      await userController.updateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error during get user request")
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete the user and return success message", async () => {
      mockRequest = {
        params: { id: "7e5d01f8-0d80-11f0-bac5-0242ac160002" },
      };

      await userController.deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(
        "7e5d01f8-0d80-11f0-bac5-0242ac160002"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "User deleted successfully",
      });
    });

    it("should handle error during deleteUser", async () => {
      (mockUserService.deleteUser as jest.Mock).mockRejectedValueOnce(
        new Error("Delete failed")
      );
      mockRequest = { params: { id: "error-id" } };

      await userController.deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error during get user request")
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: expect.any(String),
      });
    });
  });
});
