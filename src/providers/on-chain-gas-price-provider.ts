import { EIP1559GasPriceProvider } from "./eip-1559-gas-price-provider";
import { GasPrice, IGasPriceProvider } from "./gas-price-provider";
import { LegacyGasPriceProvider } from "./legacy-gas-price-provider";

/**
 * Gets gas prices on chain. If the chain supports EIP-1559 and has the feeHistory API,
 * uses the EIP1559 provider. Otherwise it will use a legacy provider that uses eth_gasPrice
 *
 * @export
 * @class OnChainGasPriceProvider
 */
export class OnChainGasPriceProvider extends IGasPriceProvider {
  constructor(
    protected eip1559GasPriceProvider: EIP1559GasPriceProvider,
    protected legacyGasPriceProvider: LegacyGasPriceProvider
  ) {
    super();
  }

  public async getGasPrice(): Promise<GasPrice> {
    return this.legacyGasPriceProvider.getGasPrice();
  }
}
