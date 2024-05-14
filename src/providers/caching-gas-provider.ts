import { log } from "../util/log";

import { ICache } from "./cache";
import { GasPrice, IGasPriceProvider } from "./gas-price-provider";

/**
 * Provider for getting gas price, with functionality for caching the results.
 *
 * @export
 * @class CachingV3SubgraphProvider
 */
export class CachingGasStationProvider implements IGasPriceProvider {
  private GAS_KEY = () => `gasPrice`;

  /**
   * Creates an instance of CachingGasStationProvider.
   * @param gasPriceProvider The provider to use to get the gas price when not in the cache.
   * @param cache Cache instance to hold cached pools.
   */
  constructor(
    private gasPriceProvider: IGasPriceProvider,
    private cache: ICache<GasPrice>
  ) {}

  public async getGasPrice(): Promise<GasPrice> {
    const cachedGasPrice = await this.cache.get(this.GAS_KEY());

    if (cachedGasPrice) {
      log.info(
        { cachedGasPrice },
        `Got gas station price from local cache: ${cachedGasPrice.gasPriceWei}.`
      );

      return cachedGasPrice;
    }

    log.info("Gas station price local cache miss.");
    const gasPrice = await this.gasPriceProvider.getGasPrice();
    await this.cache.set(this.GAS_KEY(), gasPrice);

    return gasPrice;
  }
}
