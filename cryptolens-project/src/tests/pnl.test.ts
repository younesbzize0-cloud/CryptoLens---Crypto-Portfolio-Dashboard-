import { describe, it, expect } from "vitest";
import {
  calcPositionPnL,
  calcPortfolioSummary,
  buildPortfolioHistoryCurve,
  formatUSD,
  formatPct,
} from "../utils/pnl";
import type { Position, Portfolio } from "../types";

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const mockPosition: Position = {
  id: "pos-1",
  cryptoId: "bitcoin",
  symbol: "btc",
  name: "Bitcoin",
  image: "https://example.com/btc.png",
  quantity: 0.5,
  avgBuyPrice: 30_000,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockPortfolio: Portfolio = {
  id: "pf-1",
  name: "Test Portfolio",
  initialCapital: 20_000,
  remainingCash: 5_000,
  positions: [mockPosition],
  createdAt: new Date().toISOString(),
};

// ─── calcPositionPnL ──────────────────────────────────────────────────────────

describe("calcPositionPnL", () => {
  it("returns 0 P&L when current price equals buy price", () => {
    const result = calcPositionPnL(mockPosition, 30_000, 15_000);
    expect(result.absolutePnL).toBe(0);
    expect(result.percentagePnL).toBe(0);
  });

  it("calculates positive P&L correctly", () => {
    const result = calcPositionPnL(mockPosition, 40_000, 20_000);
    expect(result.currentValue).toBe(20_000); // 0.5 * 40_000
    expect(result.costBasis).toBe(15_000); // 0.5 * 30_000
    expect(result.absolutePnL).toBe(5_000);
    expect(result.percentagePnL).toBeCloseTo(33.33, 1);
  });

  it("calculates negative P&L correctly", () => {
    const result = calcPositionPnL(mockPosition, 20_000, 10_000);
    expect(result.absolutePnL).toBe(-5_000);
    expect(result.percentagePnL).toBeCloseTo(-33.33, 1);
  });

  it("handles zero cost basis without division error", () => {
    const zeroCostPos: Position = { ...mockPosition, avgBuyPrice: 0 };
    const result = calcPositionPnL(zeroCostPos, 1_000, 500);
    expect(result.percentagePnL).toBe(0);
  });

  it("calculates allocation percentage correctly", () => {
    const result = calcPositionPnL(mockPosition, 30_000, 30_000);
    // currentValue = 0.5 * 30_000 = 15_000; totalPortfolioValue = 30_000
    expect(result.allocationPercent).toBeCloseTo(50, 1);
  });

  it("returns 0 allocation when total portfolio value is 0", () => {
    const result = calcPositionPnL(mockPosition, 30_000, 0);
    expect(result.allocationPercent).toBe(0);
  });
});

// ─── calcPortfolioSummary ─────────────────────────────────────────────────────

describe("calcPortfolioSummary", () => {
  it("sums positions correctly", () => {
    const priceMap = { bitcoin: 40_000 };
    const summary = calcPortfolioSummary(mockPortfolio, priceMap);
    expect(summary.totalValue).toBeCloseTo(20_000); // 0.5 * 40_000
    expect(summary.totalCostBasis).toBeCloseTo(15_000);
    expect(summary.totalPnL).toBeCloseTo(5_000);
  });

  it("falls back to avgBuyPrice when crypto not in priceMap", () => {
    const summary = calcPortfolioSummary(mockPortfolio, {});
    expect(summary.totalPnL).toBe(0);
  });

  it("returns remaining cash from portfolio", () => {
    const summary = calcPortfolioSummary(mockPortfolio, { bitcoin: 30_000 });
    expect(summary.remainingCash).toBe(5_000);
  });
});

// ─── buildPortfolioHistoryCurve ───────────────────────────────────────────────

describe("buildPortfolioHistoryCurve", () => {
  it("returns empty array for no positions", () => {
    const result = buildPortfolioHistoryCurve([], {}, 7);
    expect(result).toEqual([]);
  });

  it("calculates daily totals from historical data", () => {
    const historicalData = {
      bitcoin: {
        prices: [
          [1_700_000_000_000, 30_000],
          [1_700_086_400_000, 31_000],
        ] as [number, number][],
      },
    };

    const result = buildPortfolioHistoryCurve(
      [mockPosition],
      historicalData,
      7
    );
    expect(result).toHaveLength(2);
    expect(result[0].value).toBeCloseTo(15_000); // 0.5 * 30_000
    expect(result[1].value).toBeCloseTo(15_500); // 0.5 * 31_000
  });
});

// ─── formatUSD ────────────────────────────────────────────────────────────────

describe("formatUSD", () => {
  it("formats whole dollar amounts", () => {
    expect(formatUSD(1_234.56)).toContain("1,234.56");
  });

  it("formats small prices with more decimals", () => {
    const formatted = formatUSD(0.000123);
    expect(formatted).toContain("0.000123");
  });
});

// ─── formatPct ────────────────────────────────────────────────────────────────

describe("formatPct", () => {
  it("adds + sign for positive values", () => {
    expect(formatPct(5.5)).toBe("+5.50%");
  });

  it("keeps - sign for negative values", () => {
    expect(formatPct(-3.14)).toBe("-3.14%");
  });

  it("formats zero", () => {
    expect(formatPct(0)).toBe("+0.00%");
  });
});