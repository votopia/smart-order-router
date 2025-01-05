/**
 * Provider for getting token data from a Token List.
 *
 * @export
 * @interface IRouteCachingProvider
 */
import { TradeType, } from "@votopia/sdk-core";
import { CacheMode } from "./model";
/**
 * Abstract class for a RouteCachingProvider.
 * Defines the base methods of how to interact with this interface, but not the implementation of how to cache.
 */
export class IRouteCachingProvider {
    constructor() {
        /**
         * Final implementation of the public `getCachedRoute` method, this is how code will interact with the implementation
         *
         * @public
         * @readonly
         * @param amount
         * @param quoteToken
         * @param tradeType
         * @param protocols
         * @param blockNumber
         */
        this.getCachedRoute = async (amount, quoteToken, tradeType, protocols, blockNumber, optimistic = false) => {
            if ((await this.getCacheMode(amount, quoteToken, tradeType, protocols)) ==
                CacheMode.Darkmode) {
                return undefined;
            }
            const cachedRoute = await this._getCachedRoute(amount, quoteToken, tradeType, protocols, blockNumber, optimistic);
            return this.filterExpiredCachedRoutes(cachedRoute, blockNumber, optimistic);
        };
        /**
         * Final implementation of the public `setCachedRoute` method.
         * This method will set the blockToLive in the CachedRoutes object before calling the internal method to insert in cache.
         *
         * @public
         * @readonly
         * @param cachedRoutes The route to cache.
         * @returns Promise<boolean> Indicates if the route was inserted into cache.
         */
        this.setCachedRoute = async (
        // Defined as a readonly member instead of a regular function to make it final.
        cachedRoutes, amount) => {
            if ((await this.getCacheModeFromCachedRoutes(cachedRoutes, amount)) ==
                CacheMode.Darkmode) {
                return false;
            }
            cachedRoutes.blocksToLive = await this._getBlocksToLive(cachedRoutes, amount);
            return this._setCachedRoute(cachedRoutes, amount);
        };
    }
    /**
     * Returns the CacheMode for the given cachedRoutes and amount
     *
     * @param cachedRoutes
     * @param amount
     */
    getCacheModeFromCachedRoutes(cachedRoutes, amount) {
        const quoteToken = cachedRoutes.tradeType == TradeType.EXACT_INPUT
            ? cachedRoutes.tokenOut
            : cachedRoutes.tokenIn;
        return this.getCacheMode(amount, quoteToken, cachedRoutes.tradeType, cachedRoutes.protocolsCovered);
    }
    filterExpiredCachedRoutes(cachedRoutes, blockNumber, optimistic) {
        return (cachedRoutes === null || cachedRoutes === void 0 ? void 0 : cachedRoutes.notExpired(blockNumber, optimistic))
            ? cachedRoutes
            : undefined;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtY2FjaGluZy1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9wcm92aWRlcnMvY2FjaGluZy9yb3V0ZS9yb3V0ZS1jYWNoaW5nLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztHQUtHO0FBQ0gsT0FBTyxFQUlMLFNBQVMsR0FFVixNQUFNLG1CQUFtQixDQUFDO0FBRTNCLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFHcEM7OztHQUdHO0FBQ0gsTUFBTSxPQUFnQixxQkFBcUI7SUFBM0M7UUFDRTs7Ozs7Ozs7OztXQVVHO1FBQ2EsbUJBQWMsR0FBRyxLQUFLLEVBQ3BDLE1BQWdDLEVBQ2hDLFVBQWlCLEVBQ2pCLFNBQW9CLEVBQ3BCLFNBQXFCLEVBQ3JCLFdBQW1CLEVBQ25CLFVBQVUsR0FBRyxLQUFLLEVBQ2lCLEVBQUU7WUFDckMsSUFDRSxDQUFDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDbkUsU0FBUyxDQUFDLFFBQVEsRUFDbEI7Z0JBQ0EsT0FBTyxTQUFTLENBQUM7YUFDbEI7WUFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQzVDLE1BQU0sRUFDTixVQUFVLEVBQ1YsU0FBUyxFQUNULFNBQVMsRUFDVCxXQUFXLEVBQ1gsVUFBVSxDQUNYLENBQUM7WUFFRixPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzlFLENBQUMsQ0FBQztRQUVGOzs7Ozs7OztXQVFHO1FBQ2EsbUJBQWMsR0FBRyxLQUFLO1FBQ3BDLCtFQUErRTtRQUMvRSxZQUEwQixFQUMxQixNQUFnQyxFQUNkLEVBQUU7WUFDcEIsSUFDRSxDQUFDLE1BQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDL0QsU0FBUyxDQUFDLFFBQVEsRUFDbEI7Z0JBQ0EsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUVELFlBQVksQ0FBQyxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQ3JELFlBQVksRUFDWixNQUFNLENBQ1AsQ0FBQztZQUVGLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDO0lBaUdKLENBQUM7SUEvRkM7Ozs7O09BS0c7SUFDSSw0QkFBNEIsQ0FDakMsWUFBMEIsRUFDMUIsTUFBZ0M7UUFFaEMsTUFBTSxVQUFVLEdBQ2QsWUFBWSxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsV0FBVztZQUM3QyxDQUFDLENBQUMsWUFBWSxDQUFDLFFBQVE7WUFDdkIsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUM7UUFFM0IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUN0QixNQUFNLEVBQ04sVUFBVSxFQUNWLFlBQVksQ0FBQyxTQUFTLEVBQ3RCLFlBQVksQ0FBQyxnQkFBZ0IsQ0FDOUIsQ0FBQztJQUNKLENBQUM7SUFtQlMseUJBQXlCLENBQ2pDLFlBQXNDLEVBQ3RDLFdBQW1CLEVBQ25CLFVBQW1CO1FBRW5CLE9BQU8sQ0FBQSxZQUFZLGFBQVosWUFBWSx1QkFBWixZQUFZLENBQUUsVUFBVSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUM7WUFDdEQsQ0FBQyxDQUFDLFlBQVk7WUFDZCxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ2hCLENBQUM7Q0ErQ0YifQ==