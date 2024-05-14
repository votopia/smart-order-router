import { BigNumber } from "@ethersproject/bignumber";

import { GasPriceOracle__factory } from "../../types/other/factories/GasPriceOracle__factory";
import { log } from "../../util";
import { OVM_GASPRICE_ADDRESS } from "@votopia/sdk-core";
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

export class OptimismGasDataProvider
  implements IL2GasDataProvider<OptimismGasData>
{
  protected gasOracleAddress: string;

  constructor(
    protected multicall2Provider: IMulticallProvider,
    gasPriceAddress?: string
  ) {
    this.gasOracleAddress = gasPriceAddress ?? OVM_GASPRICE_ADDRESS;
  }

  /**
   * Gets the data constants needed to calculate the l1 security fee on Optimism.
   * @returns An OptimismGasData object that includes the l1BaseFee,
   * scalar, decimals, and overhead values.
   */
  public async getGasData(): Promise<OptimismGasData> {
    const funcNames = ["l1BaseFee", "scalar", "decimals", "overhead"];
    const tx =
      await this.multicall2Provider.callMultipleFunctionsOnSameContract<
        undefined,
        [BigNumber]
      >({
        address: this.gasOracleAddress,
        contractInterface: GasPriceOracle__factory.createInterface(),
        functionNames: funcNames,
      });

    if (
      !tx.results[0]?.success ||
      !tx.results[1]?.success ||
      !tx.results[2]?.success ||
      !tx.results[3]?.success
    ) {
      log.info(
        { results: tx.results },
        "Failed to get gas constants data from the optimism gas oracle"
      );
      throw new Error(
        "Failed to get gas constants data from the optimism gas oracle"
      );
    }

    const { result: l1BaseFee } = tx.results![0];
    const { result: scalar } = tx.results![1];
    const { result: decimals } = tx.results![2];
    const { result: overhead } = tx.results![3];

    return {
      l1BaseFee: l1BaseFee[0],
      scalar: scalar[0],
      decimals: decimals[0],
      overhead: overhead[0],
    };
  }
}
