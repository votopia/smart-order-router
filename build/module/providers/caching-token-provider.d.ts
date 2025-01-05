import { Token } from "@votopia/sdk-core";
import { ICache } from "./cache";
import { ITokenProvider, TokenAccessor } from "./token-provider";
export declare const CACHE_SEED_TOKENS: Token[];
/**
 * Provider for getting token metadata that falls back to a different provider
 * in the event of failure.
 *
 * @export
 * @class CachingTokenProviderWithFallback
 */
export declare class CachingTokenProviderWithFallback implements ITokenProvider {
    private tokenCache;
    protected primaryTokenProvider: ITokenProvider;
    protected fallbackTokenProvider?: ITokenProvider | undefined;
    private CACHE_KEY;
    constructor(tokenCache: ICache<Token>, primaryTokenProvider: ITokenProvider, fallbackTokenProvider?: ITokenProvider | undefined);
    getTokens(_addresses: string[]): Promise<TokenAccessor>;
}
