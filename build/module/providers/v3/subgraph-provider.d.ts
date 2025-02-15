import { Token } from "@votopia/sdk-core";
import { ProviderConfig } from "../provider";
export interface V3SubgraphPool {
    id: string;
    feeTier: string;
    liquidity: string;
    token0: {
        id: string;
    };
    token1: {
        id: string;
    };
    tvlETH: number;
    tvlUSD: number;
}
export declare const printV3SubgraphPool: (s: V3SubgraphPool) => string;
/**
 * Provider for getting V3 pools from the Subgraph
 *
 * @export
 * @interface IV3SubgraphProvider
 */
export interface IV3SubgraphProvider {
    getPools(tokenIn?: Token, tokenOut?: Token, providerConfig?: ProviderConfig): Promise<V3SubgraphPool[]>;
}
export declare class V3SubgraphProvider implements IV3SubgraphProvider {
    private retries;
    private timeout;
    private rollback;
    private client;
    constructor(retries?: number, timeout?: number, rollback?: boolean);
    getPools(_tokenIn?: Token, _tokenOut?: Token, providerConfig?: ProviderConfig): Promise<V3SubgraphPool[]>;
}
