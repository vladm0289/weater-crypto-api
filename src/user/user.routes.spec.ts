import "reflect-metadata";
import request from "supertest";
import express from "express";
import router from "./user.routes";

jest.mock("@spinanda/__shared/domain/middleware", () => ({
  validateAuth: () => (req, res, next) => next(),
  validateRole: () => (req, res, next) => next(),
  validateParamsUuid: () => (req, res, next) => next(),
  validateDto: () => (req, res, next) => next(),
}));

jest.mock("./user.controller", () => {
  const getAllUsers = jest.fn((req, res) =>
    res.status(200).json(["user1", "user2"])
  );
  const getUserById = jest.fn((req, res) =>
    res.status(200).json({ id: req.params.id })
  );
  const updateUser = jest.fn((req, res) =>
    res.status(200).json({ updated: true })
  );
  const deleteUser = jest.fn((req, res) => res.status(204).send());

  return {
    UserController: jest.fn().mockImplementation(() => ({
      getAllUsers,
      getUserById,
      updateUser,
      deleteUser,
    })),
    __mockHandlers: {
      getAllUsers,
      getUserById,
      updateUser,
      deleteUser,
    },
  };
});

describe("User Routes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/users", router);
  });

  it("GET /users → should return all users", async () => {
    const { __mockHandlers } = jest.requireMock("./user.controller");

    const res = await request(app).get("/users");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(["user1", "user2"]);
    expect(__mockHandlers.getAllUsers).toHaveBeenCalled();
  });

  it("GET /users/:id → should return a user by id", async () => {
    const { __mockHandlers } = jest.requireMock("./user.controller");

    const res = await request(app).get(
      "/users/123e4567-e89b-12d3-a456-426614174000"
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "123e4567-e89b-12d3-a456-426614174000" });
    expect(__mockHandlers.getUserById).toHaveBeenCalled();
  });

  it("PATCH /users/:id → should update user", async () => {
    const { __mockHandlers } = jest.requireMock("./user.controller");

    const res = await request(app)
      .patch("/users/123e4567-e89b-12d3-a456-426614174000")
      .send({ name: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ updated: true });
    expect(__mockHandlers.updateUser).toHaveBeenCalled();
  });

  it("DELETE /users/:id → should delete user", async () => {
    const { __mockHandlers } = jest.requireMock("./user.controller");

    const res = await request(app).delete(
      "/users/123e4567-e89b-12d3-a456-426614174000"
    );
    expect(res.status).toBe(204);
    expect(__mockHandlers.deleteUser).toHaveBeenCalled();
  });
});
