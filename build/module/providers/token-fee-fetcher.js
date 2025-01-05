import { BigNumber } from "@ethersproject/bignumber";
import { WRAPPED_NATIVE_TOKEN_ADDRESS } from "@votopia/sdk-core";
import { TokenFeeDetector__factory } from "../types/other/factories/TokenFeeDetector__factory";
import { log, metric, MetricLoggerUnit } from "../util";
const DEFAULT_TOKEN_BUY_FEE_BPS = BigNumber.from(0);
const DEFAULT_TOKEN_SELL_FEE_BPS = BigNumber.from(0);
// on detector failure, assume no fee
export const DEFAULT_TOKEN_FEE_RESULT = {
    buyFeeBps: DEFAULT_TOKEN_BUY_FEE_BPS,
    sellFeeBps: DEFAULT_TOKEN_SELL_FEE_BPS,
};
// address at which the FeeDetector lens is deployed
const FEE_DETECTOR_ADDRESS = "0x19C97dc2a25845C7f9d1d519c8C2d4809c58b43f";
// Amount has to be big enough to avoid rounding errors, but small enough that
// most v2 pools will have at least this many token units
// 100000 is the smallest number that avoids rounding errors in bps terms
// 10000 was not sufficient due to rounding errors for rebase token (e.g. stETH)
const AMOUNT_TO_FLASH_BORROW = "100000";
// 1M gas limit per validate call, should cover most swap cases
const GAS_LIMIT_PER_VALIDATE = 1000000;
export class OnChainTokenFeeFetcher {
    constructor(rpcProvider, tokenFeeAddress = FEE_DETECTOR_ADDRESS, gasLimitPerCall = GAS_LIMIT_PER_VALIDATE, amountToFlashBorrow = AMOUNT_TO_FLASH_BORROW) {
        this.tokenFeeAddress = tokenFeeAddress;
        this.gasLimitPerCall = gasLimitPerCall;
        this.amountToFlashBorrow = amountToFlashBorrow;
        this.BASE_TOKEN = WRAPPED_NATIVE_TOKEN_ADDRESS;
        this.contract = TokenFeeDetector__factory.connect(this.tokenFeeAddress, rpcProvider);
    }
    async fetchFees(addresses, providerConfig) {
        const tokenToResult = {};
        const addressesWithoutBaseToken = addresses.filter((address) => address.toLowerCase() !== this.BASE_TOKEN.toLowerCase());
        const functionParams = addressesWithoutBaseToken.map((address) => [
            address,
            this.BASE_TOKEN,
            this.amountToFlashBorrow,
        ]);
        const results = await Promise.all(functionParams.map(async ([address, baseToken, amountToBorrow]) => {
            try {
                // We use the validate function instead of batchValidate to avoid poison pill problem.
                // One token that consumes too much gas could cause the entire batch to fail.
                const feeResult = await this.contract.callStatic.validate(address, baseToken, amountToBorrow, {
                    gasLimit: this.gasLimitPerCall,
                    blockTag: providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.blockNumber,
                });
                metric.putMetric("TokenFeeFetcherFetchFeesSuccess", 1, MetricLoggerUnit.Count);
                return { address, ...feeResult };
            }
            catch (err) {
                log.error({ err }, `Error calling validate on-chain for token ${address}`);
                metric.putMetric("TokenFeeFetcherFetchFeesFailure", 1, MetricLoggerUnit.Count);
                // in case of FOT token fee fetch failure, we return null
                // so that they won't get returned from the token-fee-fetcher
                // and thus no fee will be applied, and the cache won't cache on FOT tokens with failed fee fetching
                return { address, buyFeeBps: undefined, sellFeeBps: undefined };
            }
        }));
        results.forEach(({ address, buyFeeBps, sellFeeBps }) => {
            if (buyFeeBps || sellFeeBps) {
                tokenToResult[address] = { buyFeeBps, sellFeeBps };
            }
        });
        return tokenToResult;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4tZmVlLWZldGNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcHJvdmlkZXJzL3Rva2VuLWZlZS1mZXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUdyRCxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNqRSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUUvRixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUl4RCxNQUFNLHlCQUF5QixHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEQsTUFBTSwwQkFBMEIsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRXJELHFDQUFxQztBQUNyQyxNQUFNLENBQUMsTUFBTSx3QkFBd0IsR0FBRztJQUN0QyxTQUFTLEVBQUUseUJBQXlCO0lBQ3BDLFVBQVUsRUFBRSwwQkFBMEI7Q0FDdkMsQ0FBQztBQVVGLG9EQUFvRDtBQUNwRCxNQUFNLG9CQUFvQixHQUFHLDRDQUE0QyxDQUFDO0FBRTFFLDhFQUE4RTtBQUM5RSx5REFBeUQ7QUFDekQseUVBQXlFO0FBQ3pFLGdGQUFnRjtBQUNoRixNQUFNLHNCQUFzQixHQUFHLFFBQVEsQ0FBQztBQUN4QywrREFBK0Q7QUFDL0QsTUFBTSxzQkFBc0IsR0FBRyxPQUFTLENBQUM7QUFTekMsTUFBTSxPQUFPLHNCQUFzQjtJQUlqQyxZQUNFLFdBQXlCLEVBQ2pCLGtCQUFrQixvQkFBb0IsRUFDdEMsa0JBQWtCLHNCQUFzQixFQUN4QyxzQkFBc0Isc0JBQXNCO1FBRjVDLG9CQUFlLEdBQWYsZUFBZSxDQUF1QjtRQUN0QyxvQkFBZSxHQUFmLGVBQWUsQ0FBeUI7UUFDeEMsd0JBQW1C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