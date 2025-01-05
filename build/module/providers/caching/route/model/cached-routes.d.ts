import { Token, TradeType, Protocol } from "@votopia/sdk-core";
import { RouteWithValidQuote, V3Route } from "../../../../routers";
import { CachedRoute } from "./cached-route";
interface CachedRoutesParams {
    routes: CachedRoute<V3Route>[];
    tokenIn: Token;
    tokenOut: Token;
    protocolsCovered: Protocol[];
    blockNumber: number;
    tradeType: TradeType;
    originalAmount: string;
    blocksToLive?: number;
}
/**
 * Class defining the route to cache
 *
 * @export
 * @class CachedRoute
 */
export declare class CachedRoutes {
    readonly routes: CachedRoute<V3Route>[];
    readonly tokenIn: Token;
    readonly tokenOut: Token;
    readonly protocolsCovered: Protocol[];
    readonly blockNumber: number;
    readonly tradeType: TradeType;
    readonly originalAmount: string;
    blocksToLive: number;
    /**
     * @param routes
     * @param tokenIn
     * @param tokenOut
     * @param protocolsCovered
     * @param blockNumber
     * @param tradeType
     * @param originalAmount
     * @param blocksToLive
     */
    constructor({ routes, tokenIn, tokenOut, protocolsCovered, blockNumber, tradeType, originalAmount, blocksToLive, }: CachedRoutesParams);
    /**
     * Factory method that creates a `CachedRoutes` object from an array of RouteWithValidQuote.
     *
     * @public
     * @static
     * @param routes
     * @param tokenIn
     * @param tokenOut
     * @param protocolsCovered
     * @param blockNumber
     * @param tradeType
     * @param originalAmount
     */
    static fromRoutesWithValidQuotes(routes: RouteWithValidQuote[], tokenIn: Token, tokenOut: Token, protocolsCovered: Protocol[], blockNumber: number, tradeType: TradeType, originalAmount: string): CachedRoutes | undefined;
    /**
     * Function to determine if, given a block number, the CachedRoute is expired or not.
     *
     * @param currentBlockNumber
     * @param optimistic
     */
    notExpired(currentBlockNumber: number, optimistic?: boolean): boolean;
}
export {};
