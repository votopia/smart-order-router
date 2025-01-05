import { BigNumber } from "@ethersproject/bignumber";
import { IMulticallProvider } from "../multicall-provider";
/**
 * Provider for getting gas constants on L2s.
 *
 * @export
 * @interface IL2GasDataProvider
 */
export interface IL2GasDataProvider<T> {
    /**
     * Gets the data constants needed to calculate the l1 security fee on L2s like arbitrum and optimism.
     * @returns An object that includes the data necessary for the off chain estimations.
     */
    getGasData(): Promise<T>;
}
export type OptimismGasData = {
    l1BaseFee: BigNumber;
    scalar: BigNumber;
    decimals: BigNumber;
    overhead: BigNumber;
};
export declare class OptimismGasDataProvider implements IL2GasDataProvider<OptimismGasData> {
    protected multicall2Provider: IMulticallProvider;
    protected gasOracleAddress: string;
    constructor(multicall2Provider: IMulticallProvider, gasPriceAddress?: string);
    /**
     * Gets the data constants needed to calculate the l1 security fee on Optimism.
     * @returns An OptimismGasData object that includes the l1BaseFee,
     * scalar, decimals, and overhead values.
     */
    getGasData(): Promise<OptimismGasData>;
}
