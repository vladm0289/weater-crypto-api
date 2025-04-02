import { WeatherAndCryptoController } from "./weather-crypto.controller";
import { CryptoService, WeatherService } from "./service";
import { Logger } from "@spinanda/__shared/infrastructure/logger";
import { Request, Response } from "express";

jest.mock("./service/weather.service");
jest.mock("./service");
jest.mock("@spinanda/__shared/infrastructure/logger");

describe("WeatherAndCryptoController", () => {
  let controller: WeatherAndCryptoController;
  let weatherServiceMock: jest.Mocked<WeatherService>;
  let cryptoServiceMock: jest.Mocked<CryptoService>;
  let loggerMock: jest.Mocked<Logger>;

  beforeEach(() => {
    const weatherClientMock = { getWeatherByCity: jest.fn() };
    const cryptoClientMock = { getCryptoData: jest.fn() };
    weatherServiceMock = new WeatherService(
      weatherClientMock as any
    ) as jest.Mocked<WeatherService>;
    cryptoServiceMock = new CryptoService(
      cryptoClientMock as any
    ) as jest.Mocked<CryptoService>;
    loggerMock = new Logger() as jest.Mocked<Logger>;

    controller = new WeatherAndCryptoController(
      weatherServiceMock,
      cryptoServiceMock,
      loggerMock
    );
  });

  describe("getWeatherAndCryptoData", () => {
    it("should return weather and crypto data successfully", async () => {
      const city = "London";
      const currency = "bitcoin";
      const refresh = false;

      const mockWeather = { temperature: "15°C", weather: "Cloudy" };
      const mockCrypto = { name: "Bitcoin", price_usd: 42000 };

      weatherServiceMock.getWeatherByCity.mockResolvedValue({
        ...mockWeather,
        city,
      });
      cryptoServiceMock.getCryptoData.mockResolvedValue(mockCrypto);

      const req = { body: { city, currency, refresh } } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.getWeatherAndCryptoData(req, res);

      expect(weatherServiceMock.getWeatherByCity).toHaveBeenCalledWith(
        city,
        refresh
      );
      expect(cryptoServiceMock.getCryptoData).toHaveBeenCalledWith(
        currency,
        refresh
      );

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should return 500 error if an exception is thrown", async () => {
      const city = "London";
      const currency = "bitcoin";
      const refresh = false;

      weatherServiceMock.getWeatherByCity.mockRejectedValue(
        new Error("Weather service error")
      );
      cryptoServiceMock.getCryptoData.mockResolvedValue({
        name: "Bitcoin",
        price_usd: 42000,
      });

      const req = { body: { city, currency, refresh } } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.getWeatherAndCryptoData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Weather service error",
      });

      expect(loggerMock.error).toHaveBeenCalledWith(
        "Error during get weather and crypto data request, Weather service error"
      );
    });
  });
});
