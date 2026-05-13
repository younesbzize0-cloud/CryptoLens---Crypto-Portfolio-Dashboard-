import { useState, useMemo } from "react";
import type { CryptoAsset, MarketTableSort, SortField } from "../types";
import { formatUSD, formatPct } from "../utils/pnl";
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";

interface Props {
  assets: CryptoAsset[];
  onSelect?: (asset: CryptoAsset) => void;
  selectedId?: string;
}

export function MarketTable({ assets, onSelect, selectedId }: Props) {
  const [sort, setSort] = useState<MarketTableSort>({ field: "market_cap_rank", direction: "asc" });
  const [search, setSearch] = useState("");

  const sorted = useMemo(() => {
    const filtered = assets.filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.symbol.toLowerCase().includes(search.toLowerCase())
    );
    filtered.sort((a: CryptoAsset, b: CryptoAsset) => {
      const va = (a[sort.field] ?? 0) as number;
      const vb = (b[sort.field] ?? 0) as number;
      return sort.direction === "asc" ? va - vb : vb - va;
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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field) return <ArrowUpDown size={11} style={{ color: "var(--text-muted)", opacity: 0.5 }} />;
    return sort.direction === "asc"
      ? <ArrowUp size={11} style={{ color: "var(--gold)" }} />
      : <ArrowDown size={11} style={{ color: "var(--gold)" }} />;
  };

  const headerBtn = (label: string, field: SortField) => (
    <button
      onClick={() => toggleSort(field)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: "none",
        border: "none",
        cursor: "pointer",
        color: sort.field === field ? "var(--gold)" : "var(--text-muted)",
        fontFamily: "'DM Mono', monospace",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
        padding: 0,
        transition: "color 0.2s",
      }}
    >
      {label} <SortIcon field={field} />
    </button>
  );

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "20px 24px 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}>
        <div>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Marché
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
            {sorted.length} actifs · CoinGecko
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", flex: "0 0 220px" }}>
          <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            className="input"
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34, fontSize: 12 }}
          />
        </div>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "48px 1fr 130px 100px 140px 140px",
        padding: "10px 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-0)",
      }}>
        <div>{headerBtn("#", "market_cap_rank")}</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Actif</div>
        <div style={{ textAlign: "right" as const }}>{headerBtn("Prix", "current_price")}</div>
        <div style={{ textAlign: "right" as const }}>{headerBtn("24h", "price_change_percentage_24h")}</div>
        <div style={{ textAlign: "right" as const, display: "flex", justifyContent: "flex-end" }}>{headerBtn("Mkt Cap", "market_cap")}</div>
        <div style={{ textAlign: "right" as const, fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>Vol 24h</div>
      </div>

      {/* Rows */}
      <div style={{ maxHeight: 560, overflowY: "auto" }}>
        {sorted.map((asset, idx) => {
          const pct = asset.price_change_percentage_24h ?? 0;
          const isPos = pct >= 0;
          const isSelected = asset.id === selectedId;

          return (
            <div
              key={asset.id}
              className={`row-hover ${isSelected ? "row-selected" : ""}`}
              onClick={() => onSelect?.(asset)}
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr 130px 100px 140px 140px",
                padding: "12px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.025)",
                cursor: "pointer",
                alignItems: "center",
                animation: `fadeSlideUp 0.4s ${idx * 0.018}s both`,
              }}
            >
              {/* Rank */}
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>
                {asset.market_cap_rank}
              </div>

              {/* Asset */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src={asset.image}
                  alt={asset.name}
                  loading="lazy"
                  style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--border)" }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{asset.name}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>{asset.symbol}</div>
                </div>
              </div>

              {/* Price */}
              <div style={{ textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
                {formatUSD(asset.current_price)}
              </div>

              {/* 24h change */}
              <div style={{ textAlign: "right" }}>
                <span className={`badge ${isPos ? "badge-green" : "badge-red"}`}>
                  {isPos ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
                </span>
              </div>

              {/* Market cap */}
              <div style={{ textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text-secondary)" }}>
                {formatUSD(asset.market_cap, true)}
              </div>

              {/* Volume */}
              <div style={{ textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>
                {formatUSD(asset.total_volume, true)}
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
            Aucun résultat pour « {search} »
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
