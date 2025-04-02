import { AuthService } from "./auth.service";
import { PrismaClient } from "@prisma/client";
import { UserRoleEnum } from "@spinanda/__shared/domain/enum";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("AuthService", () => {
  let authService: AuthService;
  let prisma: PrismaClient;
  let bcryptCompareMock: jest.Mock;
  let bcryptHashMock: jest.Mock;
  let jwtSignMock: jest.Mock;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as PrismaClient;

    authService = new AuthService(prisma);

    bcryptCompareMock = bcrypt.compare as jest.Mock;
    bcryptHashMock = bcrypt.hash as jest.Mock;
    jwtSignMock = jwt.sign as jest.Mock;
  });

  describe("register", () => {
    it("should register a new user and hash the password", async () => {
      const userDto = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        role: UserRoleEnum.USER,
      };

      bcryptHashMock.mockResolvedValue("hashedpassword");
      (prisma.user.create as jest.Mock).mockResolvedValue({
        ...userDto,
        password: "hashedpassword",
      });

      const result = await authService.register(userDto);

      expect(result).toHaveProperty("email", userDto.email);
      expect(result).toHaveProperty("name", userDto.name);
      expect(bcryptHashMock).toHaveBeenCalledWith(userDto.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { ...userDto, password: "hashedpassword" },
      });
    });
  });

  describe("login", () => {
    it("should throw error if user not found", async () => {
      const loginDto = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        "Invalid email or password"
      );
    });

    it("should throw error if password is incorrect", async () => {
      const loginDto = { email: "test@example.com", password: "wrongpassword" };
      const mockUser = {
        id: "7e5d01f8-0d80-11f0-bac5-0242ac160002",
        email: "test@example.com",
        password: "hashedpassword",
        role: UserRoleEnum.USER,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      bcryptCompareMock.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        "Invalid email or password"
      );
    });

    it("should return token when credentials are correct", async () => {
      const loginDto = { email: "test@example.com", password: "password123" };
      const mockUser = {
        id: "7e5d01f8-0d80-11f0-bac5-0242ac160002",
        email: "test@example.com",
        password: "hashedpassword",
        role: "USER",
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      bcryptCompareMock.mockResolvedValue(true);
      jwtSignMock.mockReturnValue("token");

      const result = await authService.login(loginDto);

      expect(result).toHaveProperty("token", "token");
      expect(bcryptCompareMock).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password
      );
      expect(jwtSignMock).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
    });
  });

  describe("getUserProfile", () => {
    it("should throw error if user not found", async () => {
      const userId = "nonexistent-id";

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.getUserProfile(userId)).rejects.toThrow(
        "User not found"
      );
    });

    it("should return user profile if user exists", async () => {
      const userId = "7e5d01f8-0d80-11f0-bac5-0242ac160002";
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser); // Мокаем возвращение пользователя

      const result = await authService.getUserProfile(userId);

      expect(result).toEqual(mockUser);
    });
  });
});
