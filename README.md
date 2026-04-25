# CryptoLens

Tableau de bord pédagogique pour suivre un portefeuille crypto simulé (paper trading).

## Stack

| Outil | Version | Rôle |
|-------|---------|------|
| React | 19 | UI |
| TypeScript | 5.4 | Typage strict |
| Vite | 6 | Bundler / Dev server |
| TanStack Query v5 | 5.x | Fetching, cache, polling |
| Zustand | 4.x | État portefeuille (localStorage) |
| Recharts | 2.x | Graphiques |
| Tailwind CSS | 4 | Styles |
| Zod | 3.x | Validation réponses API |
| Vitest | 2.x | Tests unitaires P&L |

## Fonctionnalités

- **Marché** — Top 50 cryptos (CoinGecko), tri, recherche, variations 24h colorées
- **Portefeuille** — Positions simulées, P&L absolu & %, camembert de répartition
- **Courbe historique** — Valeur du portefeuille sur 7 / 30 jours (prix CoinGecko × quantités)
- **Alertes prix** — Seuil haut/bas par crypto, notification browser native
- **Mode simulation** — Reset du portefeuille avec capital configurable

## Installation

```bash
npm install
npm run dev
```

## Tests

```bash
npm run test          # une passe
npm run test:watch    # mode watch
npm run test:coverage # avec couverture
```

## Architecture fichiers

```
src/
├── types/index.ts          # CryptoAsset, Position, Portfolio, PriceAlert, PnLResult
├── lib/
│   ├── api.ts              # CoinGecko API + rate-limit + timeout
│   └── schemas.ts          # Zod schemas
├── store/
│   └── portfolioStore.ts   # Zustand (positions, alertes, localStorage)
├── hooks/
│   ├── useCryptoPrices.ts  # TanStack Query + polling 60s + pause inactivité
│   ├── usePnlCalculator.ts # P&L en temps réel
│   ├── usePortfolioHistory.ts # Courbe historique (fan-out queries)
│   └── usePriceAlerts.ts   # Notification browser
├── utils/
│   └── pnl.ts              # Calculs P&L purs (testés par Vitest)
├── components/
│   ├── MarketTable.tsx
│   ├── PortfolioSummary.tsx
│   ├── PositionCard.tsx
│   ├── AddPositionModal.tsx
│   ├── PriceAlertManager.tsx
│   ├── PortfolioHistoryChart.tsx
│   └── SimulationControls.tsx
├── tests/
│   └── pnl.test.ts         # Tests Vitest pour calculs P&L
├── App.tsx
├── main.tsx
└── index.css
```

## Notes API

- CoinGecko gratuit : ~50 req/min, pas de clé requise
- Rate limiting géré : pause automatique + message d'erreur si HTTP 429
- Polling suspendu si l'onglet est en arrière-plan (Page Visibility API)
- Cache TanStack Query : 60s pour les prix, 5min pour l'historique

## Pr. Ilhame Ait Lbachir — ENSA Berrechid 2025-2026