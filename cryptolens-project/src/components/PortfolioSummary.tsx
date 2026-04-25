import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { usePnlCalculator } from "../hooks/usePnlCalculator";
import { formatUSD, formatPct } from "../utils/pnl";

const COLORS = [
  "#F59E0B", "#10B981", "#6366F1", "#EF4444", "#8B5CF6",
  "#EC4899", "#14B8A6", "#F97316", "#06B6D4", "#84CC16",
];

export function PortfolioSummary() {
  const summary = usePnlCalculator();

  const pieData = summary.positions.map((p) => ({
    name: p.symbol.toUpperCase(),
    value: parseFloat(p.currentValue.toFixed(2)),
  }));

  if (summary.positions.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-lg font-bold text-gray-100 mb-1">Mon Portefeuille</h2>
        <p className="text-gray-500 text-sm">
          Ajoutez des positions pour voir votre P&L en temps réel.
        </p>
        <div className="mt-4 p-4 bg-gray-800/50 rounded-xl flex items-center justify-between">
          <span className="text-gray-400 text-sm">Capital disponible</span>
          <span className="text-yellow-400 font-mono font-bold">
            {formatUSD(summary.remainingCash)}
          </span>
        </div>
      </div>
    );
  }

  const isPnlPositive = summary.totalPnL >= 0;

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-100 mb-4">Mon Portefeuille</h2>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Valeur totale" value={formatUSD(summary.totalValue)} accent />
          <MetricCard
            label="P&L total"
            value={formatUSD(summary.totalPnL)}
            sub={formatPct(summary.totalPnLPercent)}
            positive={isPnlPositive}
          />
          <MetricCard label="Investi" value={formatUSD(summary.totalCostBasis)} />
          <MetricCard label="Cash" value={formatUSD(summary.remainingCash)} />
        </div>
      </div>

      {/* Pie chart */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Répartition
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "0.75rem",
                color: "#F9FAFB",
              }}
              formatter={(value: number) => formatUSD(value)}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(v) => (
                <span className="text-gray-400 text-xs">{v}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  positive,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="bg-gray-800/60 rounded-xl p-3">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className={`font-mono font-bold text-sm ${accent ? "text-yellow-400" : "text-gray-100"}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs font-semibold mt-0.5 ${positive ? "text-emerald-400" : "text-red-400"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}