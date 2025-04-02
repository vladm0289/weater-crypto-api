import { Logger } from "@spinanda/__shared/infrastructure/logger";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import axiosRetry from "axios-retry";
import { injectable } from "tsyringe";

@injectable()
export class BaseAxiosClient {
  private readonly axiosInstance: AxiosInstance;

  constructor(private readonly logger: Logger) {
    this.axiosInstance = axios.create({
      timeout: 5000,
    });

    axiosRetry(this.axiosInstance, {
      retries: 3,
      retryDelay: (retryCount) => {
        logger.info(`Retry attempt: ${retryCount}`);
        return retryCount * 1000;
      },
      retryCondition: (error) => {
        return error.response?.status === 500;
      },
    });
  }

  public async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.axiosInstance.get<T>(url, config);
    } catch (error) {
      this.logger.error(`Error in GET request: ${error.message}`);
      throw new Error(`Error in GET request: ${error.message}`);
    }
  }

  public async post<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.axiosInstance.post<T>(url, data, config);
    } catch (error) {
      this.logger.error(`Error in POST request: ${error.message}`);
      throw new Error(`Error in POST request: ${error.message}`);
    }
  }

  public async request<T>(
    config: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.axiosInstance.request<T>(config);
    } catch (error) {
      this.logger.error(`Error in request: ${error.message}`);
      throw new Error(`Error in request: ${error.message}`);
    }
  }
}
