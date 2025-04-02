import { Router } from "express";
import { container } from "tsyringe";
import { WeatherAndCryptoController } from "./weather-crypto.controller";
import { validateDto } from "@spinanda/__shared/domain/middleware";
import { WeatherCryptoDto } from "./dto";

const router = Router();

const weatherAndCryptoController = container.resolve(
  WeatherAndCryptoController
);

router.get(
  "/",
  validateDto(WeatherCryptoDto),
  weatherAndCryptoController.getWeatherAndCryptoData
);

export default router;
