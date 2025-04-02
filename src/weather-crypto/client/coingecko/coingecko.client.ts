import { injectable } from "tsyringe";

import { BaseAxiosClient } from "../base-axios.client";
import { Cache } from "@spinanda/__shared/infrastructure/cache";
import { Logger } from "@spinanda/__shared/infrastructure/logger";

const USD_CURRENCY = "usd";

@injectable()
export class CoinGeckoClient {
  private readonly coinGeckoUrl: string;

  constructor(
    private readonly axiosClient: BaseAxiosClient,
    private readonly cache: Cache,
    private readonly logger: Logger
  ) {
    this.coinGeckoUrl = "https://api.coingecko.com/api/v3/simple/price";
  }

  public async getPrice(currency: string, refreshCache: boolean = false) {
    const cacheKey = `crypto:${currency.toLowerCase()}`;

    if (!refreshCache) {
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        this.logger.info("Returning cached crypto data");
        return cachedData;
      }
    }

    try {
      const response = await this.axiosClient.get(this.coinGeckoUrl, {
        params: {
          ids: currency.toLowerCase(),
          vs_currencies: USD_CURRENCY,
        },
      });

      if (!response.data?.[currency.toLowerCase()]) {
        throw new Error("Cryptocurrency not found");
      }

      const cryptoData = {
        name: currency,
        price_usd: response.data[currency.toLowerCase()].usd,
      };

      this.cache.set(cacheKey, cryptoData);
      this.logger.info(
        "Cryptocurrency price data fetched and cached successfully"
      );

      return cryptoData;
    } catch (error) {
      throw new Error(`Error fetching crypto data: ${error.message}`);
    }
  }
}
