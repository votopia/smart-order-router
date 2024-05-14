import { Token, TokenInfo, TokenList } from "@votopia/sdk-core";
import axios from "axios";

import { log } from "../util/log";
import { metric, MetricLoggerUnit } from "../util/metric";

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

export class CachingTokenListProvider
  implements ITokenProvider, ITokenListProvider
{
  private CACHE_KEY = (tokenInfo: TokenInfo) =>
    `token-list-token/${this.tokenList.name}/${this.tokenList.timestamp}/${
      this.tokenList.version
    }/${tokenInfo.address.toLowerCase()}/${tokenInfo.decimals}/${
      tokenInfo.symbol
    }/${tokenInfo.name}`;

  private tokenList: TokenList;

  /**
   * Creates an instance of CachingTokenListProvider.
   * Token metadata (e.g. symbol and decimals) generally don't change so can be cached indefinitely.
   *
   * @param tokenList The token list to get the tokens from.
   * @param tokenCache Cache instance to hold cached tokens.
   */
  constructor(tokenList: TokenList, private tokenCache: ICache<Token>) {
    this.tokenList = tokenList;
  }

  public static async fromTokenListURI(
    tokenListURI: string,
    tokenCache: ICache<Token>
  ) {
    const now = Date.now();
    const tokenList = await this.buildTokenList(tokenListURI);

    metric.putMetric(
      "TokenListLoad",
      Date.now() - now,
      MetricLoggerUnit.Milliseconds
    );

    return new CachingTokenListProvider(tokenList, tokenCache);
  }

  private static async buildTokenList(
    tokenListURI: string
  ): Promise<TokenList> {
    log.info(`Getting tokenList from ${tokenListURI}.`);
    const response = await axios.get(tokenListURI);
    log.info(`Got tokenList from ${tokenListURI}.`);

    const { data: tokenList, status } = response;

    if (status != 200) {
      log.error(
        { response },
        `Unabled to get token list from ${tokenListURI}.`
      );

      throw new Error(`Unable to get token list from ${tokenListURI}`);
    }

    return tokenList;
  }

  public static async fromTokenList(
    tokenList: TokenList,
    tokenCache: ICache<Token>
  ) {
    const now = Date.now();

    const tokenProvider = new CachingTokenListProvider(tokenList, tokenCache);

    metric.putMetric(
      "TokenListLoad",
      Date.now() - now,
      MetricLoggerUnit.Milliseconds
    );

    return tokenProvider;
  }

  /**
   * If no addresses array is specified, all tokens in the token list are
   * returned.
   *
   * @param _addresses (optional) The token addresses to get.
   * @returns Promise<TokenAccessor> A token accessor with methods for accessing the tokens.
   */
  public async getTokens(_addresses?: string[]): Promise<TokenAccessor> {
    const addressToToken: Map<string, Token> = new Map();
    const symbolToToken: Map<string, Token> = new Map();

    const addToken = (token?: Token) => {
      if (!token) return;
      addressToToken.set(token.address.toLowerCase(), token);
      if (token.symbol !== undefined) {
        symbolToToken.set(token.symbol.toLowerCase(), token);
      }
    };

    if (_addresses) {
      for (const address of _addresses) {
        const token = await this.getTokenByAddress(address);
        addToken(token);
      }
    } else {
      const chainTokens = this.tokenList.tokens ?? [];
      for (const info of chainTokens) {
        const token = await this.buildToken(info);
        addToken(token);
      }
    }

    return {
      getTokenByAddress: (address: string) =>
        addressToToken.get(address.toLowerCase()),
      getTokenBySymbol: (symbol: string) =>
        symbolToToken.get(symbol.toLowerCase()),
      getAllTokens: (): Token[] => {
        return Array.from(addressToToken.values());
      },
    };
  }

  public async hasTokenBySymbol(_symbol: string): Promise<boolean> {
    return this.tokenList.tokens.some((t) => t.symbol === _symbol);
  }

  public async getTokenBySymbol(_symbol: string): Promise<Token | undefined> {
    let symbol = _symbol;

    // We consider ETH as a regular ERC20 Token throughout this package. We don't use the NativeCurrency object from the sdk.
    // When we build the calldata for swapping we insert wrapping/unwrapping as needed.
    if (_symbol == "ETH") {
      symbol = "WETH";
    }

    const tokenInfo = this.tokenList.tokens.find((t) => t.symbol === symbol);

    if (!tokenInfo) {
      return undefined;
    }

    const token: Token = await this.buildToken(tokenInfo);

    return token;
  }

  public async hasTokenByAddress(address: string): Promise<boolean> {
    return this.tokenList.tokens.some((t) => t.address === address);
  }

  public async getTokenByAddress(address: string): Promise<Token | undefined> {
    const tokenInfo = this.tokenList.tokens.find((t) => t.address === address);

    if (!tokenInfo) {
      return undefined;
    }

    const token: Token = await this.buildToken(tokenInfo);

    return token;
  }

  private async buildToken(tokenInfo: TokenInfo): Promise<Token> {
    const cacheKey = this.CACHE_KEY(tokenInfo);
    const cachedToken = await this.tokenCache.get(cacheKey);

    if (cachedToken) {
      return cachedToken;
    }

    const token = new Token(
      tokenInfo.address,
      tokenInfo.decimals,
      tokenInfo.symbol,
      tokenInfo.name || "",
      `https://assets.smold.app/api/token/8453/${tokenInfo.address}`
    );

    await this.tokenCache.set(cacheKey, token);

    return token;
  }
}
