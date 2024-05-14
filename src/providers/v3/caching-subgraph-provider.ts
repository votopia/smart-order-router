import { ICache } from "./../cache";
import { IV3SubgraphProvider, V3SubgraphPool } from "./subgraph-provider";

/**
 * Provider for getting V3 pools, with functionality for caching the results.
 *
 * @export
 * @class CachingV3SubgraphProvider
 */
export class CachingV3SubgraphProvider implements IV3SubgraphProvider {
  private SUBGRAPH_KEY = () => `subgraph-pools`;

  /**
   * Creates an instance of CachingV3SubgraphProvider.
   * @param subgraphProvider The provider to use to get the subgraph pools when not in the cache.
   * @param cache Cache instance to hold cached pools.
   */
  constructor(
    protected subgraphProvider: IV3SubgraphProvider,
    private cache: ICache<V3SubgraphPool[]>
  ) {}

  public async getPools(): Promise<V3SubgraphPool[]> {
    const cachedPools = await this.cache.get(this.SUBGRAPH_KEY());

    if (cachedPools) {
      return cachedPools;
    }

    const pools = await this.subgraphProvider.getPools();

    await this.cache.set(this.SUBGRAPH_KEY(), pools);

    return pools;
  }
}
