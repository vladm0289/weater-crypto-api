import "reflect-metadata";
import { CoinGeckoClient } from "./coingecko.client";
import { BaseAxiosClient } from "../base-axios.client";
import { Cache } from "@spinanda/__shared/infrastructure/cache";
import { Logger } from "@spinanda/__shared/infrastructure/logger";
import { AxiosResponse } from "axios";

describe("CoinGeckoClient", () => {
  let axiosClientMock: jest.Mocked<BaseAxiosClient>;
  let cacheMock: jest.Mocked<Cache>;
  let loggerMock: jest.Mocked<Logger>;
  let client: CoinGeckoClient;

  beforeEach(() => {
    axiosClientMock = {
      get: jest.fn(),
    } as unknown as jest.Mocked<BaseAxiosClient>;

    cacheMock = {
      get: jest.fn(),
      set: jest.fn(),
    } as unknown as jest.Mocked<Cache>;

    loggerMock = {
      info: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    client = new CoinGeckoClient(axiosClientMock, cacheMock, loggerMock);
  });

  it("should return cached data when available and refresh is false", async () => {
    const currency = "bitcoin";
    const cachedData = { name: "bitcoin", price_usd: 42000 };

    cacheMock.get.mockReturnValue(cachedData);

    const result = await client.getPrice(currency);

    expect(cacheMock.get).toHaveBeenCalledWith("crypto:bitcoin");
    expect(result).toEqual(cachedData);
    expect(loggerMock.info).toHaveBeenCalledWith(
      "Returning cached crypto data"
    );
    expect(axiosClientMock.get).not.toHaveBeenCalled();
  });

  it("should fetch from API, cache it and return the result if not cached", async () => {
    const currency = "ethereum";
    const mockApiResponse = {
      data: {
        ethereum: {
          usd: 3200,
        },
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };

    cacheMock.get.mockReturnValue(undefined);
    axiosClientMock.get.mockResolvedValue(mockApiResponse as AxiosResponse);

    const result = await client.getPrice(currency, false);

    expect(axiosClientMock.get).toHaveBeenCalledWith(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "ethereum",
          vs_currencies: "usd",
        },
      }
    );

    expect(result).toEqual({ name: "ethereum", price_usd: 3200 });
    expect(cacheMock.set).toHaveBeenCalledWith("crypto:ethereum", {
      name: "ethereum",
      price_usd: 3200,
    });
    expect(loggerMock.info).toHaveBeenCalledWith(
      "Cryptocurrency price data fetched and cached successfully"
    );
  });

  it("should throw error if API response does not contain currency data", async () => {
    const currency = "nonexistentcoin";
    const mockApiResponse = {
      data: {},
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };

    cacheMock.get.mockReturnValue(undefined);
    axiosClientMock.get.mockResolvedValue(mockApiResponse as AxiosResponse);

    await expect(client.getPrice(currency, false)).rejects.toThrow(
      "Cryptocurrency not found"
    );
  });

  it("should throw error if API request fails", async () => {
    const currency = "bitcoin";
    const error = new Error("Network error");

    cacheMock.get.mockReturnValue(undefined);
    axiosClientMock.get.mockRejectedValue(error);

    await expect(client.getPrice(currency, false)).rejects.toThrow(
      "Error fetching crypto data: Network error"
    );
  });
});
