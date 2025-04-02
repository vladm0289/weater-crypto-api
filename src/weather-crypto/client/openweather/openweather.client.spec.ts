import "reflect-metadata";
import { OpenWeatherClient } from "./openweather.client";
import { BaseAxiosClient } from "../base-axios.client";
import { Cache } from "@spinanda/__shared/infrastructure/cache";
import { Logger } from "@spinanda/__shared/infrastructure/logger";

jest.mock("@spinanda/__shared/infrastructure/cache");
jest.mock("@spinanda/__shared/infrastructure/logger");

const mockGet = jest.fn();
const mockSet = jest.fn();

const mockAxiosClient: BaseAxiosClient = {
  get: mockGet,
} as any;

const mockCache: Cache = {
  get: jest.fn(),
  set: mockSet,
} as any;

const mockLogger: Logger = {
  info: jest.fn(),
  error: jest.fn(),
} as any;

describe("OpenWeatherClient", () => {
  let client: OpenWeatherClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new OpenWeatherClient(mockAxiosClient, mockCache, mockLogger);
    process.env.OPENWEATHER_API_KEY = "dummy-api-key";
  });

  describe("getCityCoordinates", () => {
    it("returns cached coordinates if available", async () => {
      const cached = { lat: 1, lon: 2, name: "Test City" };
      (mockCache.get as jest.Mock).mockReturnValue(cached);

      const result = await client.getCityCoordinates("Test City");
      expect(result).toEqual(cached);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Returning cached city coordinates"
      );
    });

    it("fetches coordinates and caches them if not cached", async () => {
      (mockCache.get as jest.Mock).mockReturnValue(undefined);
      mockGet.mockResolvedValue({
        data: [{ lat: 3, lon: 4, name: "Test City" }],
      });

      const result = await client.getCityCoordinates("Test City");
      expect(result).toEqual({ lat: 3, lon: 4, name: "Test City" });
      expect(mockSet).toHaveBeenCalledWith("city:test city", result);
    });

    it("throws error if city not found", async () => {
      mockGet.mockResolvedValue({ data: [] });

      await expect(client.getCityCoordinates("Unknown")).rejects.toThrow(
        "City not found"
      );
    });
  });

  describe("getWeatherData", () => {
    it("returns cached weather if available", async () => {
      const cached = { temperature: "20°C", weather: "clear sky" };
      (mockCache.get as jest.Mock).mockReturnValue(cached);

      const result = await client.getWeatherData(1, 2);
      expect(result).toEqual(cached);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Returning cached weather data"
      );
    });

    it("fetches weather and caches it if not cached", async () => {
      (mockCache.get as jest.Mock).mockReturnValue(undefined);
      mockGet.mockResolvedValue({
        data: {
          current: {
            temp: 25,
            weather: [{ description: "sunny" }],
          },
        },
      });

      const result = await client.getWeatherData(1, 2);
      expect(result).toEqual({ temperature: "25°C", weather: "sunny" });
      expect(mockSet).toHaveBeenCalledWith("weather:1,2", result);
    });

    it("throws error if weather API call fails", async () => {
      (mockCache.get as jest.Mock).mockReturnValue(undefined);
      mockGet.mockRejectedValue(new Error("Weather API failure"));

      await expect(client.getWeatherData(1, 2)).rejects.toThrow(
        "Error fetching weather data: Weather API failure"
      );
    });
  });

  describe("getWeatherByCity", () => {
    it("fetches weather data by city name", async () => {
      const coords = { lat: 1, lon: 2, name: "Test City" };
      const weather = { temperature: "15°C", weather: "cloudy" };

      jest.spyOn(client, "getCityCoordinates").mockResolvedValue(coords);
      jest.spyOn(client, "getWeatherData").mockResolvedValue(weather);

      const result = await client.getWeatherByCity("Test City");
      expect(result).toEqual(weather);
    });

    it("throws error if fetching weather by city fails", async () => {
      jest
        .spyOn(client, "getCityCoordinates")
        .mockRejectedValue(new Error("City service down"));

      await expect(client.getWeatherByCity("Paris")).rejects.toThrow(
        "Error fetching weather data by city: City service down"
      );
    });
  });
});
