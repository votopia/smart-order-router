/// <reference types="./types/bunyan-debug-stream" />
import { BigNumber } from "@ethersproject/bignumber";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Command, flags } from "@oclif/command";
import { ParserOutput } from "@oclif/parser/lib/parse";

import {
  Currency,
  CurrencyAmount,
  Token,
  MethodParameters,
  DEFAULT_TOKEN_LIST,
  NETWORK_NAME,
  JSON_RPC_PROVIER,
} from "@votopia/sdk-core";

import bunyan, { default as Logger } from "bunyan";
import bunyanDebugStream from "bunyan-debug-stream";
import _ from "lodash";
import NodeCache from "node-cache";

import {
  AlphaRouter,
  CachingGasStationProvider,
  CachingTokenListProvider,
  CachingTokenProviderWithFallback,
  CachingV3PoolProvider,
  EIP1559GasPriceProvider,
  EthEstimateGasSimulator,
  FallbackTenderlySimulator,
  GasPrice,
  IRouter,
  ISwapToRatio,
  ITokenProvider,
  IV3PoolProvider,
  MetricLogger,
  NodeJSCache,
  routeAmountsToString,
  RouteWithValidQuote,
  setGlobalLogger,
  setGlobalMetric,
  SimulationStatus,
  TenderlySimulator,
  TokenProvider,
  UniswapMulticallProvider,
  V3PoolProvider,
  V3RouteWithValidQuote,
  V3SubgraphProvider,
} from "../src";
import { LegacyGasPriceProvider } from "../src/providers/legacy-gas-price-provider";
import { OnChainGasPriceProvider } from "../src/providers/on-chain-gas-price-provider";

export abstract class BaseCommand extends Command {
  static flags = {
    topN: flags.integer({
      required: false,
      default: 3,
    }),
    topNTokenInOut: flags.integer({
      required: false,
      default: 2,
    }),
    topNSecondHop: flags.integer({
      required: false,
      default: 2,
    }),
    topNSecondHopForTokenAddressRaw: flags.string({
      required: false,
      default: "",
    }),
    topNWithEachBaseToken: flags.integer({
      required: false,
      default: 2,
    }),
    topNWithBaseToken: flags.integer({
      required: false,
      default: 6,
    }),
    topNWithBaseTokenInSet: flags.boolean({
      required: false,
      default: false,
    }),
    topNDirectSwaps: flags.integer({
      required: false,
      default: 2,
    }),
    maxSwapsPerPath: flags.integer({
      required: false,
      default: 3,
    }),
    minSplits: flags.integer({
      required: false,
      default: 1,
    }),
    maxSplits: flags.integer({
      required: false,
      default: 3,
    }),
    distributionPercent: flags.integer({
      required: false,
      default: 5,
    }),
    tokenListURI: flags.string({
      required: false,
    }),
    router: flags.string({
      char: "s",
      required: false,
      default: "alpha",
    }),
    debug: flags.boolean(),
    debugJSON: flags.boolean(),
  };

  private _log: Logger | null = null;
  private _router: IRouter<any> | null = null;
  private _swapToRatioRouter: ISwapToRatio<any, any> | null = null;
  private _tokenProvider: ITokenProvider | null = null;
  private _poolProvider: IV3PoolProvider | null = null;
  private _blockNumber: number | null = null;
  private _multicall2Provider: UniswapMulticallProvider | null = null;

  get logger() {
    return this._log
      ? this._log
      : bunyan.createLogger({
          name: "Default Logger",
        });
  }

  get router() {
    if (this._router) {
      return this._router;
    } else {
      throw "router not initialized";
    }
  }

  get swapToRatioRouter() {
    if (this._swapToRatioRouter) {
      return this._swapToRatioRouter;
    } else {
      throw "swapToRatioRouter not initialized";
    }
  }

  get tokenProvider() {
    if (this._tokenProvider) {
      return this._tokenProvider;
    } else {
      throw "tokenProvider not initialized";
    }
  }

  get poolProvider() {
    if (this._poolProvider) {
      return this._poolProvider;
    } else {
      throw "poolProvider not initialized";
    }
  }

  get blockNumber() {
    if (this._blockNumber) {
      return this._blockNumber;
    } else {
      throw "blockNumber not initialized";
    }
  }

  get multicall2Provider() {
    if (this._multicall2Provider) {
      return this._multicall2Provider;
    } else {
      throw "multicall2 not initialized";
    }
  }

  async init() {
    const query: ParserOutput<any, any> = this.parse();
    const { debug, debugJSON, tokenListURI } = query.flags;

    // initialize logger
    const logLevel = debug || debugJSON ? bunyan.DEBUG : bunyan.INFO;
    this._log = bunyan.createLogger({
      name: "Uniswap Smart Order Router",
      serializers: bunyan.stdSerializers,
      level: logLevel,
      streams: debugJSON
        ? undefined
        : [
            {
              level: logLevel,
              type: "stream",
              stream: bunyanDebugStream({
                basepath: __dirname,
                forceColor: false,
                showDate: false,
                showPid: false,
                showLoggerName: false,
                showLevel: !!debug,
              }),
            },
          ],
    });

    if (debug || debugJSON) {
      setGlobalLogger(this.logger);
    }

    const chainProvider = JSON_RPC_PROVIER;

    const metricLogger: MetricLogger = new MetricLogger({
      networkName: NETWORK_NAME,
    });
    setGlobalMetric(metricLogger);

    const provider = new JsonRpcProvider(chainProvider);
    this._blockNumber = await provider.getBlockNumber();

    const tokenCache = new NodeJSCache<Token>(
      new NodeCache({ stdTTL: 3600, useClones: false })
    );

    let tokenListProvider: CachingTokenListProvider;
    if (tokenListURI) {
      tokenListProvider = await CachingTokenListProvider.fromTokenListURI(
        tokenListURI,
        tokenCache
      );
    } else {
      tokenListProvider = await CachingTokenListProvider.fromTokenList(
        DEFAULT_TOKEN_LIST,
        tokenCache
      );
    }

    const multicall2Provider = new UniswapMulticallProvider(
      provider,
      undefined
    );
    this._multicall2Provider = multicall2Provider;
    this._poolProvider = new V3PoolProvider(multicall2Provider);

    // initialize tokenProvider
    const tokenProviderOnChain = new TokenProvider(multicall2Provider);
    this._tokenProvider = new CachingTokenProviderWithFallback(
      tokenCache,
      tokenListProvider,
      tokenProviderOnChain
    );

    const gasPriceCache = new NodeJSCache<GasPrice>(
      new NodeCache({ stdTTL: 15, useClones: true })
    );

    const v3PoolProvider = new CachingV3PoolProvider(
      new V3PoolProvider(multicall2Provider),
      new NodeJSCache(new NodeCache({ stdTTL: 360, useClones: false }))
    );

    const tenderlySimulator = new TenderlySimulator(
      "http://api.tenderly.co",
      process.env.TENDERLY_USER!,
      process.env.TENDERLY_PROJECT!,
      process.env.TENDERLY_ACCESS_KEY!,

      v3PoolProvider,
      provider
    );

    const ethEstimateGasSimulator = new EthEstimateGasSimulator(
      provider,
      v3PoolProvider
    );

    const simulator = new FallbackTenderlySimulator(
      provider,
      tenderlySimulator,
      ethEstimateGasSimulator
    );

    const router = new AlphaRouter({
      provider,
      multicall2Provider: multicall2Provider,
      gasPriceProvider: new CachingGasStationProvider(
        new OnChainGasPriceProvider(
          new EIP1559GasPriceProvider(provider),
          new LegacyGasPriceProvider(provider)
        ),
        gasPriceCache
      ),
      v3SubgraphProvider: new V3SubgraphProvider(
        undefined,
        undefined,
        undefined
      ),
      simulator,
    });

    this._swapToRatioRouter = router;
    this._router = router;
  }

  logSwapResults(
    routeAmounts: RouteWithValidQuote[],
    quote: CurrencyAmount<Currency>,
    quoteGasAdjusted: CurrencyAmount<Currency>,
    estimatedGasUsedQuoteToken: CurrencyAmount<Currency>,
    estimatedGasUsedUSD: CurrencyAmount<Currency>,
    methodParameters: MethodParameters | undefined,
    blockNumber: BigNumber,
    estimatedGasUsed: BigNumber,
    gasPriceWei: BigNumber,
    simulationStatus?: SimulationStatus
  ) {
    this.logger.info(`Best Route:`);
    this.logger.info(`${routeAmountsToString(routeAmounts)}`);

    this.logger.info(`\tRaw Quote Exact In:`);
    this.logger.info(
      `\t\t${quote.toFixed(Math.min(quote.currency.decimals, 2))}`
    );
    this.logger.info(`\tGas Adjusted Quote In:`);
    this.logger.info(
      `\t\t${quoteGasAdjusted.toFixed(
        Math.min(quoteGasAdjusted.currency.decimals, 2)
      )}`
    );
    this.logger.info(``);
    this.logger.info(
      `Gas Used Quote Token: ${estimatedGasUsedQuoteToken.toFixed(
        Math.min(estimatedGasUsedQuoteToken.currency.decimals, 6)
      )}`
    );
    this.logger.info(
      `Gas Used USD: ${estimatedGasUsedUSD.toFixed(
        Math.min(estimatedGasUsedUSD.currency.decimals, 6)
      )}`
    );
    this.logger.info(`Calldata: ${methodParameters?.calldata}`);
    this.logger.info(`Value: ${methodParameters?.value}`);
    this.logger.info({
      blockNumber: blockNumber.toString(),
      estimatedGasUsed: estimatedGasUsed.toString(),
      gasPriceWei: gasPriceWei.toString(),
      simulationStatus: simulationStatus,
    });

    const v3Routes: V3RouteWithValidQuote[] =
      routeAmounts as V3RouteWithValidQuote[];
    let total = BigNumber.from(0);
    for (let i = 0; i < v3Routes.length; i++) {
      const route = v3Routes[i]!;
      const tick = BigNumber.from(
        Math.max(1, _.sum(route.initializedTicksCrossedList))
      );
      total = total.add(tick);
    }
    this.logger.info(`Total ticks crossed: ${total}`);
  }
}
