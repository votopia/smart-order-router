import { Token, TokenList } from "@votopia/sdk-core";
import { ICache } from "./cache";
import { ITokenProvider, TokenAccessor } from "./token-provider";
/**
 * Provider for getting token data from a Token List.
 *
 * @export
 * @interface ITokenListProvider
 */
export interface ITokenListProvider {
    hasTokenBySymbol(_symbol: string): Promise<boolean>;
    getTokenBySymbol(_symbol: string): Promise<Token | undefined>;
    hasTokenByAddress(address: string): Promise<boolean>;
    getTokenByAddress(address: string): Promise<Token | undefined>;
}
export declare class CachingTokenListProvider implements ITokenProvider, ITokenListProvider {
    private tokenCache;
    private CACHE_KEY;
    private tokenList;
    /**
     * Creates an instance of CachingTokenListProvider.
     * Token metadata (e.g. symbol and decimals) generally don't change so can be cached indefinitely.
     *
     * @param tokenList The token list to get the tokens from.
     * @param tokenCache Cache instance to hold cached tokens.
     */
    constructor(tokenList: TokenList, tokenCache: ICache<Token>);
    static fromTokenListURI(tokenListURI: string, tokenCache: ICache<Token>): Promise<CachingTokenListProvider>;
    private static buildTokenList;
    static fromTokenList(tokenList: TokenList, tokenCache: ICache<Token>): Promise<CachingTokenListProvider>;
    /**
     * If no addresses array is specified, all tokens in the token list are
     * returned.
     *
     * @param _addresses (optional) The token addresses to get.
     * @returns Promise<TokenAccessor> A token accessor with methods for accessing the tokens.
     */
    getTokens(_addresses?: string[]): Promise<TokenAccessor>;
    hasTokenBySymbol(_symbol: string): Promise<boolean>;
    getTokenBySymbol(_symbol: string): Promise<Token | undefined>;
    hasTokenByAddress(address: string): Promise<boolean>;
    getTokenByAddress(address: string): Promise<Token | undefined>;
    private buildToken;
}
