import { IGasPriceProvider } from "./gas-price-provider";
/**
 * Gets gas prices on chain. If the chain supports EIP-1559 and has the feeHistory API,
 * uses the EIP1559 provider. Otherwise it will use a legacy provider that uses eth_gasPrice
 *
 * @export
 * @class OnChainGasPriceProvider
 */
export class OnChainGasPriceProvider extends IGasPriceProvider {
    constructor(eip1559GasPriceProvider, legacyGasPriceProvider) {
        super();
        this.eip1559GasPriceProvider = eip1559GasPriceProvider;
        this.legacyGasPriceProvider = legacyGasPriceProvider;
    }
    async getGasPrice() {
        return this.legacyGasPriceProvider.getGasPrice();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24tY2hhaW4tZ2FzLXByaWNlLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy9vbi1jaGFpbi1nYXMtcHJpY2UtcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFZLGlCQUFpQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFHbkU7Ozs7OztHQU1HO0FBQ0gsTUFBTSxPQUFPLHVCQUF3QixTQUFRLGlCQUFpQjtJQUM1RCxZQUNZLHVCQUFnRCxFQUNoRCxzQkFBOEM7UUFFeEQsS0FBSyxFQUFFLENBQUM7UUFIRSw0QkFBdUIsR0FBdkIsdUJBQXVCLENBQXlCO1FBQ2hELDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7SUFHMUQsQ0FBQztJQUVNLEtBQUssQ0FBQyxXQUFXO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ25ELENBQUM7Q0FDRiJ9