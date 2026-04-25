// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
  ath: number;
  ath_change_percentage: number;
  last_updated: string;
}

export interface Position {
  id: string;
  cryptoId: string;
  symbol: string;
  name: string;
  image: string;
  quantity: number;
  avgBuyPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  id: string;
  name: string;
  initialCapital: number;
  remainingCash: number;
  positions: Position[];
  createdAt: string;
}

export interface PriceAlert {
  id: string;
  cryptoId: string;
  symbol: string;
  name: string;
  targetPrice: number;
  direction: "above" | "below";
  triggered: boolean;
  createdAt: string;
}

export interface PnLResult {
  positionId: string;
  currentValue: number;
  costBasis: number;
  absolutePnL: number;
  percentagePnL: number;
  allocationPercent: number;
}

export interface PortfolioSummaryData {
  totalValue: number;
  totalCostBasis: number;
  totalPnL: number;
  totalPnLPercent: number;
  remainingCash: number;
  positions: (Position & PnLResult)[];
}

export interface HistoricalDataPoint {
  timestamp: number;
  price: number;
}

export interface MarketChartData {
  prices: [number, number][];
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface CoinGeckoMarketResponse extends CryptoAsset {}

export interface ApiError {
  message: string;
  status?: number;
  retryAfter?: number;
}

// ─── UI / State Types ──────────────────────────────────────────────────────────

export type SortField =
  | "market_cap_rank"
  | "current_price"
  | "price_change_percentage_24h"
  | "market_cap";
export type SortDirection = "asc" | "desc";

export interface MarketTableSort {
  field: SortField;
  direction: SortDirection;
}

export type TimeRange = "7" | "30";

export interface ChartDataPoint {
  date: string;
  value: number;
}