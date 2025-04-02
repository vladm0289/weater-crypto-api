import "reflect-metadata";
import express from "express";
import cors from "cors";
import { container } from "tsyringe";
import swaggerUi from "swagger-ui-express";
import fs from "fs";

import "@shared/infrastructure/di-container";
import authRoutes from "./auth/auth.routes";
import userRoutes from "./user/user.routes";
import weatherCryptoRoutes from "./weather-crypto/weather-crypto.routes";
import { config } from "@shared/infrastructure/config";
import { Logger } from "./__shared/infrastructure/logger";
import path from "path";

const logger = container.resolve(Logger);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
//

const swaggerJsonPath = path.join(__dirname, "..", "swagger.json");
const swaggerJson = JSON.parse(fs.readFileSync(swaggerJsonPath, "utf-8"));

app.get("/swagger.json", (_, res) => {
  res.json(swaggerJson);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJson));

// Feature routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/data", weatherCryptoRoutes);
//

// Healthcheck
app.get("/", (_, res) => {
  res.json({ message: "API is up and running 🚀" });
});
//

app.listen(config.port, () => {
  logger.info(`🚀 Server running on http://localhost:${config.port}`);
  logger.info(
    `Swagger UI available at http://localhost:${config.port}/api-docs`
  );
});
