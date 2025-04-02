import { injectable } from "tsyringe";
import { OpenWeatherClient } from "../client/openweather/openweather.client";

@injectable()
export class WeatherService {
  constructor(private readonly weatherClient: OpenWeatherClient) {}

  async getWeatherByCity(city: string, refresh: boolean) {
    try {
      const { lat, lon } = await this.weatherClient.getCityCoordinates(
        city,
        refresh
      );

      const weather = await this.weatherClient.getWeatherData(lat, lon);
      return { city, ...weather };
    } catch (error) {
      throw new Error("Error fetching weather data: " + error.message);
    }
  }
}
