import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Portfolio, Position, PriceAlert } from "../types";
import { nanoid } from "nanoid";

// ─── Portfolio Store ───────────────────────────────────────────────────────────

interface PortfolioStore {
  portfolio: Portfolio;
  alerts: PriceAlert[];

  // Portfolio actions
  addPosition: (
    data: Omit<Position, "id" | "createdAt" | "updatedAt">
  ) => void;
  removePosition: (positionId: string) => void;
  updatePosition: (
    positionId: string,
    data: Partial<Pick<Position, "quantity" | "avgBuyPrice">>
  ) => void;
  resetPortfolio: (initialCapital: number) => void;

  // Alert actions
  addAlert: (data: Omit<PriceAlert, "id" | "triggered" | "createdAt">) => void;
  removeAlert: (alertId: string) => void;
  markAlertTriggered: (alertId: string) => void;
}

function createDefaultPortfolio(capital = 10_000): Portfolio {
  return {
    id: nanoid(),
    name: "Mon Portefeuille",
    initialCapital: capital,
    remainingCash: capital,
    positions: [],
    createdAt: new Date().toISOString(),
  };
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set) => ({
      portfolio: createDefaultPortfolio(),
      alerts: [],

      addPosition: (data) => {
        const position: Position = {
          ...data,
          id: nanoid(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          portfolio: {
            ...state.portfolio,
            positions: [...state.portfolio.positions, position],
            remainingCash:
              state.portfolio.remainingCash -
              data.quantity * data.avgBuyPrice,
          },
        }));
      },

      removePosition: (positionId) =>
        set((state) => {
          const pos = state.portfolio.positions.find(
            (p) => p.id === positionId
          );
          const refund = pos ? pos.quantity * pos.avgBuyPrice : 0;
          return {
            portfolio: {
              ...state.portfolio,
              positions: state.portfolio.positions.filter(
                (p) => p.id !== positionId
              ),
              remainingCash: state.portfolio.remainingCash + refund,
            },
          };
        }),

      updatePosition: (positionId, data) =>
        set((state) => ({
          portfolio: {
            ...state.portfolio,
            positions: state.portfolio.positions.map((p) =>
              p.id === positionId
                ? { ...p, ...data, updatedAt: new Date().toISOString() }
                : p
            ),
          },
        })),

      resetPortfolio: (initialCapital) =>
        set({ portfolio: createDefaultPortfolio(initialCapital) }),

      addAlert: (data) =>
        set((state) => ({
          alerts: [
            ...state.alerts,
            {
              ...data,
              id: nanoid(),
              triggered: false,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removeAlert: (alertId) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== alertId),
        })),

      markAlertTriggered: (alertId) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === alertId ? { ...a, triggered: true } : a
          ),
        })),
    }),
    {
      name: "cryptolens-portfolio",
      version: 1,
    }
  )
);