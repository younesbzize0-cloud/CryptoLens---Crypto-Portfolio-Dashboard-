import type {
  Position,
  CryptoAsset,
  PnLResult,
  PortfolioSummaryData,
  Portfolio,
  ChartDataPoint,
  MarketChartData,
} from "../types";

/**
 * Calculate P&L for a single position given current price.
 * Returns absolute and percentage gain/loss.
 */
export function calcPositionPnL(
  position: Position,
  currentPrice: number,
  totalPortfolioValue: number
): PnLResult {
  const costBasis = position.quantity * position.avgBuyPrice;
  const currentValue = position.quantity * currentPrice;
  const absolutePnL = currentValue - costBasis;
  const percentagePnL =
    costBasis === 0 ? 0 : (absolutePnL / costBasis) * 100;
  const allocationPercent =
    totalPortfolioValue === 0
      ? 0
      : (currentValue / totalPortfolioValue) * 100;

  return {
    positionId: position.id,
    currentValue,
    costBasis,
    absolutePnL,
    percentagePnL,
    allocationPercent,
  };
}

/**
 * Aggregate all positions into a portfolio summary.
 */
export function calcPortfolioSummary(
  portfolio: Portfolio,
  priceMap: Record<string, number>
): PortfolioSummaryData {
  const positionsWithValues = portfolio.positions.map((p) => {
    const currentPrice = priceMap[p.cryptoId] ?? p.avgBuyPrice;
    return { position: p, currentValue: p.quantity * currentPrice };
  });

  const totalInvestedValue = positionsWithValues.reduce(
    (sum, { currentValue }) => sum + currentValue,
    0
  );
  const totalPortfolioValue = totalInvestedValue + portfolio.remainingCash;

  const enriched = positionsWithValues.map(({ position, currentValue }) => {
    const currentPrice = priceMap[position.cryptoId] ?? position.avgBuyPrice;
    const pnl = calcPositionPnL(position, currentPrice, totalInvestedValue);
    return { ...position, ...pnl };
  });

  const totalCostBasis = enriched.reduce((sum, p) => sum + p.costBasis, 0);
  const totalPnL = enriched.reduce((sum, p) => sum + p.absolutePnL, 0);
  const totalPnLPercent =
    totalCostBasis === 0 ? 0 : (totalPnL / totalCostBasis) * 100;

  return {
    totalValue: totalInvestedValue,
    totalCostBasis,
    totalPnL,
    totalPnLPercent,
    remainingCash: portfolio.remainingCash,
    positions: enriched,
  };
}

/**
 * Build a portfolio value history curve by multiplying daily prices
 * (from CoinGecko) by position quantities and summing them.
 */
export function buildPortfolioHistoryCurve(
  positions: Position[],
  historicalData: Record<string, MarketChartData>,
  days: number
): ChartDataPoint[] {
  if (positions.length === 0) return [];

  // Find the common minimum length across all assets
  const lengths = positions.map(
    (p) => historicalData[p.cryptoId]?.prices?.length ?? 0
  );
  const minLen = Math.min(...lengths, days + 1);
  if (minLen === 0) return [];

  const points: ChartDataPoint[] = [];

  for (let i = 0; i < minLen; i++) {
    let dayTotal = 0;
    let timestamp = 0;

    for (const pos of positions) {
      const chart = historicalData[pos.cryptoId];
      if (!chart) continue;
      const priceEntry = chart.prices[i];
      if (!priceEntry) continue;
      timestamp = priceEntry[0];
      dayTotal += pos.quantity * priceEntry[1];
    }

    points.push({
      date: new Date(timestamp).toLocaleDateString("fr-FR", {
        month: "short",
        day: "numeric",
      }),
      value: parseFloat(dayTotal.toFixed(2)),
    });
  }

  return points;
}

/** Format a number as USD currency string */
export function formatUSD(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1_000_000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);
}

/** Format a percentage with sign */
export function formatPct(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}