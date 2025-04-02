import dotenv from "dotenv";

dotenv.config();

function validate(envVariable: string): string {
  const value = process.env[envVariable];
  if (!value) {
    throw new Error(
      `Environment variable ${envVariable} is required but not defined`
    );
  }
  return value;
}

export const config = {
  port: process.env.PORT || 5000,
  jwtSecret: validate("JWT_SECRET"),
  NODE_ENV: process.env.NODE_ENV || "local",
  service: process.env.SERVICE,
  openWeatherApiKey: validate("OPENWEATHER_API_KEY"),
  coinGeckoApiKey: validate("COINGECKO_API_KEY"),
};
