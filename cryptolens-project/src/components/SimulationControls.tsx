import { useState } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { usePortfolioStore } from "../store/portfolioStore";
import { formatUSD } from "../utils/pnl";

const PRESETS = [5_000, 10_000, 25_000, 50_000, 100_000];

export function SimulationControls() {
  const resetPortfolio = usePortfolioStore((s) => s.resetPortfolio);
  const portfolio = usePortfolioStore((s) => s.portfolio);

  const [capital, setCapital] = useState("10000");
  const [confirm, setConfirm] = useState(false);

  const handleReset = () => {
    if (!confirm) { setConfirm(true); return; }
    const amount = parseFloat(capital);
    if (amount > 0) resetPortfolio(amount);
    setConfirm(false);
  };

  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <RotateCcw size={16} style={{ color: "var(--blue)" }} />
        Mode simulation
      </div>

      {/* Current state */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {[
          { label: "Capital initial", value: formatUSD(portfolio.initialCapital), accent: false },
          { label: "Cash disponible", value: formatUSD(portfolio.remainingCash), accent: true },
          { label: "Positions", value: `${portfolio.positions.length}`, accent: false },
        ].map((item) => (
          <div key={item.label} className="stat-block" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.label}</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, fontSize: 14, color: item.accent ? "var(--gold)" : "var(--text-primary)" }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="divider" style={{ marginBottom: 24 }} />

      {/* Capital input */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
          Nouveau capital fictif
        </div>

        {/* Presets */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setCapital(p.toString())}
              style={{
                padding: "4px 10px",
                border: `1px solid ${capital === p.toString() ? "var(--border-gold)" : "var(--border)"}`,
                borderRadius: 6,
                background: capital === p.toString() ? "rgba(240,180,41,0.1)" : "var(--surface-0)",
                color: capital === p.toString() ? "var(--gold)" : "var(--text-muted)",
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              ${(p / 1000).toFixed(0)}k
            </button>
          ))}
        </div>

        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: 13, pointerEvents: "none" }}>$</span>
          <input
            className="input"
            type="number"
            min="100"
            step="100"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            style={{ paddingLeft: 26 }}
          />
        </div>
      </div>

      {/* Warning */}
      {confirm && (
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          background: "rgba(240,78,78,0.08)",
          border: "1px solid rgba(240,78,78,0.2)",
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 12,
          color: "var(--red)",
          fontSize: 12,
          fontFamily: "'DM Mono', monospace",
        }}>
          <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          Toutes les positions et alertes seront supprimées. Confirmer ?
        </div>
      )}

      <button
        onClick={handleReset}
        className="btn"
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: 10,
          background: confirm
            ? "linear-gradient(135deg, #F04E4E, #C93333)"
            : "var(--surface-2)",
          border: confirm ? "none" : "1px solid var(--border)",
          color: confirm ? "#fff" : "var(--text-secondary)",
          boxShadow: confirm ? "0 4px 16px rgba(240,78,78,0.3)" : "none",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "0.02em",
          transition: "all 0.25s",
        }}
      >
        <RotateCcw size={13} />
        {confirm ? "⚠️ Confirmer le reset" : "Réinitialiser le portefeuille"}
      </button>
    </div>
  );
}
