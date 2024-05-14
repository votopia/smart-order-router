import { JsonRpcProvider } from "@ethersproject/providers";

import axios, { AxiosRequestConfig } from "axios";
import { BigNumber } from "ethers/lib/ethers";
import { SWAP_ROUTER_02_ADDRESS } from "@votopia/sdk-core";
import {
  metric,
  MetricLoggerUnit,
  SwapOptions,
  SwapRoute,
  SwapType,
} from "../routers";

import { log } from "../util";
import { APPROVE_TOKEN_FOR_TRANSFER } from "../util/callData";
import {
  calculateGasUsed,
  initSwapRouteFromExisting,
} from "../util/gas-factory-helpers";

import { EthEstimateGasSimulator } from "./eth-estimate-gas-provider";

import { ProviderConfig } from "./provider";
import {
  SimulationResult,
  SimulationStatus,
  Simulator,
} from "./simulation-provider";
import { OptimismGasData } from "./v3/gas-data-provider";
import { IV3PoolProvider } from "./v3/pool-provider";

export type TenderlyResponseUniversalRouter = {
  config: {
    url: string;
    method: string;
    data: string;
  };
  simulation_results: [SimulationResult, SimulationResult, SimulationResult];
};

export type TenderlyResponseSwapRouter02 = {
  config: {
    url: string;
    method: string;
    data: string;
  };
  simulation_results: [SimulationResult, SimulationResult];
};

enum TenderlySimulationType {
  QUICK = "quick",
  FULL = "full",
  ABI = "abi",
}

type TenderlySimulationRequest = {
  estimate_gas: boolean;
  input: string;
  to: string;
  value: string;
  from: string;
  simulation_type: TenderlySimulationType;
  block_number?: number;
  save_if_fails?: boolean;
};

const TENDERLY_BATCH_SIMULATE_API = (
  tenderlyBaseUrl: string,
  tenderlyUser: string,
  tenderlyProject: string
) =>
  `${tenderlyBaseUrl}/api/v1/account/${tenderlyUser}/project/${tenderlyProject}/simulate-batch`;

// We multiply tenderly gas limit by this to overestimate gas limit
const DEFAULT_ESTIMATE_MULTIPLIER = 1.3;

export class FallbackTenderlySimulator extends Simulator {
  private tenderlySimulator: TenderlySimulator;
  private ethEstimateGasSimulator: EthEstimateGasSimulator;
  constructor(
    provider: JsonRpcProvider,
    tenderlySimulator: TenderlySimulator,
    ethEstimateGasSimulator: EthEstimateGasSimulator
  ) {
    super(provider);
    this.tenderlySimulator = tenderlySimulator;
    this.ethEstimateGasSimulator = ethEstimateGasSimulator;
  }

  protected async simulateTransaction(
    fromAddress: string,
    swapOptions: SwapOptions,
    swapRoute: SwapRoute,
    l2GasData?: OptimismGasData,
    providerConfig?: ProviderConfig
  ): Promise<SwapRoute> {
    // Make call to eth estimate gas if possible
    // For erc20s, we must check if the token allowance is sufficient
    const inputAmount = swapRoute.trade.inputAmount;

    if (
      inputAmount.currency.isNative ||
      (await this.checkTokenApproved(
        fromAddress,
        inputAmount,
        swapOptions,
        this.provider
      ))
    ) {
      log.info(
        "Simulating with eth_estimateGas since token is native or approved."
      );

      try {
        const swapRouteWithGasEstimate =
          await this.ethEstimateGasSimulator.ethEstimateGas(
            fromAddress,
            swapOptions,
            swapRoute,
            l2GasData,
            providerConfig
          );
        return swapRouteWithGasEstimate;
      } catch (err) {
        log.info({ err: err }, "Error simulating using eth_estimateGas");
        return { ...swapRoute, simulationStatus: SimulationStatus.Failed };
      }
    }

    try {
      return await this.tenderlySimulator.simulateTransaction(
        fromAddress,
        swapOptions,
        swapRoute,
        l2GasData,
        providerConfig
      );
    } catch (err) {
      log.info({ err: err }, "Failed to simulate via Tenderly");
      return { ...swapRoute, simulationStatus: SimulationStatus.Failed };
    }
  }
}

export class TenderlySimulator extends Simulator {
  private tenderlyBaseUrl: string;
  private tenderlyUser: string;
  private tenderlyProject: string;
  private tenderlyAccessKey: string;
  private v3PoolProvider: IV3PoolProvider;
  private overrideEstimateMultiplier: number | undefined;
  private tenderlyRequestTimeout?: number;

  constructor(
    tenderlyBaseUrl: string,
    tenderlyUser: string,
    tenderlyProject: string,
    tenderlyAccessKey: string,
    v3PoolProvider: IV3PoolProvider,
    provider: JsonRpcProvider,
    overrideEstimateMultiplier?: number,
    tenderlyRequestTimeout?: number
  ) {
    super(provider);
    this.tenderlyBaseUrl = tenderlyBaseUrl;
    this.tenderlyUser = tenderlyUser;
    this.tenderlyProject = tenderlyProject;
    this.tenderlyAccessKey = tenderlyAccessKey;
    this.v3PoolProvider = v3PoolProvider;
    this.overrideEstimateMultiplier = overrideEstimateMultiplier ?? undefined;
    this.tenderlyRequestTimeout = tenderlyRequestTimeout;
  }

  public async simulateTransaction(
    fromAddress: string,
    swapOptions: SwapOptions,
    swapRoute: SwapRoute,
    l2GasData?: OptimismGasData,
    providerConfig?: ProviderConfig
  ): Promise<SwapRoute> {
    const currencyIn = swapRoute.trade.inputAmount.currency;
    const tokenIn = currencyIn.wrapped;

    if (!swapRoute.methodParameters) {
      const msg = "No calldata provided to simulate transaction";
      log.info(msg);
      throw new Error(msg);
    }

    const { calldata } = swapRoute.methodParameters;

    log.info(
      {
        calldata: swapRoute.methodParameters.calldata,
        fromAddress: fromAddress,

        tokenInAddress: tokenIn.address,
        router: swapOptions.type,
      },
      "Simulating transaction on Tenderly"
    );
    let estimatedGasUsed: BigNumber;
    const estimateMultiplier =
      this.overrideEstimateMultiplier ?? DEFAULT_ESTIMATE_MULTIPLIER;

    if (swapOptions.type == SwapType.SWAP_ROUTER_02) {
      const approve: TenderlySimulationRequest = {
        input: APPROVE_TOKEN_FOR_TRANSFER,
        estimate_gas: true,
        to: tokenIn.address,
        value: "0",
        from: fromAddress,
        simulation_type: TenderlySimulationType.QUICK,
      };

      const swap: TenderlySimulationRequest = {
        input: calldata,
        to: SWAP_ROUTER_02_ADDRESS,
        estimate_gas: true,
        value: currencyIn.isNative ? swapRoute.methodParameters.value : "0",
        from: fromAddress,
        // TODO: This is a Temporary fix given by Tenderly team, remove once resolved on their end.
        block_number: undefined,
        simulation_type: TenderlySimulationType.QUICK,
      };

      const body = { simulations: [approve, swap] };
      const opts: AxiosRequestConfig = {
        headers: {
          "X-Access-Key": this.tenderlyAccessKey,
        },
        timeout: this.tenderlyRequestTimeout,
      };

      const url = TENDERLY_BATCH_SIMULATE_API(
        this.tenderlyBaseUrl,
        this.tenderlyUser,
        this.tenderlyProject
      );

      const before = Date.now();

      const resp = (
        await axios.post<TenderlyResponseSwapRouter02>(url, body, opts)
      ).data;

      const latencies = Date.now() - before;
      log.info(
        `Tenderly simulation swap router02 request body: ${body}, having latencies ${latencies} in milliseconds.`
      );
      metric.putMetric(
        "TenderlySimulationSwapRouter02Latencies",
        latencies,
        MetricLoggerUnit.Milliseconds
      );

      // Validate tenderly response body
      if (
        !resp ||
        resp.simulation_results.length < 2 ||
        !resp.simulation_results[1].transaction ||
        resp.simulation_results[1].transaction.error_message
      ) {
        const msg = `Failed to Simulate Via Tenderly!: ${resp.simulation_results[1].transaction.error_message}`;
        log.info(
          { err: resp.simulation_results[1].transaction.error_message },
          msg
        );
        return { ...swapRoute, simulationStatus: SimulationStatus.Failed };
      }

      // Parse the gas used in the simulation response object, and then pad it so that we overestimate.
      estimatedGasUsed = BigNumber.from(
        (
          resp.simulation_results[1].transaction.gas * estimateMultiplier
        ).toFixed(0)
      );

      log.info(
        {
          body,
          approveGasUsed: resp.simulation_results[0].transaction.gas_used,
          swapGasUsed: resp.simulation_results[1].transaction.gas_used,
          approveGas: resp.simulation_results[0].transaction.gas,
          swapGas: resp.simulation_results[1].transaction.gas,
          swapWithMultiplier: estimatedGasUsed.toString(),
        },
        "Successfully Simulated Approval + Swap via Tenderly for SwapRouter02. Gas used."
      );

      log.info(
        {
          body,
          swapTransaction: resp.simulation_results[1].transaction,
          swapSimulation: resp.simulation_results[1].simulation,
        },
        "Successful Tenderly Swap Simulation for SwapRouter02"
      );
    } else {
      throw new Error(`Unsupported swap type: ${swapOptions}`);
    }

    const {
      estimatedGasUsedUSD,
      estimatedGasUsedQuoteToken,
      quoteGasAdjusted,
    } = await calculateGasUsed(
      swapRoute,
      estimatedGasUsed,
      this.v3PoolProvider,
      l2GasData,
      providerConfig
    );
    return {
      ...initSwapRouteFromExisting(
        swapRoute,

        this.v3PoolProvider,

        quoteGasAdjusted,
        estimatedGasUsed,
        estimatedGasUsedQuoteToken,
        estimatedGasUsedUSD
      ),
      simulationStatus: SimulationStatus.Succeeded,
    };
  }
}
