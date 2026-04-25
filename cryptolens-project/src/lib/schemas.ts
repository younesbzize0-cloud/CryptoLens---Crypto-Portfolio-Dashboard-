import { z } from "zod";

export const CryptoAssetSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string().url(),
  current_price: z.number(),
  market_cap: z.number(),
  market_cap_rank: z.number().nullable(),
  price_change_percentage_24h: z.number().nullable(),
  price_change_percentage_7d_in_currency: z.number().nullable().optional(),
  total_volume: z.number(),
  high_24h: z.number().nullable(),
  low_24h: z.number().nullable(),
  circulating_supply: z.number().nullable(),
  ath: z.number(),
  ath_change_percentage: z.number().nullable(),
  last_updated: z.string(),
});

export const MarketResponseSchema = z.array(CryptoAssetSchema);

export const MarketChartSchema = z.object({
  prices: z.array(z.tuple([z.number(), z.number()])),
});

export type ValidatedCryptoAsset = z.infer<typeof CryptoAssetSchema>;