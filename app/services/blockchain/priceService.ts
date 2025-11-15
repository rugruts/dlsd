// Mock price service - replace with real API later
export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
}

const MOCK_PRICES: Record<string, PriceData> = {
  GOR: { symbol: 'GOR', price: 1.23, change24h: 5.67 },
  SOL: { symbol: 'SOL', price: 150.45, change24h: -2.34 },
};

export class PriceService {
  static async getPrice(symbol: string): Promise<PriceData | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_PRICES[symbol] || null;
  }

  static async getPrices(symbols: string[]): Promise<Record<string, PriceData>> {
    const results: Record<string, PriceData> = {};
    for (const symbol of symbols) {
      const price = await this.getPrice(symbol);
      if (price) results[symbol] = price;
    }
    return results;
  }
}