import { JsonRpcProvider } from "@ethersproject/providers";
import { TradeType, SWAP_ROUTER_02_ADDRESS } from "@votopia/sdk-core";

import { BigNumber } from "ethers/lib/ethers";

import { SwapOptions, SwapRoute, SwapType } from "../routers";
import { Erc20__factory } from "../types/other/factories/Erc20__factory";

import { CurrencyAmount, log } from "../util";

import { ProviderConfig } from "./provider";
import { OptimismGasData } from "./v3/gas-data-provider";

export type SimulationResult = {
  transaction: {
    hash: string;
    gas_used: number;
    gas: number;
    error_message: string;
  };
  simulation: { state_overrides: Record<string, unknown> };
};

export enum SimulationStatus {
  NotSupported = 0,
  Failed = 1,
  Succeeded = 2,
  InsufficientBalance = 3,
  NotApproved = 4,
}

/**
 * Provider for dry running transactions.
 *
 * @export
 * @class Simulator
 */
export abstract class Simulator {
  protected provider: JsonRpcProvider;

  /**
   * Returns a new SwapRoute with simulated gas estimates
   * @returns SwapRoute
   */
  constructor(provider: JsonRpcProvider) {
    this.provider = provider;
  }

  public async simulate(
    fromAddress: string,
    swapOptions: SwapOptions,
    swapRoute: SwapRoute,
    amount: CurrencyAmount,
    quote: CurrencyAmount,
    l2GasData?: OptimismGasData,
    providerConfig?: ProviderConfig
  ): Promise<SwapRoute> {
    if (
      await this.userHasSufficientBalance(
        fromAddress,
        swapRoute.trade.tradeType,
        amount,
        quote
      )
    ) {
      log.info(
        "User has sufficient balance to simulate. Simulating transaction."
      );
      try {
        return this.simulateTransaction(
          fromAddress,
          swapOptions,
          swapRoute,
          l2GasData,
          providerConfig
        );
      } catch (e) {
        log.error({ e }, "Error simulating transaction");
        return {
          ...swapRoute,
          simulationStatus: SimulationStatus.Failed,
        };
      }
    } else {
      log.error("User does not have sufficient balance to simulate.");
      return {
        ...swapRoute,
        simulationStatus: SimulationStatus.InsufficientBalance,
      };
    }
  }

  protected abstract simulateTransaction(
    fromAddress: string,
    swapOptions: SwapOptions,
    swapRoute: SwapRoute,
    l2GasData?: OptimismGasData,
    providerConfig?: ProviderConfig
  ): Promise<SwapRoute>;

  protected async userHasSufficientBalance(
    fromAddress: string,
    tradeType: TradeType,
    amount: CurrencyAmount,
    quote: CurrencyAmount
  ): Promise<boolean> {
    try {
      const neededBalance = tradeType == TradeType.EXACT_INPUT ? amount : quote;
      let balance;
      if (neededBalance.currency.isNative) {
        balance = await this.provider.getBalance(fromAddress);
      } else {
        const tokenContract = Erc20__factory.connect(
          neededBalance.currency.address,
          this.provider
        );
        balance = await tokenContract.balanceOf(fromAddress);
      }

      const hasBalance = balance.gte(
        BigNumber.from(neededBalance.quotient.toString())
      );
      log.info(
        {
          fromAddress,
          balance: balance.toString(),
          neededBalance: neededBalance.quotient.toString(),
          neededAddress: neededBalance.wrapped.currency.address,
          hasBalance,
        },
        "Result of balance check for simulation"
      );
      return hasBalance;
    } catch (e) {
      log.error(e, "Error while checking user balance");
      return false;
    }
  }

  protected async checkTokenApproved(
    fromAddress: string,
    inputAmount: CurrencyAmount,
    swapOptions: SwapOptions,
    provider: JsonRpcProvider
  ): Promise<boolean> {
    // Check token has approved Permit2 more than expected amount.
    const tokenContract = Erc20__factory.connect(
      inputAmount.currency.wrapped.address,
      provider
    );

    if (swapOptions.type == SwapType.SWAP_ROUTER_02) {
      if (swapOptions.inputTokenPermit) {
        log.info(
          {
            inputAmount: inputAmount.quotient.toString(),
          },
          "Simulating on SwapRouter02 info - Permit was provided for simulation. Not checking allowances."
        );
        return true;
      }

      const allowance = await tokenContract.allowance(
        fromAddress,
        SWAP_ROUTER_02_ADDRESS
      );
      const hasAllowance = allowance.gte(
        BigNumber.from(inputAmount.quotient.toString())
      );
      log.info(
        {
          hasAllowance,
          allowance: allowance.toString(),
          inputAmount: inputAmount.quotient.toString(),
        },
        `Simulating on SwapRouter02 - Has allowance: ${hasAllowance}`
      );
      // Return true if token allowance is greater than input amount
      return hasAllowance;
    }

    throw new Error(`Unsupported swap type ${swapOptions}`);
  }
}
