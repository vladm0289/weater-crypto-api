import "reflect-metadata";
import { WeatherService } from "./weather.service";
import { OpenWeatherClient } from "../client/openweather/openweather.client";

describe("WeatherService", () => {
  let weatherClientMock: jest.Mocked<OpenWeatherClient>;
  let service: WeatherService;

  beforeEach(() => {
    weatherClientMock = {
      getCityCoordinates: jest.fn(),
      getWeatherData: jest.fn(),
    } as unknown as jest.Mocked<OpenWeatherClient>;

    service = new WeatherService(weatherClientMock);
  });

  it("should return weather data for given city", async () => {
    const city = "Paris";
    const refresh = false;
    const coordinates = { lat: 48.8566, lon: 2.3522, name: "Paris" };
    const weatherData = { temperature: "18°C", weather: "Sunny" };

    weatherClientMock.getCityCoordinates.mockResolvedValue(coordinates);
    weatherClientMock.getWeatherData.mockResolvedValue(weatherData);

    const result = await service.getWeatherByCity(city, refresh);

    expect(weatherClientMock.getCityCoordinates).toHaveBeenCalledWith(
      city,
      refresh
    );
    expect(weatherClientMock.getWeatherData).toHaveBeenCalledWith(
      coordinates.lat,
      coordinates.lon
    );
    expect(result).toEqual({ city, ...weatherData });
  });

  it("should throw an error if getCityCoordinates fails", async () => {
    const city = "Tokyo";
    const refresh = true;

    weatherClientMock.getCityCoordinates.mockRejectedValue(
      new Error("API down")
    );

    await expect(service.getWeatherByCity(city, refresh)).rejects.toThrow(
      "Error fetching weather data: API down"
    );
  });

  it("should throw an error if getWeatherData fails", async () => {
    const city = "Berlin";
    const refresh = false;
    const coordinates = { lat: 52.52, lon: 13.405, name: "Berlin" };

    weatherClientMock.getCityCoordinates.mockResolvedValue(coordinates);
    weatherClientMock.getWeatherData.mockRejectedValue(
      new Error("Weather error")
    );

    await expect(service.getWeatherByCity(city, refresh)).rejects.toThrow(
      "Error fetching weather data: Weather error"
    );
  });
});
