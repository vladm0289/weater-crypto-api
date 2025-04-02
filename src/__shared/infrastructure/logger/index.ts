import { injectable } from "tsyringe";
import winston from "winston";

import { config } from "@shared/infrastructure/config";

@injectable()
export class Logger {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(({ level, message, timestamp }) => {
          return JSON.stringify({
            level,
            message,
            timestamp,
            service: config.service,
          });
        })
      ),
      transports: [new winston.transports.Console()],
    });
  }

  info(message: string) {
    this.logger.info(message);
  }

  error(message: string) {
    this.logger.error(message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }
}
