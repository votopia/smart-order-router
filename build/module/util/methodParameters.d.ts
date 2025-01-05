import { Currency, TradeType, Trade } from "@votopia/sdk-core";
import { MethodParameters, RouteWithValidQuote, SwapOptions } from "..";
export declare function buildTrade<TTradeType extends TradeType>(tokenInCurrency: Currency, tokenOutCurrency: Currency, tradeType: TTradeType, routeAmounts: RouteWithValidQuote[]): Trade<Currency, Currency, TTradeType>;
export declare function buildSwapMethodParameters(trade: Trade<Currency, Currency, TradeType>, swapConfig: SwapOptions): MethodParameters;
