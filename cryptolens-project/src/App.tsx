import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TrendingUp, BarChart2, Bell, Settings, Plus, RefreshCw } from "lucide-react";

import { MarketTable } from "./components/MarketTable";
import { PortfolioSummary } from "./components/PortfolioSummary";
import { PositionCard } from "./components/PositionCard";
import { AddPositionModal } from "./components/AddPositionModal";
import { PriceAlertManager } from "./components/PriceAlertManager";
import { PortfolioHistoryChart } from "./components/PortfolioHistoryChart";
import { SimulationControls } from "./components/SimulationControls";
import { useCryptoPrices } from "./hooks/useCryptoPrices";
import { usePriceAlerts } from "./hooks/usePriceAlerts";
import { parseApiError } from "./lib/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000,
    },
  },
});

type Tab = "market" | "portfolio" | "alerts" | "settings";

function Dashboard() {
  const [tab, setTab] = useState<Tab>("market");
  const [addOpen, setAddOpen] = useState(false);

  const { data: assets, isLoading, isError, error, dataUpdatedAt, refetch, isFetching } =
    useCryptoPrices();

  // Wire up price alert notifications
  usePriceAlerts(assets);

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "market", label: "Marché", icon: <TrendingUp size={16} /> },
    { id: "portfolio", label: "Portefeuille", icon: <BarChart2 size={16} /> },
    { id: "alerts", label: "Alertes", icon: <Bell size={16} /> },
    { id: "settings", label: "Simulation", icon: <Settings size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Top bar */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-yellow-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={14} className="text-gray-900" />
            </div>
            <span className="font-bold text-gray-100 tracking-tight">CryptoLens</span>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-gray-600 text-xs hidden md:block">
                Mis à jour {lastUpdated}
              </span>
            )}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Actualiser"
              className="text-gray-500 hover:text-yellow-400 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={13} /> Position
            </button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 pb-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                ${tab === t.id
                  ? "border-yellow-500 text-yellow-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Error banner */}
        {isError && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            ⚠️ {parseApiError(error)} — Affichage des dernières données en cache.
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-800/60 rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && tab === "market" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <MarketTable assets={assets ?? []} />
            </div>
            <div className="space-y-4">
              <PortfolioSummary />
              <PortfolioHistoryChart />
            </div>
          </div>
        )}

        {!isLoading && tab === "portfolio" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <PortfolioSummary />
              <PortfolioHistoryChart />
            </div>
            <div>
              <PositionCard />
            </div>
          </div>
        )}

        {!isLoading && tab === "alerts" && (
          <div className="max-w-lg">
            <PriceAlertManager />
          </div>
        )}

        {!isLoading && tab === "settings" && (
          <div className="max-w-sm">
            <SimulationControls />
          </div>
        )}
      </main>

      <AddPositionModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}