import "reflect-metadata";
import { CryptoService } from "./crypto.service";
import { CoinGeckoClient } from "../client/coingecko/coingecko.client";

describe("CryptoService", () => {
  let coinGeckoClientMock: jest.Mocked<CoinGeckoClient>;
  let service: CryptoService;

  beforeEach(() => {
    coinGeckoClientMock = {
      getPrice: jest.fn(),
    } as unknown as jest.Mocked<CoinGeckoClient>;

    service = new CryptoService(coinGeckoClientMock);
  });

  it("should return crypto data for a given currency", async () => {
    const currency = "bitcoin";
    const refresh = false;
    const mockData = { name: "Bitcoin", price_usd: 42000 };

    coinGeckoClientMock.getPrice.mockResolvedValue(mockData);

    const result = await service.getCryptoData(currency, refresh);

    expect(coinGeckoClientMock.getPrice).toHaveBeenCalledWith(
      currency,
      refresh
    );
    expect(result).toEqual(mockData);
  });

  it("should throw an error if getPrice fails", async () => {
    const currency = "ethereum";
    const refresh = true;

    coinGeckoClientMock.getPrice.mockRejectedValue(
      new Error("API limit exceeded")
    );

    await expect(service.getCryptoData(currency, refresh)).rejects.toThrow(
      "Error fetching crypto data: API limit exceeded"
    );
  });
});
