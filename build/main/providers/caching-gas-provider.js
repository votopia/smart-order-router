"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachingGasStationProvider = void 0;
const log_1 = require("../util/log");
/**
 * Provider for getting gas price, with functionality for caching the results.
 *
 * @export
 * @class CachingV3SubgraphProvider
 */
class CachingGasStationProvider {
    /**
     * Creates an instance of CachingGasStationProvider.
     * @param gasPriceProvider The provider to use to get the gas price when not in the cache.
     * @param cache Cache instance to hold cached pools.
     */
    constructor(gasPriceProvider, cache) {
        this.gasPriceProvider = gasPriceProvider;
        this.cache = cache;
        this.GAS_KEY = () => `gasPrice`;
    }
    async getGasPrice() {
        const cachedGasPrice = await this.cache.get(this.GAS_KEY());
        if (cachedGasPrice) {
            log_1.log.info({ cachedGasPrice }, `Got gas station price from local cache: ${cachedGasPrice.gasPriceWei}.`);
            return cachedGasPrice;
        }
        log_1.log.info("Gas station price local cache miss.");
        const gasPrice = await this.gasPriceProvider.getGasPrice();
        await this.cache.set(this.GAS_KEY(), gasPrice);
        return gasPrice;
    }
}
exports.CachingGasStationProvider = CachingGasStationProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGluZy1nYXMtcHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcHJvdmlkZXJzL2NhY2hpbmctZ2FzLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUFrQztBQUtsQzs7Ozs7R0FLRztBQUNILE1BQWEseUJBQXlCO0lBR3BDOzs7O09BSUc7SUFDSCxZQUNVLGdCQUFtQyxFQUNuQyxLQUF1QjtRQUR2QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQW1CO1FBQ25DLFVBQUssR0FBTCxLQUFLLENBQWtCO1FBVHpCLFlBQU8sR0FBRyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUM7SUFVaEMsQ0FBQztJQUVHLEtBQUssQ0FBQyxXQUFXO1FBQ3RCLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFFNUQsSUFBSSxjQUFjLEVBQUU7WUFDbEIsU0FBRyxDQUFDLElBQUksQ0FDTixFQUFFLGNBQWMsRUFBRSxFQUNsQiwyQ0FBMkMsY0FBYyxDQUFDLFdBQVcsR0FBRyxDQUN6RSxDQUFDO1lBRUYsT0FBTyxjQUFjLENBQUM7U0FDdkI7UUFFRCxTQUFHLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDaEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0QsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFL0MsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztDQUNGO0FBL0JELDhEQStCQyJ9