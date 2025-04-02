import { injectable } from "tsyringe";
import { BaseAxiosClient } from "../base-axios.client";
import { Cache } from "@spinanda/__shared/infrastructure/cache";
import { Logger } from "@spinanda/__shared/infrastructure/logger";
import { CityCoordinates, Weather } from "./type";

@injectable()
export class OpenWeatherClient {
  private readonly geoUrl: string;
  private readonly weatherUrl: string;

  constructor(
    private readonly axiosClient: BaseAxiosClient,
    private readonly cache: Cache,
    private readonly logger: Logger
  ) {
    this.geoUrl = "http://api.openweathermap.org/geo/1.0/direct";
    this.weatherUrl = "https://api.openweathermap.org/data/3.0/onecall";
  }

  public async getCityCoordinates(
    city: string,
    refreshCache = false
  ): Promise<CityCoordinates> {
    const cacheKey = `city:${city.toLowerCase()}`;

    if (!refreshCache) {
      const cachedData: CityCoordinates = this.cache.get(cacheKey);
      if (cachedData) {
        this.logger.info("Returning cached city coordinates");
        return cachedData;
      }
    }
    try {
      const response = await this.axiosClient.get(this.geoUrl, {
        params: {
          q: city,
          appid: process.env.OPENWEATHER_API_KEY,
          limit: 1,
        },
      });

      if (Array.isArray(response.data) && response.data.length === 0) {
        throw new Error("City not found");
      }

      const { lat, lon, name } = response.data[0];
      const result = { lat, lon, name };

      this.cache.set(cacheKey, result);
      this.logger.info("City coordinates data fetched and cached successfully");

      return result;
    } catch (error) {
      throw new Error("Error fetching city coordinates: " + error.message);
    }
  }

  public async getWeatherData(
    lat: number,
    lon: number,
    refreshCache = false
  ): Promise<Weather> {
    const cacheKey = `weather:${lat},${lon}`;

    if (!refreshCache) {
      const cachedData: Weather = this.cache.get(cacheKey);
      if (cachedData) {
        this.logger.info("Returning cached weather data");
        return cachedData;
      }
    }
    try {
      const response: {
        data: {
          current: { temp: number; weather: Array<{ description: string }> };
        };
      } = await this.axiosClient.get(this.weatherUrl, {
        params: {
          lat,
          lon,
          appid: process.env.OPENWEATHER_API_KEY,
          units: "metric",
          exclude: "minutely,hourly,daily",
        },
      });

      const result = {
        temperature: `${response.data.current.temp}°C`,
        weather: response.data.current.weather[0].description,
      };

      this.cache.set(cacheKey, result);
      this.logger.info("Weather data fetched and cached successfully");

      return result;
    } catch (error) {
      throw new Error("Error fetching weather data: " + error.message);
    }
  }

  public async getWeatherByCity(city: string) {
    try {
      const { lat, lon } = await this.getCityCoordinates(city);
      return await this.getWeatherData(lat, lon);
    } catch (error) {
      throw new Error("Error fetching weather data by city: " + error.message);
    }
  }
}
