import "reflect-metadata";
import { Request, Response } from "express";
import { injectable } from "tsyringe";
import { WeatherService } from "./service/weather.service";
import { Logger } from "@spinanda/__shared/infrastructure/logger";
import { CryptoService } from "./service";

@injectable()
export class WeatherAndCryptoController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly cryptoService: CryptoService,
    private readonly logger: Logger
  ) {}

  public getWeatherAndCryptoData = async (req: Request, res: Response) => {
    const { city, currency, refresh } = req.body;

    try {
      const [weather, crypto] = await Promise.all([
        this.weatherService.getWeatherByCity(city as string, refresh),
        this.cryptoService.getCryptoData(currency, refresh),
      ]);

      res.status(200).json({ ...weather, crypto });
    } catch (error) {
      this.logger.error(
        `Error during get weather and crypto data request, ${error.message}`
      );
      res.status(500).json({ message: error.message });
    }
  };
}
