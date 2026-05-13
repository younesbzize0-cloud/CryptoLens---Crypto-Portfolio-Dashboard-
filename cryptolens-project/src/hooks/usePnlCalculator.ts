import { useMemo } from "react";
import { usePortfolioStore } from "../store/portfolioStore";
import { calcPortfolioSummary } from "../utils/pnl";
import { usePriceMap } from "./useCryptoPrices";
import type { PortfolioSummaryData } from "../types";

/**
 * Derives real-time portfolio P&L by combining the persisted portfolio
 * (positions + cash) with live prices from CoinGecko.
 */
export function usePnlCalculator(): PortfolioSummaryData {
  const portfolio = usePortfolioStore((s) => s.portfolio);
  const priceMap = usePriceMap();

  return useMemo(
    () => calcPortfolioSummary(portfolio, priceMap),
    [portfolio, priceMap]
  );
}