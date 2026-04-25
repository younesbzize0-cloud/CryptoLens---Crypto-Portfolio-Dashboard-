import { useState } from "react";
import { X, Search } from "lucide-react";
import { usePortfolioStore } from "../store/portfolioStore";
import { useCryptoPrices } from "../hooks/useCryptoPrices";
import { formatUSD } from "../utils/pnl";
import type { CryptoAsset } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddPositionModal({ open, onClose }: Props) {
  const { data: assets = [] } = useCryptoPrices();
  const addPosition = usePortfolioStore((s) => s.addPosition);
  const remainingCash = usePortfolioStore((s) => s.portfolio.remainingCash);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CryptoAsset | null>(null);
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const filtered = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const total = parseFloat(quantity || "0") * parseFloat(buyPrice || "0");

  const handleSelect = (asset: CryptoAsset) => {
    setSelected(asset);
    setBuyPrice(asset.current_price.toString());
    setSearch("");
  };

  const handleSubmit = () => {
    setError(null);
    const qty = parseFloat(quantity);
    const price = parseFloat(buyPrice);

    if (!selected) return setError("Sélectionnez une crypto.");
    if (!qty || qty <= 0) return setError("Quantité invalide.");
    if (!price || price <= 0) return setError("Prix d'achat invalide.");
    if (total > remainingCash)
      return setError(
        `Fonds insuffisants. Cash disponible : ${formatUSD(remainingCash)}`
      );

    addPosition({
      cryptoId: selected.id,
      symbol: selected.symbol,
      name: selected.name,
      image: selected.image,
      quantity: qty,
      avgBuyPrice: price,
    });

    // Reset
    setSelected(null);
    setQuantity("");
    setBuyPrice("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-bold text-gray-100">Ajouter une position</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Crypto search */}
          {!selected ? (
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Crypto
              </label>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Bitcoin, Ethereum…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-800 text-gray-100 placeholder-gray-600 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40"
                  autoFocus
                />
              </div>
              {search && (
                <ul className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                  {filtered.slice(0, 8).map((a) => (
                    <li
                      key={a.id}
                      onClick={() => handleSelect(a)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <img src={a.image} alt={a.name} className="w-6 h-6 rounded-full" />
                      <span className="text-gray-100 text-sm font-medium">{a.name}</span>
                      <span className="text-gray-500 text-xs uppercase ml-auto">{a.symbol}</span>
                    </li>
                  ))}
                  {filtered.length === 0 && (
                    <li className="px-4 py-3 text-gray-600 text-sm">Aucun résultat</li>
                  )}
                </ul>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3">
              <img src={selected.image} alt={selected.name} className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <p className="text-gray-100 font-semibold">{selected.name}</p>
                <p className="text-gray-500 text-xs">{formatUSD(selected.current_price)}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-gray-300"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Quantité
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-gray-800 text-gray-100 placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40 font-mono"
            />
          </div>

          {/* Buy price */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Prix d'achat (USD)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              className="w-full bg-gray-800 text-gray-100 placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40 font-mono"
            />
          </div>

          {/* Total & cash */}
          {total > 0 && (
            <div className="bg-gray-800/60 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-gray-400 text-sm">Total estimé</span>
              <span className={`font-mono font-bold text-sm ${total > remainingCash ? "text-red-400" : "text-yellow-400"}`}>
                {formatUSD(total)}
              </span>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm hover:bg-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-xl bg-yellow-500 text-gray-900 font-bold text-sm hover:bg-yellow-400 transition-colors"
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}