import { BigNumber } from "@ethersproject/bignumber";

import {
  Currency,
  CurrencyAmount,
  Token,
  TradeType,
  FeeAmount,
  Pool,
  Protocol,
  WRAPPED_NATIVE_TOKEN,
} from "@votopia/sdk-core";

import JSBI from "jsbi";
import _ from "lodash";

import { ProviderConfig } from "../providers/provider";
import { OptimismGasData } from "../providers/v3/gas-data-provider";
import { IV3PoolProvider } from "../providers/v3/pool-provider";
import {
  MethodParameters,
  SwapRoute,
  usdGasTokens,
  V3RouteWithValidQuote,
} from "../routers";
import { log } from "../util";

import { buildTrade } from "./methodParameters";

export async function getHighestLiquidityV3NativePool(
  token: Token,
  poolProvider: IV3PoolProvider,
  providerConfig?: ProviderConfig
): Promise<Pool | null> {
  const nativeCurrency = WRAPPED_NATIVE_TOKEN;

  const nativePools = _([
    FeeAmount.HIGH,
    FeeAmount.MEDIUM,
    FeeAmount.LOW,
    FeeAmount.LOWEST,
  ])
    .map<[Token, Token, FeeAmount]>((feeAmount) => {
      return [nativeCurrency, token, feeAmount];
    })
    .value();

  const poolAccessor = await poolProvider.getPools(nativePools, providerConfig);

  const pools = _([
    FeeAmount.HIGH,
    FeeAmount.MEDIUM,
    FeeAmount.LOW,
    FeeAmount.LOWEST,
  ])
    .map((feeAmount) => {
      return poolAccessor.getPool(nativeCurrency, token, feeAmount);
    })
    .compact()
    .value();

  if (pools.length == 0) {
    log.error(
      { pools },
      `Could not find a ${nativeCurrency.symbol} pool with ${token.symbol} for computing gas costs.`
    );

    return null;
  }

  const maxPool = pools.reduce((prev, current) => {
    return JSBI.greaterThan(prev.liquidity, current.liquidity) ? prev : current;
  });

  return maxPool;
}

export async function getHighestLiquidityV3USDPool(
  poolProvider: IV3PoolProvider,
  providerConfig?: ProviderConfig
): Promise<Pool> {
  const usdTokens = usdGasTokens;
  const wrappedCurrency = WRAPPED_NATIVE_TOKEN;

  if (!usdTokens) {
    throw new Error(`Could not find a USD token for computing gas costs`);
  }

  const usdPools = _([
    FeeAmount.HIGH,
    FeeAmount.MEDIUM,
    FeeAmount.LOW,
    FeeAmount.LOWEST,
  ])
    .flatMap((feeAmount) => {
      return _.map<Token, [Token, Token, FeeAmount]>(usdTokens, (usdToken) => [
        wrappedCurrency,
        usdToken,
        feeAmount,
      ]);
    })
    .value();

  const poolAccessor = await poolProvider.getPools(usdPools, providerConfig);

  const pools = _([
    FeeAmount.HIGH,
    FeeAmount.MEDIUM,
    FeeAmount.LOW,
    FeeAmount.LOWEST,
  ])
    .flatMap((feeAmount) => {
      const pools = [];

      for (const usdToken of usdTokens) {
        const pool = poolAccessor.getPool(wrappedCurrency, usdToken, feeAmount);
        if (pool) {
          pools.push(pool);
        }
      }

      return pools;
    })
    .compact()
    .value();

  if (pools.length == 0) {
    const message = `Could not find a USD/${wrappedCurrency.symbol} pool for computing gas costs.`;
    log.error({ pools }, message);
    throw new Error(message);
  }

  const maxPool = pools.reduce((prev, current) => {
    return JSBI.greaterThan(prev.liquidity, current.liquidity) ? prev : current;
  });

  return maxPool;
}

export function getGasCostInUSD(
  usdPool: Pool,
  costNativeCurrency: CurrencyAmount<Token>
) {
  const nativeCurrency = costNativeCurrency.currency;
  // convert fee into usd
  const nativeTokenPrice =
    usdPool.token0.address == nativeCurrency.address
      ? usdPool.token0Price
      : usdPool.token1Price;

  const gasCostUSD = nativeTokenPrice.quote(costNativeCurrency);
  return gasCostUSD;
}

export function getGasCostInNativeCurrency(
  nativeCurrency: Token,
  gasCostInWei: BigNumber
) {
  // wrap fee to native currency
  const costNativeCurrency = CurrencyAmount.fromRawAmount(
    nativeCurrency,
    gasCostInWei.toString()
  );
  return costNativeCurrency;
}

export async function getGasCostInQuoteToken(
  quoteToken: Token,
  nativePool: Pool,
  costNativeCurrency: CurrencyAmount<Token>
) {
  const nativeTokenPrice =
    nativePool.token0.address == quoteToken.address
      ? nativePool.token1Price
      : nativePool.token0Price;
  const gasCostQuoteToken = nativeTokenPrice.quote(costNativeCurrency);
  return gasCostQuoteToken;
}

export function calculateOptimismToL1FeeFromCalldata(
  calldata: string,
  gasData: OptimismGasData
): [BigNumber, BigNumber] {
  const { l1BaseFee, scalar, decimals, overhead } = gasData;

  const l1GasUsed = getL2ToL1GasUsed(calldata, overhead);
  // l1BaseFee is L1 Gas Price on etherscan
  const l1Fee = l1GasUsed.mul(l1BaseFee);
  const unscaled = l1Fee.mul(scalar);
  // scaled = unscaled / (10 ** decimals)
  const scaledConversion = BigNumber.from(10).pow(decimals);
  const scaled = unscaled.div(scaledConversion);
  return [l1GasUsed, scaled];
}

// based on the code from the optimism OVM_GasPriceOracle contract
export function getL2ToL1GasUsed(data: string, overhead: BigNumber): BigNumber {
  // data is hex encoded
  const dataArr: string[] = data.slice(2).match(/.{1,2}/g)!;
  const numBytes = dataArr.length;
  let count = 0;
  for (let i = 0; i < numBytes; i += 1) {
    const byte = parseInt(dataArr[i]!, 16);
    if (byte == 0) {
      count += 4;
    } else {
      count += 16;
    }
  }
  const unsigned = overhead.add(count);
  const signedConversion = 68 * 16;
  return unsigned.add(signedConversion);
}

export async function calculateGasUsed(
  route: SwapRoute,
  simulatedGasUsed: BigNumber,

  v3PoolProvider: IV3PoolProvider,
  l2GasData?: OptimismGasData,
  providerConfig?: ProviderConfig
) {
  const quoteToken = route.quote.currency.wrapped;
  const gasPriceWei = route.gasPriceWei;
  // calculate L2 to L1 security fee if relevant
  let l2toL1FeeInWei = BigNumber.from(0);
  l2toL1FeeInWei = calculateOptimismToL1FeeFromCalldata(
    route.methodParameters!.calldata,
    l2GasData as OptimismGasData
  )[1];

  // add l2 to l1 fee and wrap fee to native currency
  const gasCostInWei = gasPriceWei.mul(simulatedGasUsed).add(l2toL1FeeInWei);
  const nativeCurrency = WRAPPED_NATIVE_TOKEN;
  const costNativeCurrency = getGasCostInNativeCurrency(
    nativeCurrency,
    gasCostInWei
  );

  const usdPool: Pool = await getHighestLiquidityV3USDPool(
    v3PoolProvider,
    providerConfig
  );

  const gasCostUSD = await getGasCostInUSD(usdPool, costNativeCurrency);

  let gasCostQuoteToken = costNativeCurrency;
  // get fee in terms of quote token
  if (!quoteToken.equals(nativeCurrency)) {
    const nativePools = await Promise.all([
      getHighestLiquidityV3NativePool(
        quoteToken,
        v3PoolProvider,
        providerConfig
      ),
    ]);
    const nativePool = nativePools.find((pool) => pool !== null);

    if (!nativePool) {
      log.info(
        "Could not find any V2 or V3 pools to convert the cost into the quote token"
      );
      gasCostQuoteToken = CurrencyAmount.fromRawAmount(quoteToken, 0);
    } else {
      gasCostQuoteToken = await getGasCostInQuoteToken(
        quoteToken,
        nativePool,
        costNativeCurrency
      );
    }
  }

  // Adjust quote for gas fees
  let quoteGasAdjusted;
  if (route.trade.tradeType == TradeType.EXACT_OUTPUT) {
    // Exact output - need more of tokenIn to get the desired amount of tokenOut
    quoteGasAdjusted = route.quote.add(gasCostQuoteToken);
  } else {
    // Exact input - can get less of tokenOut due to fees
    quoteGasAdjusted = route.quote.subtract(gasCostQuoteToken);
  }

  return {
    estimatedGasUsedUSD: gasCostUSD,
    estimatedGasUsedQuoteToken: gasCostQuoteToken,
    quoteGasAdjusted: quoteGasAdjusted,
  };
}

export function initSwapRouteFromExisting(
  swapRoute: SwapRoute,
  v3PoolProvider: IV3PoolProvider,
  quoteGasAdjusted: CurrencyAmount<Currency>,
  estimatedGasUsed: BigNumber,
  estimatedGasUsedQuoteToken: CurrencyAmount<Currency>,
  estimatedGasUsedUSD: CurrencyAmount<Currency>
): SwapRoute {
  const currencyIn = swapRoute.trade.inputAmount.currency;
  const currencyOut = swapRoute.trade.outputAmount.currency;
  const tradeType = swapRoute.trade.tradeType.valueOf()
    ? TradeType.EXACT_OUTPUT
    : TradeType.EXACT_INPUT;
  const routesWithValidQuote = swapRoute.route.map((route) => {
    switch (route.protocol) {
      case Protocol.V3:
        return new V3RouteWithValidQuote({
          amount: CurrencyAmount.fromFractionalAmount(
            route.amount.currency,
            route.amount.numerator,
            route.amount.denominator
          ),
          rawQuote: BigNumber.from(route.rawQuote),
          sqrtPriceX96AfterList: route.sqrtPriceX96AfterList.map((num) =>
            BigNumber.from(num)
          ),
          initializedTicksCrossedList: [...route.initializedTicksCrossedList],
          quoterGasEstimate: BigNumber.from(route.gasEstimate),
          percent: route.percent,
          route: route.route,
          gasModel: route.gasModel,
          quoteToken: new Token(
            route.quoteToken.address,
            route.quoteToken.decimals,
            route.quoteToken.symbol,
            route.quoteToken.name || "",
            `https://assets.smold.app/api/token/8453/${route.quoteToken.address}`
          ),
          tradeType: tradeType,
          v3PoolProvider: v3PoolProvider,
        });
    }
  });
  const trade = buildTrade<typeof tradeType>(
    currencyIn,
    currencyOut,
    tradeType,
    routesWithValidQuote
  );

  const routesWithValidQuotePortionAdjusted = routesWithValidQuote;

  return {
    quote: swapRoute.quote,
    quoteGasAdjusted,
    estimatedGasUsed,
    estimatedGasUsedQuoteToken,
    estimatedGasUsedUSD,
    gasPriceWei: BigNumber.from(swapRoute.gasPriceWei),
    trade,
    route: routesWithValidQuotePortionAdjusted,
    blockNumber: BigNumber.from(swapRoute.blockNumber),
    methodParameters: swapRoute.methodParameters
      ? ({
          calldata: swapRoute.methodParameters.calldata,
          value: swapRoute.methodParameters.value,
          to: swapRoute.methodParameters.to,
        } as MethodParameters)
      : undefined,
    simulationStatus: swapRoute.simulationStatus,
    portionAmount: swapRoute.portionAmount,
  };
}
