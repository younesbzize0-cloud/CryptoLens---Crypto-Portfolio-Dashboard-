import { useState } from "react";
import { X, Search, ChevronRight } from "lucide-react";
import { usePortfolioStore } from "../store/portfolioStore";
import { useCryptoPrices } from "../hooks/useCryptoPrices";
import { formatUSD } from "../utils/pnl";
import type { CryptoAsset } from "../types";

interface Props { open: boolean; onClose: () => void; }

export function AddPositionModal({ open, onClose }: Props) {
  const { data: rawAssets } = useCryptoPrices();
  const assets: CryptoAsset[] = rawAssets ?? [];
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
  const isOverBudget = total > remainingCash && total > 0;

  const handleSelect = (asset: CryptoAsset) => {
    setSelected(asset);
    setBuyPrice(asset.current_price.toString());
    setSearch("");
    setError(null);
  };

  const handleSubmit = () => {
    setError(null);
    const qty = parseFloat(quantity);
    const price = parseFloat(buyPrice);
    if (!selected) return setError("Sélectionnez une crypto.");
    if (!qty || qty <= 0) return setError("Quantité invalide.");
    if (!price || price <= 0) return setError("Prix d'achat invalide.");
    if (total > remainingCash) return setError(`Fonds insuffisants. Disponible : ${formatUSD(remainingCash)}`);

    addPosition({ cryptoId: selected.id, symbol: selected.symbol, name: selected.name, image: selected.image, quantity: qty, avgBuyPrice: price });
    setSelected(null); setQuantity(""); setBuyPrice("");
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{
      position: "fixed",
      inset: 0,
      zIndex: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      background: "rgba(6,6,8,0.8)",
      backdropFilter: "blur(12px)",
    }}>
      <div className="modal-panel card" style={{ width: "100%", maxWidth: 460 }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--border)",
        }}>
          <div>
            <div className="font-display" style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>
              Ajouter une position
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
              Cash disponible : <span style={{ color: "var(--gold)" }}>{formatUSD(remainingCash)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 6,
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Crypto selector */}
          <div>
            <Label>Crypto-actif</Label>
            {!selected ? (
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input
                  className="input"
                  type="text"
                  placeholder="Bitcoin, ETH, SOL…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: 34 }}
                  autoFocus
                />
                {search && (
                  <div style={{
                    position: "absolute",
                    zIndex: 20,
                    top: "calc(100% + 6px)",
                    left: 0, right: 0,
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                    maxHeight: 240,
                    overflowY: "auto",
                  }}>
                    {filtered.slice(0, 8).map((a) => (
                      <div
                        key={a.id}
                        onClick={() => handleSelect(a)}
                        className="row-hover"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 14px",
                          cursor: "pointer",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <img src={a.image} alt={a.name} style={{ width: 24, height: 24, borderRadius: "50%" }} />
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{a.name}</span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>{a.symbol}</span>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-secondary)" }}>{formatUSD(a.current_price)}</span>
                        <ChevronRight size={12} style={{ color: "var(--text-muted)" }} />
                      </div>
                    ))}
                    {filtered.length === 0 && (
                      <div style={{ padding: "14px", textAlign: "center", color: "var(--text-muted)", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                        Aucun résultat
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "var(--surface-0)",
                border: "1px solid var(--border-gold)",
                borderRadius: 10,
                padding: "10px 14px",
                boxShadow: "0 0 12px rgba(240,180,41,0.08)",
              }}>
                <img src={selected.image} alt={selected.name} style={{ width: 32, height: 32, borderRadius: "50%" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{selected.name}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>
                    Prix actuel: <span style={{ color: "var(--gold)" }}>{formatUSD(selected.current_price)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <Label>Quantité</Label>
            <input
              className="input"
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Buy price */}
          <div>
            <Label>Prix d'achat (USD)</Label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>$</span>
              <input
                className="input"
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                style={{ paddingLeft: 26 }}
              />
            </div>
          </div>

          {/* Total */}
          {total > 0 && (
            <div style={{
              background: isOverBudget ? "rgba(240,78,78,0.08)" : "var(--surface-0)",
              border: `1px solid ${isOverBudget ? "rgba(240,78,78,0.25)" : "var(--border)"}`,
              borderRadius: 10,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Total estimé</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 15, color: isOverBudget ? "var(--red)" : "var(--gold)" }}>
                {formatUSD(total)}
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(240,78,78,0.08)",
              border: "1px solid rgba(240,78,78,0.2)",
              borderRadius: 10,
              padding: "10px 14px",
              color: "var(--red)",
              fontSize: 12,
              fontFamily: "'DM Mono', monospace",
            }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>
              Annuler
            </button>
            <button className="btn btn-gold" onClick={handleSubmit} style={{ flex: 2 }}>
              Confirmer la position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 8 }}>
      {children}
    </div>
  );
}
