import { useState, useMemo } from "react";
import type { CryptoAsset, MarketTableSort, SortField } from "../types";
import { formatUSD, formatPct } from "../utils/pnl";

interface Props {
  assets: CryptoAsset[];
  onSelect?: (asset: CryptoAsset) => void;
  selectedId?: string;
}

const COLUMNS: { label: string; field: SortField }[] = [
  { label: "#", field: "market_cap_rank" },
  { label: "Prix", field: "current_price" },
  { label: "24h", field: "price_change_percentage_24h" },
  { label: "Mkt Cap", field: "market_cap" },
];

export function MarketTable({ assets, onSelect, selectedId }: Props) {
  const [sort, setSort] = useState<MarketTableSort>({
    field: "market_cap_rank",
    direction: "asc",
  });
  const [search, setSearch] = useState("");

  const sorted = useMemo(() => {
    let filtered = assets.filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.symbol.toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      const va = a[sort.field] ?? 0;
      const vb = b[sort.field] ?? 0;
      return sort.direction === "asc"
        ? (va as number) - (vb as number)
        : (vb as number) - (va as number);
    });

    return filtered;
  }, [assets, sort, search]);

  const toggleSort = (field: SortField) => {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" }
    );
  };

  const arrow = (field: SortField) => {
    if (sort.field !== field) return <span className="text-gray-600 ml-1">↕</span>;
    return (
      <span className="text-yellow-400 ml-1">
        {sort.direction === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Search */}
      <div className="p-4 border-b border-gray-800">
        <input
          type="text"
          placeholder="Rechercher une crypto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 text-gray-100 placeholder-gray-500 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40 transition"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left px-4 py-3 font-medium">
                <button onClick={() => toggleSort("market_cap_rank")} className="flex items-center hover:text-gray-300">
                  # {arrow("market_cap_rank")}
                </button>
              </th>
              <th className="text-left px-4 py-3 font-medium">Actif</th>
              <th className="text-right px-4 py-3 font-medium">
                <button onClick={() => toggleSort("current_price")} className="flex items-center ml-auto hover:text-gray-300">
                  Prix {arrow("current_price")}
                </button>
              </th>
              <th className="text-right px-4 py-3 font-medium">
                <button onClick={() => toggleSort("price_change_percentage_24h")} className="flex items-center ml-auto hover:text-gray-300">
                  24h {arrow("price_change_percentage_24h")}
                </button>
              </th>
              <th className="text-right px-4 py-3 font-medium hidden md:table-cell">
                <button onClick={() => toggleSort("market_cap")} className="flex items-center ml-auto hover:text-gray-300">
                  Mkt Cap {arrow("market_cap")}
                </button>
              </th>
              <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">Vol 24h</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((asset) => {
              const pct = asset.price_change_percentage_24h ?? 0;
              const isSelected = asset.id === selectedId;
              return (
                <tr
                  key={asset.id}
                  onClick={() => onSelect?.(asset)}
                  className={`border-b border-gray-800/50 transition-colors cursor-pointer
                    ${isSelected ? "bg-yellow-500/10" : "hover:bg-gray-800/60"}`}
                >
                  <td className="px-4 py-3 text-gray-500 font-mono">
                    {asset.market_cap_rank}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={asset.image}
                        alt={asset.name}
                        className="w-7 h-7 rounded-full"
                        loading="lazy"
                      />
                      <div>
                        <p className="font-semibold text-gray-100">{asset.name}</p>
                        <p className="text-gray-500 text-xs uppercase">{asset.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-200">
                    {formatUSD(asset.current_price)}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold
                    ${pct >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatPct(pct)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 hidden md:table-cell">
                    {formatUSD(asset.market_cap, true)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 hidden lg:table-cell">
                    {formatUSD(asset.total_volume, true)}
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-600">
                  Aucune crypto trouvée pour « {search} »
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}