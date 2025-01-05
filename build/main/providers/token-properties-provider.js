"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenPropertiesProvider = exports.NEGATIVE_CACHE_ENTRY_TTL = exports.POSITIVE_CACHE_ENTRY_TTL = exports.DEFAULT_TOKEN_PROPERTIES_RESULT = void 0;
const util_1 = require("../util");
const token_fee_fetcher_1 = require("./token-fee-fetcher");
const token_validator_provider_1 = require("./token-validator-provider");
exports.DEFAULT_TOKEN_PROPERTIES_RESULT = {
    tokenFeeResult: token_fee_fetcher_1.DEFAULT_TOKEN_FEE_RESULT,
};
exports.POSITIVE_CACHE_ENTRY_TTL = 600; // 10 minutes in seconds
exports.NEGATIVE_CACHE_ENTRY_TTL = 600; // 10 minutes in seconds
class TokenPropertiesProvider {
    constructor(tokenPropertiesCache, tokenFeeFetcher, allowList = token_validator_provider_1.DEFAULT_ALLOWLIST, positiveCacheEntryTTL = exports.POSITIVE_CACHE_ENTRY_TTL, negativeCacheEntryTTL = exports.NEGATIVE_CACHE_ENTRY_TTL) {
        this.tokenPropertiesCache = tokenPropertiesCache;
        this.tokenFeeFetcher = tokenFeeFetcher;
        this.allowList = allowList;
        this.positiveCacheEntryTTL = positiveCacheEntryTTL;
        this.negativeCacheEntryTTL = negativeCacheEntryTTL;
        this.CACHE_KEY = (address) => `token-properties-${address}`;
    }
    async getTokensProperties(tokens, providerConfig) {
        const tokenToResult = {};
        if (!(providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.enableFeeOnTransferFeeFetching)) {
            return tokenToResult;
        }
        const addressesToFetchFeesOnchain = [];
        const addressesRaw = this.buildAddressesRaw(tokens);
        const tokenProperties = await this.tokenPropertiesCache.batchGet(addressesRaw);
        // Check if we have cached token validation results for any tokens.
        for (const address of addressesRaw) {
            const cachedValue = tokenProperties[address];
            if (cachedValue) {
                util_1.metric.putMetric("TokenPropertiesProviderBatchGetCacheHit", 1, util_1.MetricLoggerUnit.Count);
                const tokenFee = cachedValue.tokenFeeResult;
                const tokenFeeResultExists = tokenFee && (tokenFee.buyFeeBps || tokenFee.sellFeeBps);
                if (tokenFeeResultExists) {
                    util_1.metric.putMetric(`TokenPropertiesProviderCacheHitTokenFeeResultExists${tokenFeeResultExists}`, 1, util_1.MetricLoggerUnit.Count);
                }
                else {
                    util_1.metric.putMetric(`TokenPropertiesProviderCacheHitTokenFeeResultNotExists`, 1, util_1.MetricLoggerUnit.Count);
                }
                tokenToResult[address] = cachedValue;
            }
            else if (this.allowList.has(address)) {
                tokenToResult[address] = {
                    tokenValidationResult: token_validator_provider_1.TokenValidationResult.UNKN,
                };
            }
            else {
                addressesToFetchFeesOnchain.push(address);
            }
        }
        if (addressesToFetchFeesOnchain.length > 0) {
            let tokenFeeMap = {};
            try {
                tokenFeeMap = await this.tokenFeeFetcher.fetchFees(addressesToFetchFeesOnchain, providerConfig);
            }
            catch (err) {
                util_1.log.error({ err }, `Error fetching fees for tokens ${addressesToFetchFeesOnchain}`);
            }
            await Promise.all(addressesToFetchFeesOnchain.map((address) => {
                const tokenFee = tokenFeeMap[address];
                const tokenFeeResultExists = tokenFee && (tokenFee.buyFeeBps || tokenFee.sellFeeBps);
                if (tokenFeeResultExists) {
                    // we will leverage the metric to log the token fee result, if it exists
                    // the idea is that the token fee should not differ by too much across tokens,
                    // so that we can accurately log the token fee for a particular quote request (without breaching metrics dimensionality limit)
                    // in the form of metrics.
                    // if we log as logging, given prod traffic volume, the logging volume will be high.
                    util_1.metric.putMetric(`TokenPropertiesProviderTokenFeeResultCacheMissExists${tokenFeeResultExists}`, 1, util_1.MetricLoggerUnit.Count);
                    const tokenPropertiesResult = {
                        tokenFeeResult: tokenFee,
                        tokenValidationResult: token_validator_provider_1.TokenValidationResult.FOT,
                    };
                    tokenToResult[address] = tokenPropertiesResult;
                    util_1.metric.putMetric("TokenPropertiesProviderBatchGetCacheMiss", 1, util_1.MetricLoggerUnit.Count);
                    // update cache concurrently
                    // at this point, we are confident that the tokens are FOT, so we can hardcode the validation result
                    return this.tokenPropertiesCache.set(this.CACHE_KEY(address), tokenPropertiesResult, this.positiveCacheEntryTTL);
                }
                else {
                    util_1.metric.putMetric(`TokenPropertiesProviderTokenFeeResultCacheMissNotExists`, 1, util_1.MetricLoggerUnit.Count);
                    const tokenPropertiesResult = {
                        tokenFeeResult: undefined,
                        tokenValidationResult: undefined,
                    };
                    tokenToResult[address] = tokenPropertiesResult;
                    return this.tokenPropertiesCache.set(this.CACHE_KEY(address), tokenPropertiesResult, this.negativeCacheEntryTTL);
                }
            }));
        }
        return tokenToResult;
    }
    buildAddressesRaw(tokens) {
        const addressesRaw = new Set();
        for (const token of tokens) {
            const address = token.address.toLowerCase();
            if (!addressesRaw.has(address)) {
                addressesRaw.add(address);
            }
        }
        return addressesRaw;
    }
}
exports.TokenPropertiesProvider = TokenPropertiesProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4tcHJvcGVydGllcy1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9wcm92aWRlcnMvdG9rZW4tcHJvcGVydGllcy1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSxrQ0FBd0Q7QUFJeEQsMkRBSzZCO0FBQzdCLHlFQUdvQztBQUV2QixRQUFBLCtCQUErQixHQUEwQjtJQUNwRSxjQUFjLEVBQUUsNENBQXdCO0NBQ3pDLENBQUM7QUFDVyxRQUFBLHdCQUF3QixHQUFHLEdBQUcsQ0FBQyxDQUFDLHdCQUF3QjtBQUN4RCxRQUFBLHdCQUF3QixHQUFHLEdBQUcsQ0FBQyxDQUFDLHdCQUF3QjtBQWdCckUsTUFBYSx1QkFBdUI7SUFHbEMsWUFDVSxvQkFBbUQsRUFDbkQsZUFBaUMsRUFDakMsWUFBWSw0Q0FBaUIsRUFDN0Isd0JBQXdCLGdDQUF3QixFQUNoRCx3QkFBd0IsZ0NBQXdCO1FBSmhELHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBK0I7UUFDbkQsb0JBQWUsR0FBZixlQUFlLENBQWtCO1FBQ2pDLGNBQVMsR0FBVCxTQUFTLENBQW9CO1FBQzdCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBMkI7UUFDaEQsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUEyQjtRQVBsRCxjQUFTLEdBQUcsQ0FBQyxPQUFlLEVBQUUsRUFBRSxDQUFDLG9CQUFvQixPQUFPLEVBQUUsQ0FBQztJQVFwRSxDQUFDO0lBRUcsS0FBSyxDQUFDLG1CQUFtQixDQUM5QixNQUFlLEVBQ2YsY0FBK0I7UUFFL0IsTUFBTSxhQUFhLEdBQXVCLEVBQUUsQ0FBQztRQUU3QyxJQUFJLENBQUMsQ0FBQSxjQUFjLGFBQWQsY0FBYyx1QkFBZCxjQUFjLENBQUUsOEJBQThCLENBQUEsRUFBRTtZQUNuRCxPQUFPLGFBQWEsQ0FBQztTQUN0QjtRQUVELE1BQU0sMkJBQTJCLEdBQWEsRUFBRSxDQUFDO1FBQ2pELE1BQU0sWUFBWSxHQUFH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