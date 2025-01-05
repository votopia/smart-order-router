import { BigNumber } from "@ethersproject/bignumber";
import { Currency, CurrencyAmount, Token, Pool } from "@votopia/sdk-core";
import { ProviderConfig } from "../providers/provider";
import { OptimismGasData } from "../providers/v3/gas-data-provider";
import { IV3PoolProvider } from "../providers/v3/pool-provider";
import { SwapRoute } from "../routers";
export declare function getHighestLiquidityV3NativePool(token: Token, poolProvider: IV3PoolProvider, providerConfig?: ProviderConfig): Promise<Pool | null>;
export declare function getHighestLiquidityV3USDPool(poolProvider: IV3PoolProvider, providerConfig?: ProviderConfig): Promise<Pool>;
export declare function getGasCostInUSD(usdPool: Pool, costNativeCurrency: CurrencyAmount<Token>): CurrencyAmount<Token>;
export declare function getGasCostInNativeCurrency(nativeCurrency: Token, gasCostInWei: BigNumber): CurrencyAmount<Token>;
export declare function getGasCostInQuoteToken(quoteToken: Token, nativePool: Pool, costNativeCurrency: CurrencyAmount<Token>): Promise<CurrencyAmount<Token>>;
export declare function calculateOptimismToL1FeeFromCalldata(calldata: string, gasData: OptimismGasData): [BigNumber, BigNumber];
export declare function getL2ToL1GasUsed(data: string, overhead: BigNumber): BigNumber;
export declare function calculateGasUsed(route: SwapRoute, simulatedGasUsed: BigNumber, v3PoolProvider: IV3PoolProvider, l2GasData?: OptimismGasData, providerConfig?: ProviderConfig): Promise<{
    estimatedGasUsedUSD: CurrencyAmount<Token>;
    estimatedGasUsedQuoteToken: CurrencyAmount<Token>;
    quoteGasAdjusted: CurrencyAmount<Currency>;
}>;
export declare function initSwapRouteFromExisting(swapRoute: SwapRoute, v3PoolProvider: IV3PoolProvider, quoteGasAdjusted: CurrencyAmount<Currency>, estimatedGasUsed: BigNumber, estimatedGasUsedQuoteToken: CurrencyAmount<Currency>, estimatedGasUsedUSD: CurrencyAmount<Currency>): SwapRoute;
