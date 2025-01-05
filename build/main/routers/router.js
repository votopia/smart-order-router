"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ISwapToRatio = exports.IRouter = exports.SwapType = exports.SwapToRatioStatus = exports.V3Route = void 0;
const sdk_core_1 = require("@votopia/sdk-core");
class V3Route extends sdk_core_1.RouteSDK {
    constructor() {
        super(...arguments);
        this.protocol = sdk_core_1.Protocol.V3;
    }
}
exports.V3Route = V3Route;
var SwapToRatioStatus;
(function (SwapToRatioStatus) {
    SwapToRatioStatus[SwapToRatioStatus["SUCCESS"] = 1] = "SUCCESS";
    SwapToRatioStatus[SwapToRatioStatus["NO_ROUTE_FOUND"] = 2] = "NO_ROUTE_FOUND";
    SwapToRatioStatus[SwapToRatioStatus["NO_SWAP_NEEDED"] = 3] = "NO_SWAP_NEEDED";
})(SwapToRatioStatus = exports.SwapToRatioStatus || (exports.SwapToRatioStatus = {}));
var SwapType;
(function (SwapType) {
    SwapType[SwapType["UNIVERSAL_ROUTER"] = 0] = "UNIVERSAL_ROUTER";
    SwapType[SwapType["SWAP_ROUTER_02"] = 1] = "SWAP_ROUTER_02";
})(SwapType = exports.SwapType || (exports.SwapType = {}));
/**
 * Provides functionality for finding optimal swap routes on the Uniswap protocol.
 *
 * @export
 * @abstract
 * @class IRouter
 */
class IRouter {
}
exports.IRouter = IRouter;
class ISwapToRatio {
}
exports.ISwapToRatio = ISwapToRatio;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3JvdXRlcnMvcm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGdEQWEyQjtBQVEzQixNQUFhLE9BQVEsU0FBUSxtQkFBd0I7SUFBckQ7O1FBQ0UsYUFBUSxHQUFnQixtQkFBUSxDQUFDLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0NBQUE7QUFGRCwwQkFFQztBQWlGRCxJQUFZLGlCQUlYO0FBSkQsV0FBWSxpQkFBaUI7SUFDM0IsK0RBQVcsQ0FBQTtJQUNYLDZFQUFrQixDQUFBO0lBQ2xCLDZFQUFrQixDQUFBO0FBQ3BCLENBQUMsRUFKVyxpQkFBaUIsR0FBakIseUJBQWlCLEtBQWpCLHlCQUFpQixRQUk1QjtBQXFCRCxJQUFZLFFBR1g7QUFIRCxXQUFZLFFBQVE7SUFDbEIsK0RBQWdCLENBQUE7SUFDaEIsMkRBQWMsQ0FBQTtBQUNoQixDQUFDLEVBSFcsUUFBUSxHQUFSLGdCQUFRLEtBQVIsZ0JBQVEsUUFHbkI7QUFvREQ7Ozs7OztHQU1HO0FBQ0gsTUFBc0IsT0FBTztDQW9CNUI7QUFwQkQsMEJBb0JDO0FBRUQsTUFBc0IsWUFBWTtDQVNqQztBQVRELG9DQVNDIn0=