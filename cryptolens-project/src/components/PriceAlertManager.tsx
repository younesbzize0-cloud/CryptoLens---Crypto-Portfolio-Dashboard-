import { useState } from "react";
import { Bell, BellOff, Trash2, Plus, ChevronUp } from "lucide-react";
import { usePortfolioStore } from "../store/portfolioStore";
import { useCryptoPrices } from "../hooks/useCryptoPrices";
import { formatUSD } from "../utils/pnl";
import type { CryptoAsset, PriceAlert } from "../types";

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 6 }}>
      {children}
    </div>
  );
}

function AlertRow({ alert, onRemove }: { alert: PriceAlert; onRemove: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      background: "var(--surface-0)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "10px 14px",
    }}>
      {alert.triggered
        ? <BellOff size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        : <Bell size={13} style={{ color: "var(--gold)", flexShrink: 0 }} />
      }
      <div style={{ flex: 1 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600, fontSize: 12, color: "var(--text-primary)" }}>
          {alert.symbol.toUpperCase()}
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>
          {alert.direction === "above" ? "▲ >" : "▼ <"} {formatUSD(alert.targetPrice)}
        </span>
        {alert.triggered && (
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--green)", marginLeft: 10 }}>
            ✓ Déclenchée
          </span>
        )}
      </div>
      <button
        onClick={onRemove}
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex", borderRadius: 6, transition: "color 0.2s" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--red)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

export function PriceAlertManager() {
  const { data: rawAssets } = useCryptoPrices();
  const assets: CryptoAsset[] = rawAssets ?? [];
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
    addAlert({ cryptoId, symbol: selected.symbol, name: selected.name, targetPrice: price, direction });
    setCryptoId(""); setTargetPrice(""); setShowForm(false);
  };

  const active = alerts.filter((a) => !a.triggered);
  const triggered = alerts.filter((a) => a.triggered);

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            <Bell size={16} style={{ color: "var(--gold)" }} /> Alertes de prix
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
            {active.length} actives · {triggered.length} déclenchées
          </div>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }}>
          {showForm ? <ChevronUp size={13} /> : <Plus size={13} />}
          {showForm ? "Fermer" : "Nouvelle"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "var(--surface-0)", border: "1px solid var(--border-gold)", borderRadius: 14, padding: 18, marginBottom: 20, display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 0 24px rgba(240,180,41,0.06)" }}>
          <div>
            <FormLabel>Crypto</FormLabel>
            <select value={cryptoId} onChange={(e) => setCryptoId(e.target.value)} className="input" style={{ cursor: "pointer" }}>
              <option value="">Sélectionner une crypto…</option>
              {assets.slice(0, 50).map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.symbol.toUpperCase()}) — ${a.current_price.toLocaleString()}</option>
              ))}
            </select>
          </div>
          <div>
            <FormLabel>Condition</FormLabel>
            <div style={{ display: "flex", gap: 8 }}>
              {(["above", "below"] as const).map((d) => (
                <button key={d} onClick={() => setDirection(d)} style={{ flex: 1, padding: "8px", border: `1px solid ${direction === d ? "var(--border-gold)" : "var(--border)"}`, borderRadius: 8, background: direction === d ? "rgba(240,180,41,0.1)" : "var(--surface-1)", color: direction === d ? "var(--gold)" : "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: 11, cursor: "pointer", fontWeight: direction === d ? 600 : 400, transition: "all 0.2s" }}>
                  {d === "above" ? "▲ Au-dessus" : "▼ En-dessous"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <FormLabel>Prix cible (USD)</FormLabel>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: 13, pointerEvents: "none" }}>$</span>
              <input className="input" type="number" placeholder="0.00" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} style={{ paddingLeft: 26 }} />
            </div>
          </div>
          <button className="btn btn-gold" onClick={handleAdd} disabled={!cryptoId || !targetPrice} style={{ width: "100%", marginTop: 4, opacity: !cryptoId || !targetPrice ? 0.4 : 1 }}>
            Créer l'alerte
          </button>
        </div>
      )}

      {active.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{active.map((a) => <AlertRow key={a.id} alert={a} onRemove={() => removeAlert(a.id)} />)}</div>}
      {triggered.length > 0 && (
        <div style={{ marginTop: 16, opacity: 0.5 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Déclenchées</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{triggered.map((a) => <AlertRow key={a.id} alert={a} onRemove={() => removeAlert(a.id)} />)}</div>
        </div>
      )}
      {alerts.length === 0 && !showForm && <div style={{ padding: "28px 0", textAlign: "center", color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>Aucune alerte configurée</div>}
    </div>
  );
}
