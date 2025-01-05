import { WRAPPED_NATIVE_TOKEN } from "@votopia/sdk-core";
import _ from "lodash";
import { ITokenValidator__factory } from "../types/other/factories/ITokenValidator__factory";
import { log, metric, MetricLoggerUnit } from "../util";
export const DEFAULT_ALLOWLIST = new Set([
    // RYOSHI. Does not allow transfers between contracts so fails validation.
    "0x777E2ae845272a2F540ebf6a3D03734A5a8f618e".toLowerCase(),
]);
export var TokenValidationResult;
(function (TokenValidationResult) {
    TokenValidationResult[TokenValidationResult["UNKN"] = 0] = "UNKN";
    TokenValidationResult[TokenValidationResult["FOT"] = 1] = "FOT";
    TokenValidationResult[TokenValidationResult["STF"] = 2] = "STF";
})(TokenValidationResult || (TokenValidationResult = {}));
const TOKEN_VALIDATOR_ADDRESS = "0xb5ee1690b7dcc7859771148d0889be838fe108e0";
const AMOUNT_TO_FLASH_BORROW = "1000";
const GAS_LIMIT_PER_VALIDATE = 1000000;
export class TokenValidatorProvider {
    constructor(multicall2Provider, tokenValidationCache, tokenValidatorAddress = TOKEN_VALIDATOR_ADDRESS, gasLimitPerCall = GAS_LIMIT_PER_VALIDATE, amountToFlashBorrow = AMOUNT_TO_FLASH_BORROW, allowList = DEFAULT_ALLOWLIST) {
        this.multicall2Provider = multicall2Provider;
        this.tokenValidationCache = tokenValidationCache;
        this.tokenValidatorAddress = tokenValidatorAddress;
        this.gasLimitPerCall = gasLimitPerCall;
        this.amountToFlashBorrow = amountToFlashBorrow;
        this.allowList = allowList;
        this.CACHE_KEY = (address) => `token-${address}`;
        this.BASES = [WRAPPED_NATIVE_TOKEN.address];
    }
    async validateTokens(tokens, providerConfig) {
        const tokenAddressToToken = _.keyBy(tokens, "address");
        const addressesRaw = _(tokens)
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
                metric.putMetric(`TokenValidatorProviderValidateCacheHitResult${tokenToResult[address.toLowerCase()]}`, 1, MetricLoggerUnit.Count);
            }
            else {
                addresses.push(address);
            }
        }
        log.info(`Got token validation results for ${addressesRaw.length - addresses.length} tokens from cache. Getting ${addresses.length} on-chain.`);
        const functionParams = _(addresses)
            .map((address) => [address, this.BASES, this.amountToFlashBorrow])
            .value();
        // We use the validate function instead of batchValidate to avoid poison pill problem.
        // One token that consumes too much gas could cause the entire batch to fail.
        const multicallResult = await this.multicall2Provider.callSameFunctionOnContractWithMultipleParams({
            address: this.tokenValidatorAddress,
            contractInterface: ITokenValidator__factory.createInterface(),
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
                metric.putMetric("TokenValidatorProviderValidateFailed", 1, MetricLoggerUnit.Count);
                log.error({ result: resultWrapper }, `Failed to validate token ${token.symbol}`);
                continue;
            }
            metric.putMetric("TokenValidatorProviderValidateSuccess", 1, MetricLoggerUnit.Count);
            const validationResult = resultWrapper.result[0];
            tokenToResult[token.address.toLowerCase()] =
                validationResult;
            await this.tokenValidationCache.set(this.CACHE_KEY(token.address.toLowerCase()), tokenToResult[token.address.toLowerCase()]);
            metric.putMetric(`TokenValidatorProviderValidateCacheMissResult${validationResult}`, 1, MetricLoggerUnit.Count);
        }
        return {
            getValidationByToken: (token) => tokenToResult[token.address.toLowerCase()],
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4tdmFsaWRhdG9yLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy90b2tlbi12YWxpZGF0b3ItcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFTLG9CQUFvQixFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDaEUsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFDO0FBRXZCLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLG1EQUFtRCxDQUFDO0FBQzdGLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sU0FBUyxDQUFDO0FBTXhELE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLElBQUksR0FBRyxDQUFTO0lBQy9DLDBFQUEwRTtJQUMxRSw0Q0FBNEMsQ0FBQyxXQUFXLEVBQUU7Q0FDM0QsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFOLElBQVkscUJBSVg7QUFKRCxXQUFZLHFCQUFxQjtJQUMvQixpRUFBUSxDQUFBO0lBQ1IsK0RBQU8sQ0FBQTtJQUNQLCtEQUFPLENBQUE7QUFDVCxDQUFDLEVBSlcscUJBQXFCLEtBQXJCLHFCQUFxQixRQUloQztBQU1ELE1BQU0sdUJBQXVCLEdBQUcsNENBQTRDLENBQUM7QUFDN0UsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLENBQUM7QUFDdEMsTUFBTSxzQkFBc0IsR0FBRyxPQUFTLENBQUM7QUFzQnpDLE1BQU0sT0FBTyxzQkFBc0I7SUFLakMsWUFDWSxrQkFBc0MsRUFDeEMsb0JBQW1ELEVBQ25ELHdCQUF3Qix1QkFBdUIsRUFDL0Msa0JBQWtCLHNCQUFzQixFQUN4QyxzQkFBc0Isc0JBQXNCLEVBQzVDLFlBQVksaUJBQWlCO1FBTDNCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUFDeEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUErQjtRQUNuRCwwQkFBcUIsR0FBckIscUJBQXFCLENB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