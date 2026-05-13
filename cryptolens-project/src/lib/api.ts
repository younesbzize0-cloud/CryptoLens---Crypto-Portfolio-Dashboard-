import { MarketResponseSchema, MarketChartSchema } from "./schemas";
import type { CryptoAsset, MarketChartData } from "../types";

const BASE_URL = "https://api.coingecko.com/api/v3";

// Simple in-memory rate limit tracker
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1200; // 1.2s between requests (free tier: ~50 req/min)

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_INTERVAL) {
    await new Promise((r) =>
      setTimeout(r, MIN_REQUEST_INTERVAL - timeSinceLast)
    );
  }
  lastRequestTime = Date.now();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get("Retry-After") ?? 60);
      throw new Error(`RATE_LIMITED:${retryAfter}`);
    }

    if (!res.ok) {
      throw new Error(`HTTP_ERROR:${res.status}`);
    }

    return res;
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("REQUEST_TIMEOUT");
    }
    throw err;
  }
}

export async function fetchTopCryptos(limit = 50): Promise<CryptoAsset[]> {
  const url =
    `${BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc` +
    `&per_page=${limit}&page=1&sparkline=false` +
    `&price_change_percentage=7d`;

  const res = await rateLimitedFetch(url);
  const json = await res.json();

  const parsed = MarketResponseSchema.safeParse(json);
  if (!parsed.success) {
    console.error("Validation error:", parsed.error.flatten());
    throw new Error("VALIDATION_ERROR");
  }

  // Normalise nullable fields to safe defaults
  return parsed.data.map((coin) => ({
    ...coin,
    market_cap_rank: coin.market_cap_rank ?? 999,
    price_change_percentage_24h: coin.price_change_percentage_24h ?? 0,
    price_change_percentage_7d_in_currency:
      coin.price_change_percentage_7d_in_currency ?? 0,
    high_24h: coin.high_24h ?? coin.current_price,
    low_24h: coin.low_24h ?? coin.current_price,
    circulating_supply: coin.circulating_supply ?? 0,
    ath_change_percentage: coin.ath_change_percentage ?? 0,
  }));
}

export async function fetchMarketChart(
  coinId: string,
  days: number
): Promise<MarketChartData> {
  const url =
    `${BASE_URL}/coins/${coinId}/market_chart` +
    `?vs_currency=usd&days=${days}&interval=daily`;

  const res = await rateLimitedFetch(url);
  const json = await res.json();

  const parsed = MarketChartSchema.safeParse(json);
  if (!parsed.success) throw new Error("VALIDATION_ERROR");

  return parsed.data;
}

export function parseApiError(err: unknown): string {
  if (!(err instanceof Error)) return "Unknown error occurred";
  if (err.message.startsWith("RATE_LIMITED:")) {
    const seconds = err.message.split(":")[1];
    return `CoinGecko rate limit reached. Retry in ${seconds}s.`;
  }
  if (err.message === "REQUEST_TIMEOUT") return "Request timed out. Check your connection.";
  if (err.message === "VALIDATION_ERROR") return "Unexpected API response format.";
  if (err.message.startsWith("HTTP_ERROR:")) {
    const code = err.message.split(":")[1];
    return `API error (HTTP ${code}).`;
  }
  return err.message;
}