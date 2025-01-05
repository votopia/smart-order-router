import { JsonRpcProvider } from "@ethersproject/providers";
import { SwapOptions, SwapRoute } from "../routers";
import { EthEstimateGasSimulator } from "./eth-estimate-gas-provider";
import { ProviderConfig } from "./provider";
import { SimulationResult, Simulator } from "./simulation-provider";
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
export declare class FallbackTenderlySimulator extends Simulator {
    private tenderlySimulator;
    private ethEstimateGasSimulator;
    constructor(provider: JsonRpcProvider, tenderlySimulator: TenderlySimulator, ethEstimateGasSimulator: EthEstimateGasSimulator);
    protected simulateTransaction(fromAddress: string, swapOptions: SwapOptions, swapRoute: SwapRoute, l2GasData?: OptimismGasData, providerConfig?: ProviderConfig): Promise<SwapRoute>;
}
export declare class TenderlySimulator extends Simulator {
    private tenderlyBaseUrl;
    private tenderlyUser;
    private tenderlyProject;
    private tenderlyAccessKey;
    private v3PoolProvider;
    private overrideEstimateMultiplier;
    private tenderlyRequestTimeout?;
    constructor(tenderlyBaseUrl: string, tenderlyUser: string, tenderlyProject: string, tenderlyAccessKey: string, v3PoolProvider: IV3PoolProvider, provider: JsonRpcProvider, overrideEstimateMultiplier?: number, tenderlyRequestTimeout?: number);
    simulateTransaction(fromAddress: string, swapOptions: SwapOptions, swapRoute: SwapRoute, l2GasData?: OptimismGasData, providerConfig?: ProviderConfig): Promise<SwapRoute>;
}
