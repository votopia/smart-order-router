"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IRouteCachingProvider = void 0;
/**
 * Provider for getting token data from a Token List.
 *
 * @export
 * @interface IRouteCachingProvider
 */
const sdk_core_1 = require("@votopia/sdk-core");
const model_1 = require("./model");
/**
 * Abstract class for a RouteCachingProvider.
 * Defines the base methods of how to interact with this interface, but not the implementation of how to cache.
 */
class IRouteCachingProvider {
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
                model_1.CacheMode.Darkmode) {
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
                model_1.CacheMode.Darkmode) {
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
        const quoteToken = cachedRoutes.tradeType == sdk_core_1.TradeType.EXACT_INPUT
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
exports.IRouteCachingProvider = IRouteCachingProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtY2FjaGluZy1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9wcm92aWRlcnMvY2FjaGluZy9yb3V0ZS9yb3V0ZS1jYWNoaW5nLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7OztHQUtHO0FBQ0gsZ0RBTTJCO0FBRTNCLG1DQUFvQztBQUdwQzs7O0dBR0c7QUFDSCxNQUFzQixxQkFBcUI7SUFBM0M7UUFDRTs7Ozs7Ozs7OztXQVVHO1FBQ2EsbUJBQWMsR0FBRyxLQUFLLEVBQ3BDLE1BQWdDLEVBQ2hDLFVBQWlCLEVBQ2pCLFNBQW9CLEVBQ3BCLFNBQXFCLEVBQ3JCLFdBQW1CLEVBQ25CLFVBQVUsR0FBRyxLQUFLLEVBQ2lCLEVBQUU7WUFDckMsSUFDRSxDQUFDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDbkUsaUJBQVMsQ0FBQyxRQUFRLEVBQ2xCO2dCQUNBLE9BQU8sU0FBUyxDQUFDO2FBQ2xCO1lBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUM1QyxNQUFNLEVBQ04sVUFBVSxFQUNWLFNBQVMsRUFDVCxTQUFTLEVBQ1QsV0FBVyxFQUNYLFVBQVUsQ0FDWCxDQUFDO1lBRUYsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM5RSxDQUFDLENBQUM7UUFFRjs7Ozs7Ozs7V0FRRztRQUNhLG1CQUFjLEdBQUcsS0FBSztRQUNwQywrRUFBK0U7UUFDL0UsWUFBMEIsRUFDMUIsTUFBZ0MsRUFDZCxFQUFFO1lBQ3BCLElBQ0UsQ0FBQyxNQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQy9ELGlCQUFTLENBQUMsUUFBUSxFQUNsQjtnQkFDQSxPQUFPLEtBQUssQ0FBQzthQUNkO1lBRUQsWUFBWSxDQUFDLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FDckQsWUFBWSxFQUNaLE1BQU0sQ0FDUCxDQUFDO1lBRUYsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNwRCxDQUFDLENBQUM7SUFpR0osQ0FBQztJQS9GQzs7Ozs7T0FLRztJQUNJLDRCQUE0QixDQUNqQyxZQUEwQixFQUMxQixNQUFnQztRQUVoQyxNQUFNLFVBQVUsR0FDZCxZQUFZLENBQUMsU0FBUyxJQUFJLG9CQUFTLENBQUMsV0FBVztZQUM3QyxDQUFDLENBQUMsWUFBWSxDQUFDLFFBQVE7WUFDdkIsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUM7UUFFM0IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUN0QixNQUFNLEVBQ04sVUFBVSxFQUNWLFlBQVksQ0FBQyxTQUFTLEVBQ3RCLFlBQVksQ0FBQyxnQkFBZ0IsQ0FDOUIsQ0FBQztJQUNKLENBQUM7SUFtQlMseUJBQXlCLENBQ2pDLFlBQXNDLEVBQ3RDLFdBQW1CLEVBQ25CLFVBQW1CO1FBRW5CLE9BQU8sQ0FBQSxZQUFZLGFBQVosWUFBWSx1QkFBWixZQUFZLENBQUUsVUFBVSxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUM7WUFDdEQsQ0FBQyxDQUFDLFlBQVk7WUFDZCxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ2hCLENBQUM7Q0ErQ0Y7QUFuS0Qsc0RBbUtDIn0=