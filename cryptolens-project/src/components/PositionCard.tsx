import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { usePortfolioStore } from "../store/portfolioStore";
import { usePnlCalculator } from "../hooks/usePnlCalculator";
import { formatUSD, formatPct } from "../utils/pnl";

export function PositionCard() {
  const removePosition = usePortfolioStore((s) => s.removePosition);
  const summary = usePnlCalculator();

  if (summary.positions.length === 0) {
    return (
      <div className="card" style={{ padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
          Aucune position
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Ajoutez une position via le bouton "+ Position"
        </div>
      </div>
    );
  }

  const sorted = [...summary.positions].sort((a, b) => b.absolutePnL - a.absolutePnL);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Positions
        </div>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          color: "var(--text-muted)",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "2px 10px",
        }}>
          {sorted.length}
        </span>
      </div>

      <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((pos) => {
          const isPnlPos = pos.absolutePnL >= 0;
          const barWidth = Math.min(100, Math.abs(pos.allocationPercent));

          return (
            <div
              key={pos.id}
              className="card"
              style={{ padding: "16px 18px", position: "relative", overflow: "hidden", cursor: "default" }}
            >
              {/* Allocation bar background */}
              <div style={{
                position: "absolute",
                bottom: 0, left: 0,
                height: 2,
                width: `${barWidth}%`,
                background: isPnlPos
                  ? "linear-gradient(to right, rgba(34,201,122,0.4), rgba(34,201,122,0.1))"
                  : "linear-gradient(to right, rgba(240,78,78,0.4), rgba(240,78,78,0.1))",
                borderRadius: "0 2px 0 0",
                transition: "width 0.6s ease",
              }} />

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Logo with glow */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img
                    src={pos.image}
                    alt={pos.name}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      border: "1px solid var(--border)",
                      boxShadow: isPnlPos
                        ? "0 0 12px rgba(34,201,122,0.2)"
                        : "0 0 12px rgba(240,78,78,0.15)",
                    }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>
                      {pos.symbol.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
                      ×{pos.quantity}
                    </span>
                    <span style={{
                      marginLeft: "auto",
                      fontFamily: "'DM Mono', monospace",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "var(--text-primary)",
                    }}>
                      {formatUSD(pos.currentValue)}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text-muted)" }}>
                      achat {formatUSD(pos.avgBuyPrice)} · {pos.allocationPercent.toFixed(1)}%
                    </span>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                      {isPnlPos
                        ? <TrendingUp size={11} style={{ color: "var(--green)" }} />
                        : <TrendingDown size={11} style={{ color: "var(--red)" }} />
                      }
                      <span style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 11,
                        fontWeight: 600,
                        color: isPnlPos ? "var(--green)" : "var(--red)",
                      }}>
                        {formatUSD(Math.abs(pos.absolutePnL))} ({formatPct(pos.percentagePnL)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => removePosition(pos.id)}
                  title="Supprimer"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: "4px",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.2s, background 0.2s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--red)";
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,78,78,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                    (e.currentTarget as HTMLButtonElement).style.background = "none";
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
