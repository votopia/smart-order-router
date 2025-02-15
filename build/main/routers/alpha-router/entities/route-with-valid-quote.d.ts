import { BigNumber } from "@ethersproject/bignumber";
import { Token, TradeType, Protocol } from "@votopia/sdk-core";
import { IV3PoolProvider } from "../../../providers/v3/pool-provider";
import { CurrencyAmount } from "../../../util/amounts";
import { V3Route } from "../../router";
import { IGasModel } from "../gas-models/gas-model";
/**
 * Represents a route, a quote for swapping some amount on it, and other
 * metadata used by the routing algorithm.
 *
 * @export
 * @interface IRouteWithValidQuote
 * @template Route
 */
export interface IRouteWithValidQuote<Route extends V3Route> {
    amount: CurrencyAmount;
    percent: number;
    quoteAdjustedForGas: CurrencyAmount;
    quote: CurrencyAmount;
    route: Route;
    gasEstimate: BigNumber;
    gasCostInToken: CurrencyAmount;
    gasCostInUSD: CurrencyAmount;
    tradeType: TradeType;
    poolAddresses: string[];
    tokenPath: Token[];
}
export type IV3RouteWithValidQuote = {
    protocol: Protocol.V3;
} & IRouteWithValidQuote<V3Route>;
export type RouteWithValidQuote = V3RouteWithValidQuote;
export type V3RouteWithValidQuoteParams = {
    amount: CurrencyAmount;
    rawQuote: BigNumber;
    sqrtPriceX96AfterList: BigNumber[];
    initializedTicksCrossedList: number[];
    quoterGasEstimate: BigNumber;
    percent: number;
    route: V3Route;
    gasModel: IGasModel<V3RouteWithValidQuote>;
    quoteToken: Token;
    tradeType: TradeType;
    v3PoolProvider: IV3PoolProvider;
};
/**
 * Represents a quote for swapping on a V3 only route. Contains all information
 * such as the route used, the amount specified by the user, the type of quote
 * (exact in or exact out), the quote itself, and gas estimates.
 *
 * @export
 * @class V3RouteWithValidQuote
 */
export declare class V3RouteWithValidQuote implements IV3RouteWithValidQuote {
    readonly protocol = Protocol.V3;
    amount: CurrencyAmount;
    rawQuote: BigNumber;
    quote: CurrencyAmount;
    quoteAdjustedForGas: CurrencyAmount;
    sqrtPriceX96AfterList: BigNumber[];
    initializedTicksCrossedList: number[];
    quoterGasEstimate: BigNumber;
    percent: number;
    route: V3Route;
    quoteToken: Token;
    gasModel: IGasModel<V3RouteWithValidQuote>;
    gasEstimate: BigNumber;
    gasCostInToken: CurrencyAmount;
    gasCostInUSD: CurrencyAmount;
    tradeType: TradeType;
    poolAddresses: string[];
    tokenPath: Token[];
    toString(): string;
    constructor({ amount, rawQuote, sqrtPriceX96AfterList, initializedTicksCrossedList, quoterGasEstimate, percent, route, gasModel, quoteToken, tradeType, v3PoolProvider, }: V3RouteWithValidQuoteParams);
}
