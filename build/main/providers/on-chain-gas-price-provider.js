"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnChainGasPriceProvider = void 0;
const gas_price_provider_1 = require("./gas-price-provider");
/**
 * Gets gas prices on chain. If the chain supports EIP-1559 and has the feeHistory API,
 * uses the EIP1559 provider. Otherwise it will use a legacy provider that uses eth_gasPrice
 *
 * @export
 * @class OnChainGasPriceProvider
 */
class OnChainGasPriceProvider extends gas_price_provider_1.IGasPriceProvider {
    constructor(eip1559GasPriceProvider, legacyGasPriceProvider) {
        super();
        this.eip1559GasPriceProvider = eip1559GasPriceProvider;
        this.legacyGasPriceProvider = legacyGasPriceProvider;
    }
    async getGasPrice() {
        return this.legacyGasPriceProvider.getGasPrice();
    }
}
exports.OnChainGasPriceProvider = OnChainGasPriceProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24tY2hhaW4tZ2FzLXByaWNlLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy9vbi1jaGFpbi1nYXMtcHJpY2UtcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsNkRBQW1FO0FBR25FOzs7Ozs7R0FNRztBQUNILE1BQWEsdUJBQXdCLFNBQVEsc0NBQWlCO0lBQzVELFlBQ1ksdUJBQWdELEVBQ2hELHNCQUE4QztRQUV4RCxLQUFLLEVBQUUsQ0FBQztRQUhFLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBeUI7UUFDaEQsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF3QjtJQUcxRCxDQUFDO0lBRU0sS0FBSyxDQUFDLFdBQVc7UUFDdEIsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDbkQsQ0FBQztDQUNGO0FBWEQsMERBV0MifQ==