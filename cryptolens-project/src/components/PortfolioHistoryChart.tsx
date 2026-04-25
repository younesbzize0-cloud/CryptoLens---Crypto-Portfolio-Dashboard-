import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePortfolioHistory } from "../hooks/usePortfolioHistory";
import { formatUSD } from "../utils/pnl";
import type { TimeRange } from "../types";

export function PortfolioHistoryChart() {
  const [range, setRange] = useState<TimeRange>("7");
  const { data, isLoading, isError } = usePortfolioHistory(range);

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-100">Courbe du portefeuille</h3>
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          {(["7", "30"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors
                ${range === r
                  ? "bg-yellow-500 text-gray-900"
                  : "text-gray-400 hover:text-gray-200"}`}
            >
              {r}J
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
          Chargement des données historiques…
        </div>
      )}

      {isError && (
        <div className="h-48 flex items-center justify-center text-red-400 text-sm">
          Erreur de chargement. Réessayez dans quelques instants.
        </div>
      )}

      {!isLoading && !isError && data.length === 0 && (
        <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
          Ajoutez des positions pour voir la courbe historique.
        </div>
      )}

      {!isLoading && !isError && data.length > 0 && (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6B7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6B7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatUSD(v, true)}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "0.75rem",
                color: "#F9FAFB",
              }}
              formatter={(v: number) => [formatUSD(v), "Valeur"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#F59E0B"
              strokeWidth={2}
              fill="url(#portfolioGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#F59E0B" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}