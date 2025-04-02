import { injectable } from "tsyringe";

@injectable()
export class Cache {
  private readonly cache: Map<string, { data: any; timestamp: number }>;

  constructor() {
    this.cache = new Map();
  }

  public get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data;
    }
    return null;
  }

  public set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}
