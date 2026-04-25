import { useState } from "react";
import { Bell, BellOff, Trash2, Plus } from "lucide-react";
import { usePortfolioStore } from "../store/portfolioStore";
import { useCryptoPrices } from "../hooks/useCryptoPrices";
import { formatUSD } from "../utils/pnl";

export function PriceAlertManager() {
  const { data: assets = [] } = useCryptoPrices();
  const alerts = usePortfolioStore((s) => s.alerts);
  const addAlert = usePortfolioStore((s) => s.addAlert);
  const removeAlert = usePortfolioStore((s) => s.removeAlert);

  const [cryptoId, setCryptoId] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [showForm, setShowForm] = useState(false);

  const selected = assets.find((a) => a.id === cryptoId);

  const handleAdd = () => {
    const price = parseFloat(targetPrice);
    if (!cryptoId || !price || price <= 0 || !selected) return;

    addAlert({
      cryptoId,
      symbol: selected.symbol,
      name: selected.name,
      targetPrice: price,
      direction,
    });
    setCryptoId("");
    setTargetPrice("");
    setShowForm(false);
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-100 flex items-center gap-2">
          <Bell size={16} className="text-yellow-400" />
          Alertes de prix
        </h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-gray-800/60 rounded-xl p-4 space-y-3">
          <select
            value={cryptoId}
            onChange={(e) => setCryptoId(e.target.value)}
            className="w-full bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
          >
            <option value="">Sélectionner une crypto…</option>
            {assets.slice(0, 50).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.symbol.toUpperCase()})
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as "above" | "below")}
              className="bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
            >
              <option value="above">Au-dessus de</option>
              <option value="below">En-dessous de</option>
            </select>
            <input
              type="number"
              placeholder="Prix cible $"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="flex-1 bg-gray-800 text-gray-100 placeholder-gray-600 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40 font-mono"
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={!cryptoId || !targetPrice}
            className="w-full py-2 rounded-xl bg-yellow-500 text-gray-900 font-bold text-sm hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Créer l'alerte
          </button>
        </div>
      )}

      {/* Alert list */}
      <div className="space-y-2">
        {alerts.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-4">
            Aucune alerte configurée
          </p>
        )}
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center justify-between rounded-xl px-4 py-3 border
              ${alert.triggered
                ? "border-gray-700 bg-gray-800/30 opacity-50"
                : "border-gray-700 bg-gray-800/60"}`}
          >
            <div className="flex items-center gap-2">
              {alert.triggered ? (
                <BellOff size={14} className="text-gray-600" />
              ) : (
                <Bell size={14} className="text-yellow-400" />
              )}
              <div>
                <p className="text-gray-200 text-sm font-semibold">
                  {alert.symbol.toUpperCase()}
                  <span className="text-gray-500 font-normal ml-1.5">
                    {alert.direction === "above" ? ">" : "<"}{" "}
                    {formatUSD(alert.targetPrice)}
                  </span>
                </p>
                {alert.triggered && (
                  <p className="text-xs text-emerald-400">✓ Déclenchée</p>
                )}
              </div>
            </div>
            <button
              onClick={() => removeAlert(alert.id)}
              className="text-gray-600 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}