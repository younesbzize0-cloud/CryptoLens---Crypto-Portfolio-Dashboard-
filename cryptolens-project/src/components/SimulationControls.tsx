import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { usePortfolioStore } from "../store/portfolioStore";
import { formatUSD } from "../utils/pnl";

export function SimulationControls() {
  const resetPortfolio = usePortfolioStore((s) => s.resetPortfolio);
  const portfolio = usePortfolioStore((s) => s.portfolio);

  const [capital, setCapital] = useState("10000");
  const [confirm, setConfirm] = useState(false);

  const handleReset = () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    const amount = parseFloat(capital);
    if (amount > 0) {
      resetPortfolio(amount);
    }
    setConfirm(false);
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
      <h3 className="font-bold text-gray-100 flex items-center gap-2">
        <RotateCcw size={16} className="text-blue-400" />
        Mode simulation
      </h3>

      <div className="bg-gray-800/60 rounded-xl px-4 py-3 flex justify-between items-center">
        <span className="text-gray-400 text-sm">Capital initial</span>
        <span className="text-yellow-400 font-mono font-bold">
          {formatUSD(portfolio.initialCapital)}
        </span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
          <input
            type="number"
            min="100"
            step="100"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            className="w-full bg-gray-800 text-gray-100 rounded-xl pl-7 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40 font-mono"
          />
        </div>
        <button
          onClick={handleReset}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors
            ${confirm
              ? "bg-red-500 hover:bg-red-400 text-white"
              : "bg-blue-600 hover:bg-blue-500 text-white"}`}
        >
          {confirm ? "Confirmer" : "Reset"}
        </button>
      </div>

      {confirm && (
        <p className="text-red-400 text-xs">
          ⚠️ Toutes vos positions seront supprimées. Cliquez à nouveau pour confirmer.
        </p>
      )}
    </div>
  );
}