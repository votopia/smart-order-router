import { AlphaRouterConfig } from "./alpha-router";

export const DEFAULT_ROUTING_CONFIG: AlphaRouterConfig = {
  v3PoolSelection: {
    topN: 2,
    topNDirectSwaps: 2,
    topNTokenInOut: 2,
    topNSecondHop: 1,
    topNWithEachBaseToken: 3,
    topNWithBaseToken: 3,
  },
  maxSwapsPerPath: 3,
  minSplits: 1,
  maxSplits: 7,
  distributionPercent: 10,
  forceCrossProtocol: false,
};
export const ETH_GAS_STATION_API_URL =
  "https://ethgasstation.info/api/ethgasAPI.json";
