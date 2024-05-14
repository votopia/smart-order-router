import { Logger } from "@ethersproject/logger";
import { flags } from "@oclif/command";

import {
  Currency,
  Percent,
  TradeType,
  NATIVE_CURRENCY,
  Protocol,
} from "@votopia/sdk-core";
import dotenv from "dotenv";
import _ from "lodash";

import {
  MapWithLowerCaseKey,
  parseAmount,
  SwapRoute,
  SwapType,
} from "../../src";
import { TO_PROTOCOL } from "../../src/util";
import { BaseCommand } from "../base-command";

dotenv.config();

Logger.globalLogger();
Logger.setLogLevel(Logger.levels.DEBUG);

export class Quote extends BaseCommand {
  static description = "Uniswap Smart Order Router CLI";

  static flags = {
    ...BaseCommand.flags,
    version: flags.version({ char: "v" }),
    help: flags.help({ char: "h" }),
    tokenIn: flags.string({ char: "i", required: true }),
    tokenOut: flags.string({ char: "o", required: true }),
    recipient: flags.string({ required: false }),
    amount: flags.string({ char: "a", required: true }),
    exactIn: flags.boolean({ required: false }),
    exactOut: flags.boolean({ required: false }),
    protocols: flags.string({ required: false }),
    forceCrossProtocol: flags.boolean({ required: false, default: false }),
    forceMixedRoutes: flags.boolean({
      required: false,
      default: false,
    }),
    simulate: flags.boolean({ required: false, default: false }),
    debugRouting: flags.boolean({ required: false, default: true }),
    enableFeeOnTransferFeeFetching: flags.boolean({
      required: false,
      default: false,
    }),
  };

  async run() {
    const { flags } = this.parse(Quote);
    const {
      tokenIn: tokenInStr,
      tokenOut: tokenOutStr,
      amount: amountStr,
      exactIn,
      exactOut,
      recipient,
      debug,
      topN,
      topNTokenInOut,
      topNSecondHop,
      topNSecondHopForTokenAddressRaw,
      topNWithEachBaseToken,
      topNWithBaseToken,
      topNWithBaseTokenInSet,
      topNDirectSwaps,
      maxSwapsPerPath,
      minSplits,
      maxSplits,
      distributionPercent,
      protocols: protocolsStr,
      forceCrossProtocol,
      forceMixedRoutes,
      debugRouting,
      enableFeeOnTransferFeeFetching,
    } = flags;

    const topNSecondHopForTokenAddress = new MapWithLowerCaseKey();
    topNSecondHopForTokenAddressRaw.split(",").forEach((entry) => {
      if (entry != "") {
        const entryParts = entry.split("|");
        if (entryParts.length != 2) {
          throw new Error(
            "flag --topNSecondHopForTokenAddressRaw must be in format tokenAddress|topN,..."
          );
        }
        const topNForTokenAddress: number = Number(entryParts[1]!);
        topNSecondHopForTokenAddress.set(entryParts[0]!, topNForTokenAddress);
      }
    });

    if ((exactIn && exactOut) || (!exactIn && !exactOut)) {
      throw new Error("Must set either --exactIn or --exactOut.");
    }

    let protocols: Protocol[] = [];
    if (protocolsStr) {
      try {
        protocols = _.map(protocolsStr.split(","), (protocolStr) =>
          TO_PROTOCOL(protocolStr)
        );
      } catch (err) {
        throw new Error(
          `Protocols invalid. Valid options: ${Object.values(Protocol)}`
        );
      }
    }

    const log = this.logger;
    const tokenProvider = this.tokenProvider;
    const router = this.router;

    // if the tokenIn str is 'ETH' or 'MATIC' or in NATIVE_NAMES_BY_ID
    const tokenIn: Currency =
      NATIVE_CURRENCY.symbol === tokenInStr
        ? NATIVE_CURRENCY
        : (await tokenProvider.getTokens([tokenInStr])).getTokenByAddress(
            tokenInStr
          )!;

    const tokenOut: Currency =
      NATIVE_CURRENCY.symbol === tokenInStr
        ? NATIVE_CURRENCY
        : (await tokenProvider.getTokens([tokenOutStr])).getTokenByAddress(
            tokenOutStr
          )!;

    let swapRoutes: SwapRoute | null;
    if (exactIn) {
      const amountIn = parseAmount(amountStr, tokenIn);

      swapRoutes = await router.route(
        amountIn,
        tokenOut,
        TradeType.EXACT_INPUT,
        undefined,
        {
          blockNumber: this.blockNumber,
          v3PoolSelection: {
            topN,
            topNTokenInOut,
            topNSecondHop,
            topNSecondHopForTokenAddress,
            topNWithEachBaseToken,
            topNWithBaseToken,
            topNWithBaseTokenInSet,
            topNDirectSwaps,
          },
          maxSwapsPerPath,
          minSplits,
          maxSplits,
          distributionPercent,
          protocols,
          forceCrossProtocol,
          forceMixedRoutes,
          debugRouting,
          enableFeeOnTransferFeeFetching,
        }
      );
    } else {
      const amountOut = parseAmount(amountStr, tokenOut);
      swapRoutes = await router.route(
        amountOut,
        tokenIn,
        TradeType.EXACT_OUTPUT,
        recipient
          ? {
              type: SwapType.SWAP_ROUTER_02,
              deadline: 100,
              recipient,
              slippageTolerance: new Percent(5, 10_000),
            }
          : undefined,
        {
          blockNumber: this.blockNumber - 10,
          v3PoolSelection: {
            topN,
            topNTokenInOut,
            topNSecondHop,
            topNSecondHopForTokenAddress,
            topNWithEachBaseToken,
            topNWithBaseToken,
            topNWithBaseTokenInSet,
            topNDirectSwaps,
          },
          maxSwapsPerPath,
          minSplits,
          maxSplits,
          distributionPercent,
          protocols,
          forceCrossProtocol,
          forceMixedRoutes,
          debugRouting,
          enableFeeOnTransferFeeFetching,
        }
      );
    }

    if (!swapRoutes) {
      log.error(
        `Could not find route. ${
          debug ? "" : "Run in debug mode for more info"
        }.`
      );
      return;
    }

    const {
      blockNumber,
      estimatedGasUsed,
      estimatedGasUsedQuoteToken,
      estimatedGasUsedUSD,
      gasPriceWei,
      methodParameters,
      quote,
      quoteGasAdjusted,
      route: routeAmounts,
      simulationStatus,
    } = swapRoutes;

    this.logSwapResults(
      routeAmounts,
      quote,
      quoteGasAdjusted,
      estimatedGasUsedQuoteToken,
      estimatedGasUsedUSD,
      methodParameters,
      blockNumber,
      estimatedGasUsed,
      gasPriceWei,
      simulationStatus
    );
  }
}
