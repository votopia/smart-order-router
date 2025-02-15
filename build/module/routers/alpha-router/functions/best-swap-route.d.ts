import { BigNumber } from "@ethersproject/bignumber";
import { TradeType } from "@votopia/sdk-core";
import { CurrencyAmount } from "../../../util/amounts";
import { AlphaRouterConfig } from "../alpha-router";
import { IGasModel } from "../gas-models";
import { RouteWithValidQuote, V3RouteWithValidQuote } from "./../entities/route-with-valid-quote";
export type BestSwapRoute = {
    quote: CurrencyAmount;
    quoteGasAdjusted: CurrencyAmount;
    estimatedGasUsed: BigNumber;
    estimatedGasUsedUSD: CurrencyAmount;
    estimatedGasUsedQuoteToken: CurrencyAmount;
    routes: RouteWithValidQuote[];
};
export declare function getBestSwapRoute(amount: CurrencyAmount, percents: number[], routesWithValidQuotes: RouteWithValidQuote[], routeType: TradeType, routingConfig: AlphaRouterConfig, gasModel?: IGasModel<V3RouteWithValidQuote>): Promise<BestSwapRoute | null>;
export declare function getBestSwapRouteBy(routeType: TradeType, percentToQuotes: {
    [percent: number]: RouteWithValidQuote[];
}, percents: number[], by: (routeQuote: RouteWithValidQuote) => CurrencyAmount, routingConfig: AlphaRouterConfig, gasModel?: IGasModel<V3RouteWithValidQuote>): Promise<BestSwapRoute | undefined>;
