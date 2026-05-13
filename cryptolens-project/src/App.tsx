import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TrendingUp, BarChart2, Bell, Settings, Plus, RefreshCw, Wifi, WifiOff } from "lucide-react";

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
  defaultOptions: { queries: { gcTime: 5 * 60 * 1000 } },
});

type Tab = "market" | "portfolio" | "alerts" | "settings";

function Dashboard() {
  const [tab, setTab] = useState<Tab>("market");
  const [addOpen, setAddOpen] = useState(false);

  const {
    data: rawAssets,
    isLoading,
    isError,
    error,
    dataUpdatedAt,
    refetch,
    isFetching,
  } = useCryptoPrices();

  usePriceAlerts(rawAssets);

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "market",    label: "Marché",       icon: <TrendingUp size={14} /> },
    { id: "portfolio", label: "Portefeuille",  icon: <BarChart2 size={14} /> },
    { id: "alerts",    label: "Alertes",       icon: <Bell size={14} /> },
    { id: "settings",  label: "Simulation",    icon: <Settings size={14} /> },
  ];

  const assets = rawAssets ?? [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--void)" }}>
      {/* Ambient background */}
      <div className="bg-mesh" />
      <div className="bg-grid" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.6 }} />

      {/* ── Live Ticker ─────────────────────────────────────────── */}
      {assets.length > 0 && (
        <div style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-0)",
          overflow: "hidden",
          height: 32,
          display: "flex",
          alignItems: "center",
          position: "relative",
          zIndex: 50,
        }}>
          <div className="ticker-track" style={{ display: "flex", gap: 48, whiteSpace: "nowrap", paddingLeft: 24 }}>
            {[...assets, ...assets].map((a, i) => {
              const pct = a.price_change_percentage_24h ?? 0;
              return (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", color: "var(--text-muted)", fontWeight: 500 }}>
                    {a.symbol.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: "'DM Mono', monospace", color: "var(--text-primary)" }}>
                    ${a.current_price.toLocaleString()}
                  </span>
                  <span style={{ color: pct >= 0 ? "var(--green)" : "var(--red)", fontFamily: "'DM Mono', monospace" }}>
                    {pct >= 0 ? "▲" : "▼"}{Math.abs(pct).toFixed(2)}%
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="glass" style={{
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 16, height: 60 }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 8 }}>
            <div style={{
              width: 34,
              height: 34,
              background: "linear-gradient(135deg, #F5C842 0%, #D4960A 100%)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(240,180,41,0.4), 0 2px 6px rgba(0,0,0,0.4)",
              flexShrink: 0,
            }}>
              <TrendingUp size={16} color="#0C0D11" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display" style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                CryptoLens
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.06em", fontFamily: "'DM Mono', monospace" }}>
                FINANCECLUB ENSA
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav style={{ display: "flex", flex: 1, gap: 2 }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={tab === t.id ? "tab-active" : "tab-inactive"}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  background: "none",
                  border: "none",
                  borderBottom: tab === t.id ? "2px solid var(--gold)" : "2px solid transparent",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.01em",
                  transition: "all 0.2s",
                  color: tab === t.id ? "var(--gold)" : "var(--text-muted)",
                  borderRadius: "2px 2px 0 0",
                  marginBottom: -1,
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </nav>

          {/* Right controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Live indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {isError ? (
                <WifiOff size={12} color="var(--red)" />
              ) : (
                <div className="live-dot">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: isFetching ? "var(--gold)" : "var(--green)" }} />
                </div>
              )}
              {lastUpdated && (
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text-muted)" }}>
                  {lastUpdated}
                </span>
              )}
            </div>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Actualiser"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "6px 8px",
                cursor: isFetching ? "not-allowed" : "pointer",
                color: isFetching ? "var(--gold)" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                transition: "all 0.2s",
                opacity: isFetching ? 0.6 : 1,
              }}
            >
              <RefreshCw size={13} style={{ animation: isFetching ? "spin 1s linear infinite" : "none" }} />
            </button>

            <button
              className="btn btn-gold"
              onClick={() => setAddOpen(true)}
              style={{ fontSize: 12, padding: "7px 14px" }}
            >
              <Plus size={13} strokeWidth={2.5} />
              Position
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px", position: "relative", zIndex: 1 }}>

        {/* Error banner */}
        {isError && (
          <div style={{
            marginBottom: 20,
            background: "rgba(240,78,78,0.08)",
            border: "1px solid rgba(240,78,78,0.2)",
            borderRadius: var_radius_md,
            padding: "12px 16px",
            color: "var(--red)",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <WifiOff size={14} />
            {parseApiError(error)} — Données en cache affichées.
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 52, borderRadius: 12 }} />
            ))}
          </div>
        )}

        {/* Market Tab */}
        {!isLoading && tab === "market" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>
            <MarketTable assets={assets} />
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <PortfolioSummary />
              <PortfolioHistoryChart />
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {!isLoading && tab === "portfolio" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <PortfolioSummary />
              <PortfolioHistoryChart />
            </div>
            <PositionCard />
          </div>
        )}

        {/* Alerts Tab */}
        {!isLoading && tab === "alerts" && (
          <div style={{ maxWidth: 520 }}>
            <PriceAlertManager />
          </div>
        )}

        {/* Settings Tab */}
        {!isLoading && tab === "settings" && (
          <div style={{ maxWidth: 420 }}>
            <SimulationControls />
          </div>
        )}
      </main>

      <AddPositionModal open={addOpen} onClose={() => setAddOpen(false)} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// Fix the template literal issue
const var_radius_md = "var(--radius-md)";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
