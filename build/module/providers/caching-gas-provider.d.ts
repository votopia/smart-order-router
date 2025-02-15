import { ICache } from "./cache";
import { GasPrice, IGasPriceProvider } from "./gas-price-provider";
/**
 * Provider for getting gas price, with functionality for caching the results.
 *
 * @export
 * @class CachingV3SubgraphProvider
 */
export declare class CachingGasStationProvider implements IGasPriceProvider {
    private gasPriceProvider;
    private cache;
    private GAS_KEY;
    /**
     * Creates an instance of CachingGasStationProvider.
     * @param gasPriceProvider The provider to use to get the gas price when not in the cache.
     * @param cache Cache instance to hold cached pools.
     */
    constructor(gasPriceProvider: IGasPriceProvider, cache: ICache<GasPrice>);
    getGasPrice(): Promise<GasPrice>;
}
