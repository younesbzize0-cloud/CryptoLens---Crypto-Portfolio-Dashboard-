import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { usePortfolioHistory } from "../hooks/usePortfolioHistory";
import { formatUSD } from "../utils/pnl";
import type { TimeRange } from "../types";

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface-2)",
      border: "1px solid var(--border-gold)",
      borderRadius: 10,
      padding: "10px 14px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, color: "var(--gold)", fontWeight: 600 }}>
        {formatUSD(payload[0].value)}
      </div>
    </div>
  );
};

export function PortfolioHistoryChart() {
  const [range, setRange] = useState<TimeRange>("7");
  const { data, isLoading, isError } = usePortfolioHistory(range);

  // Calculate reference line (first value)
  const baseValue = data[0]?.value ?? null;

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Performance
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
            Valeur du portefeuille
          </div>
        </div>

        <div style={{
          display: "flex",
          gap: 2,
          background: "var(--surface-0)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 3,
        }}>
          {(["7", "30"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                transition: "all 0.2s",
                background: range === r ? "var(--gold)" : "none",
                color: range === r ? "#0C0D11" : "var(--text-muted)",
                boxShadow: range === r ? "0 2px 8px rgba(240,180,41,0.3)" : "none",
              }}
            >
              {r}J
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="skeleton" style={{ width: "100%", height: 160, borderRadius: 12 }} />
        </div>
      )}

      {isError && (
        <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
          Erreur de chargement — réessayez
        </div>
      )}

      {!isLoading && !isError && data.length === 0 && (
        <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: 12, textAlign: "center" }}>
          Ajoutez des positions<br />pour voir l'historique
        </div>
      )}

      {!isLoading && !isError && data.length > 0 && (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 8, right: 2, bottom: 0, left: 2 }}>
            <defs>
              <linearGradient id="areaGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#F0B429" stopOpacity={0.3} />
                <stop offset="60%"  stopColor="#F0B429" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#F0B429" stopOpacity={0} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.04)" vertical={false} />

            <XAxis
              dataKey="date"
              tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 10, fontFamily: "'DM Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatUSD(v, true)}
              width={72}
            />
            <Tooltip content={<CustomTooltip />} />

            {baseValue && (
              <ReferenceLine
                y={baseValue}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="4 4"
              />
            )}

            <Area
              type="monotone"
              dataKey="value"
              stroke="#F0B429"
              strokeWidth={2}
              fill="url(#areaGold)"
              dot={false}
              activeDot={{ r: 5, fill: "#F0B429", stroke: "var(--surface-1)", strokeWidth: 2 }}
              filter="url(#glow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
