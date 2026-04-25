import { Trash2 } from "lucide-react";
import { usePortfolioStore } from "../store/portfolioStore";
import { usePnlCalculator } from "../hooks/usePnlCalculator";
import { formatUSD, formatPct } from "../utils/pnl";

export function PositionCard() {
  const removePosition = usePortfolioStore((s) => s.removePosition);
  const summary = usePnlCalculator();

  if (summary.positions.length === 0) {
    return null;
  }

  const sorted = [...summary.positions].sort(
    (a, b) => b.absolutePnL - a.absolutePnL
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        Positions ({sorted.length})
      </h3>
      {sorted.map((pos) => {
        const isPnlPositive = pos.absolutePnL >= 0;
        return (
          <div
            key={pos.id}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-4 group hover:border-gray-700 transition-colors"
          >
            <img
              src={pos.image}
              alt={pos.name}
              className="w-10 h-10 rounded-full shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="font-bold text-gray-100">{pos.symbol.toUpperCase()}</span>
                  <span className="text-gray-500 text-xs ml-2">{pos.quantity} unités</span>
                </div>
                <span className="text-gray-100 font-mono font-semibold text-sm">
                  {formatUSD(pos.currentValue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">
                  Achat moy. {formatUSD(pos.avgBuyPrice)} · {pos.allocationPercent.toFixed(1)}% alloc.
                </span>
                <span className={`text-xs font-semibold font-mono ${isPnlPositive ? "text-emerald-400" : "text-red-400"}`}>
                  {isPnlPositive ? "▲" : "▼"} {formatUSD(Math.abs(pos.absolutePnL))} ({formatPct(pos.percentagePnL)})
                </span>
              </div>
            </div>
            <button
              onClick={() => removePosition(pos.id)}
              title="Supprimer la position"
              className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}