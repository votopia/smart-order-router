"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachingV3SubgraphProvider = void 0;
/**
 * Provider for getting V3 pools, with functionality for caching the results.
 *
 * @export
 * @class CachingV3SubgraphProvider
 */
class CachingV3SubgraphProvider {
    /**
     * Creates an instance of CachingV3SubgraphProvider.
     * @param subgraphProvider The provider to use to get the subgraph pools when not in the cache.
     * @param cache Cache instance to hold cached pools.
     */
    constructor(subgraphProvider, cache) {
        this.subgraphProvider = subgraphProvider;
        this.cache = cache;
        this.SUBGRAPH_KEY = () => `subgraph-pools`;
    }
    async getPools() {
        const cachedPools = await this.cache.get(this.SUBGRAPH_KEY());
        if (cachedPools) {
            return cachedPools;
        }
        const pools = await this.subgraphProvider.getPools();
        await this.cache.set(this.SUBGRAPH_KEY(), pools);
        return pools;
    }
}
exports.CachingV3SubgraphProvider = CachingV3SubgraphProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGluZy1zdWJncmFwaC1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9wcm92aWRlcnMvdjMvY2FjaGluZy1zdWJncmFwaC1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQTs7Ozs7R0FLRztBQUNILE1BQWEseUJBQXlCO0lBR3BDOzs7O09BSUc7SUFDSCxZQUNZLGdCQUFxQyxFQUN2QyxLQUErQjtRQUQ3QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQXFCO1FBQ3ZDLFVBQUssR0FBTCxLQUFLLENBQTBCO1FBVGpDLGlCQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUM7SUFVM0MsQ0FBQztJQUVHLEtBQUssQ0FBQyxRQUFRO1FBQ25CLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7UUFFOUQsSUFBSSxXQUFXLEVBQUU7WUFDZixPQUFPLFdBQVcsQ0FBQztTQUNwQjtRQUVELE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRXJELE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRWpELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztDQUNGO0FBMUJELDhEQTBCQyJ9