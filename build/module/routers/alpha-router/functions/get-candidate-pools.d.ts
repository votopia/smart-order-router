import { Token, TradeType, Protocol } from "@votopia/sdk-core";
import { ITokenListProvider } from "../../../providers";
import { ITokenProvider } from "../../../providers/token-provider";
import { IV3PoolProvider, V3PoolAccessor } from "../../../providers/v3/pool-provider";
import { IV3SubgraphProvider, V3SubgraphPool } from "../../../providers/v3/subgraph-provider";
import { AlphaRouterConfig } from "../alpha-router";
export type PoolId = {
    id: string;
};
export type CandidatePoolsBySelectionCriteria = {
    protocol: Protocol;
    selections: CandidatePoolsSelections;
};
export type CandidatePoolsSelections = {
    topByBaseWithTokenIn: PoolId[];
    topByBaseWithTokenOut: PoolId[];
    topByDirectSwapPool: PoolId[];
    topByEthQuoteTokenPool: PoolId[];
    topByTVL: PoolId[];
    topByTVLUsingTokenIn: PoolId[];
    topByTVLUsingTokenOut: PoolId[];
    topByTVLUsingTokenInSecondHops: PoolId[];
    topByTVLUsingTokenOutSecondHops: PoolId[];
};
export type V3GetCandidatePoolsParams = {
    tokenIn: Token;
    tokenOut: Token;
    routeType: TradeType;
    routingConfig: AlphaRouterConfig;
    subgraphProvider: IV3SubgraphProvider;
    tokenProvider: ITokenProvider;
    poolProvider: IV3PoolProvider;
    blockedTokenListProvider?: ITokenListProvider;
};
export type V3CandidatePools = {
    poolAccessor: V3PoolAccessor;
    candidatePools: CandidatePoolsBySelectionCriteria;
    subgraphPools: V3SubgraphPool[];
};
export declare function getV3CandidatePools({ tokenIn, tokenOut, routeType, routingConfig, subgraphProvider, tokenProvider, poolProvider, blockedTokenListProvider, }: V3GetCandidatePoolsParams): Promise<V3CandidatePools>;
