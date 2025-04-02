import "reflect-metadata";
import { BaseAxiosClient } from "./base-axios.client";
import { Logger } from "@spinanda/__shared/infrastructure/logger";
import axios from "axios";
import axiosRetry from "axios-retry";
import { mocked } from "jest-mock";

jest.mock("axios");
jest.mock("axios-retry");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("BaseAxiosClient", () => {
  let client: BaseAxiosClient;
  let logger: Logger;

  beforeEach(() => {
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    mockedAxios.create.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    } as any);

    client = new BaseAxiosClient(logger);
  });

  it("should perform GET request", async () => {
    const mockResponse = { data: { result: "success" } };
    (client as any).axiosInstance.get.mockResolvedValue(mockResponse);

    const result = await client.get("/test");

    expect(result).toEqual(mockResponse);
    expect((client as any).axiosInstance.get).toHaveBeenCalledWith(
      "/test",
      undefined
    );
  });

  it("should log and throw error on GET failure", async () => {
    const error = new Error("GET failed");
    (client as any).axiosInstance.get.mockRejectedValue(error);

    await expect(client.get("/fail")).rejects.toThrow(
      "Error in GET request: GET failed"
    );
    expect(logger.error).toHaveBeenCalledWith(
      "Error in GET request: GET failed"
    );
  });

  it("should perform POST request", async () => {
    const mockResponse = { data: { result: "posted" } };
    (client as any).axiosInstance.post.mockResolvedValue(mockResponse);

    const result = await client.post("/submit", { foo: "bar" });

    expect(result).toEqual(mockResponse);
    expect((client as any).axiosInstance.post).toHaveBeenCalledWith(
      "/submit",
      { foo: "bar" },
      undefined
    );
  });

  it("should log and throw error on POST failure", async () => {
    const error = new Error("POST failed");
    (client as any).axiosInstance.post.mockRejectedValue(error);

    await expect(client.post("/fail", {})).rejects.toThrow(
      "Error in POST request: POST failed"
    );
    expect(logger.error).toHaveBeenCalledWith(
      "Error in POST request: POST failed"
    );
  });

  it("should perform generic request", async () => {
    const mockResponse = { data: { ok: true } };
    (client as any).axiosInstance.request.mockResolvedValue(mockResponse);

    const result = await client.request({ method: "GET", url: "/generic" });

    expect(result).toEqual(mockResponse);
    expect((client as any).axiosInstance.request).toHaveBeenCalledWith({
      method: "GET",
      url: "/generic",
    });
  });

  it("should log and throw error on request failure", async () => {
    const error = new Error("Generic error");
    (client as any).axiosInstance.request.mockRejectedValue(error);

    await expect(
      client.request({ method: "GET", url: "/fail" })
    ).rejects.toThrow("Error in request: Generic error");
    expect(logger.error).toHaveBeenCalledWith(
      "Error in request: Generic error"
    );
  });

  it("should configure axiosRetry with proper retryDelay and retryCondition", () => {
    expect(axiosRetry).toHaveBeenCalled();

    const retryConfig = mocked(axiosRetry).mock.calls[0][1];

    const delay = retryConfig.retryDelay(2, {
      message: "mock error",
      config: {},
      isAxiosError: true,
      name: "AxiosError",
      toJSON: () => ({}),
      response: {
        status: 500,
        statusText: "Internal Server Error",
        headers: {},
        config: {},
        data: {},
      },
    } as any);
    expect(delay).toBe(2000);

    const shouldRetry = retryConfig.retryCondition({
      response: {
        status: 500,
        statusText: "Internal Server Error",
        headers: {},
        config: {},
        data: {},
      },
    } as any);

    const shouldNotRetry = retryConfig.retryCondition({
      response: {
        status: 404,
        statusText: "Not Found",
        headers: {},
        config: {},
        data: {},
      },
    } as any);

    expect(shouldRetry).toBe(true);
    expect(shouldNotRetry).toBe(false);
  });
});
