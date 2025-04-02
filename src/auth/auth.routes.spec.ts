import "reflect-metadata";
import request from "supertest";
import express from "express";
import router from "./auth.routes";

jest.mock("@spinanda/__shared/domain/middleware", () => ({
  validateDto: () => (req, res, next) => next(),
  validateAuth: () => (req, res, next) => next(),
}));

jest.mock("./auth.controller", () => {
  const register = jest.fn((req, res) =>
    res.status(201).json({ message: "User registered" })
  );
  const login = jest.fn((req, res) =>
    res.status(200).json({ token: "jwt-token" })
  );
  const profile = jest.fn((req, res) =>
    res.status(200).json({ user: "profile" })
  );

  return {
    AuthController: jest.fn().mockImplementation(() => ({
      register,
      login,
      profile,
    })),
    __mockAuthHandlers: {
      register,
      login,
      profile,
    },
  };
});

describe("Auth Routes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/auth", router);
  });

  it("POST /auth/register → should register user", async () => {
    const { __mockAuthHandlers } = jest.requireMock("./auth.controller");

    const res = await request(app).post("/auth/register").send({
      email: "user@example.com",
      password: "secret",
    });

    expect(res.status).toBe(201);
    expect(__mockAuthHandlers.register).toHaveBeenCalled();
  });

  it("POST /auth/login → should return token", async () => {
    const { __mockAuthHandlers } = jest.requireMock("./auth.controller");

    const res = await request(app).post("/auth/login").send({
      email: "user@example.com",
      password: "secret",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token: "jwt-token" });
    expect(__mockAuthHandlers.login).toHaveBeenCalled();
  });

  it("GET /auth/profile → should return profile", async () => {
    const { __mockAuthHandlers } = jest.requireMock("./auth.controller");

    const res = await request(app).get("/auth/profile");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: "profile" });
    expect(__mockAuthHandlers.profile).toHaveBeenCalled();
  });
});
