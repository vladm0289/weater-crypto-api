import "reflect-metadata";
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import { UserService } from "./user.service";

jest.mock("bcrypt", () => ({
  hash: jest.fn((password: string, salt: number) =>
    Promise.resolve(`hashed-${password}`)
  ),
}));

describe("UserService", () => {
  let prisma: PrismaClient;
  let userService: UserService;

  beforeEach(() => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as PrismaClient;
    userService = new UserService(prisma);
  });

  test("should get all users", async () => {
    const mockUsers = [
      {
        id: "1",
        email: "user1@example.com",
        name: "User One",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
    const users = await userService.getAllUsers();
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    expect(users).toEqual(mockUsers);
  });

  test("should get a user by id", async () => {
    const userId = "7e5d01f8-0d80-11f0-bac5-0242ac160002";
    const mockUser = {
      id: userId,
      email: "user1@example.com",
      name: "User One",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const user = await userService.getUserById(userId);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    expect(user).toEqual(mockUser);
  });

  test("should update a user without password", async () => {
    const userId = "7e5d01f8-0d80-11f0-bac5-0242ac160002";
    const updateData: Partial<User> = { name: "New Name" };
    const updatedUser = { id: userId, ...updateData } as User;
    (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);
    const result = await userService.updateUser(userId, updateData);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: updateData,
    });
    expect(result).toEqual(updatedUser);
  });

  test("should update a user with password", async () => {
    const userId = "7e5d01f8-0d80-11f0-bac5-0242ac160002";
    const plainPassword = "mypassword";
    const updateData: Partial<User> = {
      password: plainPassword,
      name: "Updated Name",
    };
    const updatedUser = {
      id: userId,
      ...updateData,
      password: `hashed-${plainPassword}`,
    } as User;
    (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);
    const result = await userService.updateUser(userId, updateData);
    expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { ...updateData, password: `hashed-${plainPassword}` },
    });
    expect(result).toEqual(updatedUser);
  });

  test("should delete a user", async () => {
    const userId = "7e5d01f8-0d80-11f0-bac5-0242ac160002";
    const deletedUser = {
      id: userId,
      email: "user@example.com",
      name: "User",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    (prisma.user.delete as jest.Mock).mockResolvedValue(deletedUser);
    const result = await userService.deleteUser(userId);
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: userId },
    });
    expect(result).toEqual(deletedUser);
  });
});
