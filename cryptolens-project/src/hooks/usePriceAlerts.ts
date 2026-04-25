import { useEffect } from "react";
import { usePortfolioStore } from "../store/portfolioStore";
import type { CryptoAsset } from "../types";

async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function sendNotification(title: string, body: string) {
  if (Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
  });
}

/**
 * Checks active price alerts against the latest crypto prices
 * and fires a browser notification when a threshold is crossed.
 */
export function usePriceAlerts(prices: CryptoAsset[] | undefined) {
  const alerts = usePortfolioStore((s) => s.alerts);
  const markAlertTriggered = usePortfolioStore((s) => s.markAlertTriggered);

  // Request permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!prices || prices.length === 0) return;

    const priceMap: Record<string, number> = {};
    prices.forEach((c) => {
      priceMap[c.id] = c.current_price;
    });

    const untriggered = alerts.filter((a) => !a.triggered);

    for (const alert of untriggered) {
      const currentPrice = priceMap[alert.cryptoId];
      if (currentPrice === undefined) continue;

      const hit =
        alert.direction === "above"
          ? currentPrice >= alert.targetPrice
          : currentPrice <= alert.targetPrice;

      if (hit) {
        markAlertTriggered(alert.id);
        sendNotification(
          `🚨 Alerte ${alert.symbol.toUpperCase()}`,
          `${alert.name} est ${
            alert.direction === "above" ? "au-dessus" : "en-dessous"
          } de $${alert.targetPrice.toLocaleString()} (actuel: $${currentPrice.toLocaleString()})`
        );
      }
    }
  }, [prices, alerts, markAlertTriggered]);
}