import "reflect-metadata";
import request from "supertest";
import express from "express";
import router from "./weather-crypto.routes";

jest.mock("./weather-crypto.controller", () => {
  const mockHandler = jest.fn((req: any, res: any) => {
    res.status(200).json({ success: true });
  });

  return {
    WeatherAndCryptoController: jest.fn().mockImplementation(() => ({
      getWeatherAndCryptoData: mockHandler,
    })),
    __mockHandler: mockHandler,
  };
});

describe("WeatherCrypto Route", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/", router);
  });

  it("should call controller and return 200", async () => {
    const { __mockHandler } = jest.requireMock("./weather-crypto.controller");

    const response = await request(app)
      .get("/")
      .query({ city: "London", currency: "BTC" });

    expect(response.status).toBe(200);
    expect(__mockHandler).toHaveBeenCalled();
  });

  it("should return 400 if dto validation fails", async () => {
    const response = await request(app).get("/").query({ city: "" });

    expect(response.status).toBe(400);
  });
});
