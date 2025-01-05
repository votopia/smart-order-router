import { JsonRpcProvider } from "@ethersproject/providers";
import { SwapOptions, SwapRoute } from "../routers";
import { ProviderConfig } from "./provider";
import { Simulator } from "./simulation-provider";
import { OptimismGasData } from "./v3/gas-data-provider";
import { IV3PoolProvider } from "./v3/pool-provider";
export declare class EthEstimateGasSimulator extends Simulator {
    v3PoolProvider: IV3PoolProvider;
    private overrideEstimateMultiplier;
    constructor(provider: JsonRpcProvider, v3PoolProvider: IV3PoolProvider, overrideEstimateMultiplier?: number);
    ethEstimateGas(fromAddress: string, swapOptions: SwapOptions, route: SwapRoute, l2GasData?: OptimismGasData, providerConfig?: ProviderConfig): Promise<SwapRoute>;
    private adjustGasEstimate;
    protected simulateTransaction(fromAddress: string, swapOptions: SwapOptions, swapRoute: SwapRoute, l2GasData?: OptimismGasData | undefined, _providerConfig?: ProviderConfig | undefined): Promise<SwapRoute>;
}
