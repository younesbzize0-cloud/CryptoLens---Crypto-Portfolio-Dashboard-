import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { fetchTopCryptos } from "../lib/api";
import type { CryptoAsset } from "../types";

const POLL_INTERVAL = 60_000; // 60 seconds

/**
 * Hook that fetches the top 50 cryptos from CoinGecko,
 * polls every 60s, and pauses polling when the tab is hidden.
 */
export function useCryptoPrices() {
  const isVisible = useRef(true);

  useEffect(() => {
    const handleVisibility = () => {
      isVisible.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return useQuery<CryptoAsset[], Error>({
    queryKey: ["cryptoPrices"],
    queryFn: () => fetchTopCryptos(),
    staleTime: POLL_INTERVAL,
    refetchInterval: (query) => {
      // Pause polling when tab is inactive
      if (!isVisible.current) return false;
      // Also pause if we're in an error/rate-limited state
      if (query.state.error) return false;
      return POLL_INTERVAL;
    },
    refetchIntervalInBackground: false,
    retry: (failureCount, error) => {
      // Don't retry on rate limit or validation errors
      if (error.message.startsWith("RATE_LIMITED:")) return false;
      if (error.message === "VALIDATION_ERROR") return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
  });
}

/**
 * Derive a price map (cryptoId → current_price) from query data.
 */
export function usePriceMap(): Record<string, number> {
  const { data } = useCryptoPrices();
  const assets: CryptoAsset[] = data ?? [];
  if (assets.length === 0) return {};
  return Object.fromEntries(assets.map((c) => [c.id, c.current_price]));
}