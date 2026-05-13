import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { usePnlCalculator } from "../hooks/usePnlCalculator";
import { formatUSD, formatPct } from "../utils/pnl";
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";

const PALETTE = [
  "#F0B429", "#22C97A", "#4E8BF0", "#F04E4E",
  "#A78BFA", "#FB7185", "#34D399", "#60A5FA",
  "#FBBF24", "#F472B6",
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface-2)",
      border: "1px solid var(--border-gold)",
      borderRadius: 12,
      padding: "10px 14px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
        {payload[0].name}
      </div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "var(--gold)", fontWeight: 500 }}>
        {formatUSD(payload[0].value)}
      </div>
    </div>
  );
};

export function PortfolioSummary() {
  const summary = usePnlCalculator();
  const isPnlPos = summary.totalPnL >= 0;

  const pieData = summary.positions.map((p) => ({
    name: p.symbol.toUpperCase(),
    value: parseFloat(p.currentValue.toFixed(2)),
  }));

  if (summary.positions.length === 0) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <SectionTitle>Mon Portefeuille</SectionTitle>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 8, marginBottom: 20 }}>
          Ajoutez des positions pour voir votre P&L en temps réel.
        </p>
        <div className="stat-block" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Capital disponible</span>
          <span style={{ fontFamily: "'DM Mono', monospace", color: "var(--gold)", fontWeight: 700, fontSize: 16 }}>
            {formatUSD(summary.remainingCash)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 24 }}>
      <SectionTitle>Mon Portefeuille</SectionTitle>

      {/* Stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
        <StatCard
          icon={<Wallet size={14} />}
          label="Valeur totale"
          value={formatUSD(summary.totalValue)}
          accent
        />
        <StatCard
          icon={isPnlPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          label="P&L total"
          value={formatUSD(summary.totalPnL)}
          sub={formatPct(summary.totalPnLPercent)}
          positive={isPnlPos}
        />
        <StatCard
          icon={<DollarSign size={14} />}
          label="Investi"
          value={formatUSD(summary.totalCostBasis)}
        />
        <StatCard
          icon={<DollarSign size={14} />}
          label="Cash libre"
          value={formatUSD(summary.remainingCash)}
        />
      </div>

      {/* Divider */}
      <div className="divider" style={{ margin: "20px 0" }} />

      {/* Pie chart */}
      <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
        Répartition
      </div>

      <div style={{ position: "relative" }}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          pointerEvents: "none",
        }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "var(--text-muted)" }}>Total</div>
          <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
            {formatUSD(summary.totalValue, true)}
          </div>
        </div>
      </div>

      {/* Legend pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
        {pieData.map((d, i) => (
          <div key={d.name} style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "var(--surface-0)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "3px 9px",
            fontSize: 11,
            fontFamily: "'DM Mono', monospace",
            color: "var(--text-secondary)",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
      {children}
    </div>
  );
}

function StatCard({ icon, label, value, sub, positive, accent }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="stat-block" style={{ position: "relative", overflow: "hidden" }}>
      {/* Subtle accent glow for main card */}
      {accent && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 2,
          background: "linear-gradient(to right, transparent, var(--gold), transparent)",
          borderRadius: "2px 2px 0 0",
        }} />
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ color: accent ? "var(--gold)" : "var(--text-muted)", opacity: 0.8 }}>{icon}</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {label}
        </span>
      </div>
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontWeight: 500,
        fontSize: 14,
        color: accent ? "var(--gold)" : "var(--text-primary)",
        textShadow: accent ? "0 0 12px rgba(240,180,41,0.3)" : "none",
      }}>
        {value}
      </div>
      {sub && (
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          marginTop: 2,
          color: positive ? "var(--green)" : "var(--red)",
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}
