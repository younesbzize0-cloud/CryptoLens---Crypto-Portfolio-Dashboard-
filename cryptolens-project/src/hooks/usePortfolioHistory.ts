import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchMarketChart } from "../lib/api";
import { usePortfolioStore } from "../store/portfolioStore";
import { buildPortfolioHistoryCurve } from "../utils/pnl";
import type { ChartDataPoint, MarketChartData, TimeRange } from "../types";

export function usePortfolioHistory(days: TimeRange): {
  data: ChartDataPoint[];
  isLoading: boolean;
  isError: boolean;
} {
  const positions = usePortfolioStore((s) => s.portfolio.positions);
  const daysNum = Number(days);

  // Fan out one query per unique crypto in the portfolio
  const uniqueCryptoIds = [...new Set(positions.map((p) => p.cryptoId))];

  const results = useQueries({
    queries: uniqueCryptoIds.map((id) => ({
      queryKey: ["marketChart", id, days],
      queryFn: () => fetchMarketChart(id, daysNum),
      staleTime: 5 * 60 * 1000, // Historical data: 5min cache
      retry: 1,
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  const data = useMemo(() => {
    if (isLoading || isError || positions.length === 0) return [];

    const historicalData: Record<string, MarketChartData> = {};
    uniqueCryptoIds.forEach((id, idx) => {
      const result = results[idx]?.data;
      if (result) historicalData[id] = result;
    });

    return buildPortfolioHistoryCurve(positions, historicalData, daysNum);
  }, [results, positions, isLoading, isError, daysNum]);

  return { data, isLoading, isError };
}