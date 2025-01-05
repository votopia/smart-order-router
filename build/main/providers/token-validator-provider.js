"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenValidatorProvider = exports.TokenValidationResult = exports.DEFAULT_ALLOWLIST = void 0;
const sdk_core_1 = require("@votopia/sdk-core");
const lodash_1 = __importDefault(require("lodash"));
const ITokenValidator__factory_1 = require("../types/other/factories/ITokenValidator__factory");
const util_1 = require("../util");
exports.DEFAULT_ALLOWLIST = new Set([
    // RYOSHI. Does not allow transfers between contracts so fails validation.
    "0x777E2ae845272a2F540ebf6a3D03734A5a8f618e".toLowerCase(),
]);
var TokenValidationResult;
(function (TokenValidationResult) {
    TokenValidationResult[TokenValidationResult["UNKN"] = 0] = "UNKN";
    TokenValidationResult[TokenValidationResult["FOT"] = 1] = "FOT";
    TokenValidationResult[TokenValidationResult["STF"] = 2] = "STF";
})(TokenValidationResult = exports.TokenValidationResult || (exports.TokenValidationResult = {}));
const TOKEN_VALIDATOR_ADDRESS = "0xb5ee1690b7dcc7859771148d0889be838fe108e0";
const AMOUNT_TO_FLASH_BORROW = "1000";
const GAS_LIMIT_PER_VALIDATE = 1000000;
class TokenValidatorProvider {
    constructor(multicall2Provider, tokenValidationCache, tokenValidatorAddress = TOKEN_VALIDATOR_ADDRESS, gasLimitPerCall = GAS_LIMIT_PER_VALIDATE, amountToFlashBorrow = AMOUNT_TO_FLASH_BORROW, allowList = exports.DEFAULT_ALLOWLIST) {
        this.multicall2Provider = multicall2Provider;
        this.tokenValidationCache = tokenValidationCache;
        this.tokenValidatorAddress = tokenValidatorAddress;
        this.gasLimitPerCall = gasLimitPerCall;
        this.amountToFlashBorrow = amountToFlashBorrow;
        this.allowList = allowList;
        this.CACHE_KEY = (address) => `token-${address}`;
        this.BASES = [sdk_core_1.WRAPPED_NATIVE_TOKEN.address];
    }
    async validateTokens(tokens, providerConfig) {
        const tokenAddressToToken = lodash_1.default.keyBy(tokens, "address");
        const addressesRaw = (0, lodash_1.default)(tokens)
            .map((token) => token.address)
            .uniq()
            .value();
        const addresses = [];
        const tokenToResult = {};
        // Check if we have cached token validation results for any tokens.
        for (const address of addressesRaw) {
            if (await this.tokenValidationCache.has(this.CACHE_KEY(address))) {
                tokenToResult[address.toLowerCase()] =
                    (await this.tokenValidationCache.get(this.CACHE_KEY(address)));
                util_1.metric.putMetric(`TokenValidatorProviderValidateCacheHitResult${tokenToResult[address.toLowerCase()]}`, 1, util_1.MetricLoggerUnit.Count);
            }
            else {
                addresses.push(address);
            }
        }
        util_1.log.info(`Got token validation results for ${addressesRaw.length - addresses.length} tokens from cache. Getting ${addresses.length} on-chain.`);
        const functionParams = (0, lodash_1.default)(addresses)
            .map((address) => [address, this.BASES, this.amountToFlashBorrow])
            .value();
        // We use the validate function instead of batchValidate to avoid poison pill problem.
        // One token that consumes too much gas could cause the entire batch to fail.
        const multicallResult = await this.multicall2Provider.callSameFunctionOnContractWithMultipleParams({
            address: this.tokenValidatorAddress,
            contractInterface: ITokenValidator__factory_1.ITokenValidator__factory.createInterface(),
            functionName: "validate",
            functionParams: functionParams,
            providerConfig,
            additionalConfig: {
                gasLimitPerCallOverride: this.gasLimitPerCall,
            },
        });
        for (let i = 0; i < multicallResult.results.length; i++) {
            const resultWrapper = multicallResult.results[i];
            const tokenAddress = addresses[i];
            const token = tokenAddressToToken[tokenAddress];
            if (this.allowList.has(token.address.toLowerCase())) {
                tokenToResult[token.address.toLowerCase()] = TokenValidationResult.UNKN;
                await this.tokenValidationCache.set(this.CACHE_KEY(token.address.toLowerCase()), tokenToResult[token.address.toLowerCase()]);
                continue;
            }
            // Could happen if the tokens transfer consumes too much gas so we revert. Just
            // drop the token in that case.
            if (!resultWrapper.success) {
                util_1.metric.putMetric("TokenValidatorProviderValidateFailed", 1, util_1.MetricLoggerUnit.Count);
                util_1.log.error({ result: resultWrapper }, `Failed to validate token ${token.symbol}`);
                continue;
            }
            util_1.metric.putMetric("TokenValidatorProviderValidateSuccess", 1, util_1.MetricLoggerUnit.Count);
            const validationResult = resultWrapper.result[0];
            tokenToResult[token.address.toLowerCase()] =
                validationResult;
            await this.tokenValidationCache.set(this.CACHE_KEY(token.address.toLowerCase()), tokenToResult[token.address.toLowerCase()]);
            util_1.metric.putMetric(`TokenValidatorProviderValidateCacheMissResult${validationResult}`, 1, util_1.MetricLoggerUnit.Count);
        }
        return {
            getValidationByToken: (token) => tokenToResult[token.address.toLowerCase()],
        };
    }
}
exports.TokenValidatorProvider = TokenValidatorProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4tdmFsaWRhdG9yLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy90b2tlbi12YWxpZGF0b3ItcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0RBQWdFO0FBQ2hFLG9EQUF1QjtBQUV2QixnR0FBNkY7QUFDN0Ysa0NBQXdEO0FBTTNDLFFBQUEsaUJBQWlCLEdBQUcsSUFBSSxHQUFHLENBQVM7SUFDL0MsMEVBQTBFO0lBQzFFLDRDQUE0QyxDQUFDLFdBQVcsRUFBRTtDQUMzRCxDQUFDLENBQUM7QUFFSCxJQUFZLHFCQUlYO0FBSkQsV0FBWSxxQkFBcUI7SUFDL0IsaUVBQVEsQ0FBQTtJQUNSLCtEQUFPLENBQUE7SUFDUCwrREFBTyxDQUFBO0FBQ1QsQ0FBQyxFQUpXLHFCQUFxQixHQUFyQiw2QkFBcUIsS0FBckIsNkJBQXFCLFFBSWhDO0FBTUQsTUFBTSx1QkFBdUIsR0FBRyw0Q0FBNEMsQ0FBQztBQUM3RSxNQUFNLHNCQUFzQixHQUFHLE1BQU0sQ0FBQztBQUN0QyxNQUFNLHNCQUFzQixHQUFHLE9BQVMsQ0FBQztBQXNCekMsTUFBYSxzQkFBc0I7SUFLakMsWUFDWSxrQkFBc0MsRUFDeEMsb0JBQW1ELEVBQ25ELHdCQUF3Qix1QkFBdUIsRUFDL0Msa0JBQWtCLHNCQUFzQixFQUN4QyxzQkFBc0Isc0JBQXNCLEVBQzVDLFlBQVkseUJBQWlCO1FBTDNCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDeEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUErQjtRQUNuRCwwQkFBcUIsR0FBckIscUJBQXFCLENBQTBCO1FBQy9DLG9CQUFlLEdBQWYsZUFBZSxDQUF5QjtRQUN4Qyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXlCO1FBQzVDLGNBQVMsR0FBVCxTQUFTLENBQW9CO1FBVi9CLGNBQVMsR0FBRyxDQUFDLE9BQWUsRUFBRSxFQUFFLENBQUMsU0FBUyxP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