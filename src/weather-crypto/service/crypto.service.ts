import { injectable } from "tsyringe";
import { CoinGeckoClient } from "../client/coingecko/coingecko.client";

@injectable()
export class CryptoService {
  constructor(private readonly coinGeckoClient: CoinGeckoClient) {}

  async getCryptoData(currency: string, refresh: boolean) {
    try {
      return await this.coinGeckoClient.getPrice(currency, refresh);
    } catch (error) {
      throw new Error("Error fetching crypto data: " + error.message);
    }
  }
}
