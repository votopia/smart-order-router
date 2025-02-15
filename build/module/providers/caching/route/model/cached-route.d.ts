import { Token, Protocol } from "@votopia/sdk-core";
import { V3Route } from "../../../../routers";
interface CachedRouteParams<Route extends V3Route> {
    route: Route;
    percent: number;
}
/**
 * Class defining the route to cache
 *
 * @export
 * @class CachedRoute
 */
export declare class CachedRoute<Route extends V3Route> {
    readonly route: Route;
    readonly percent: number;
    private hashCode;
    /**
     * @param route
     * @param percent
     */
    constructor({ route, percent }: CachedRouteParams<Route>);
    get protocol(): Protocol;
    get tokenIn(): Token;
    get tokenOut(): Token;
    get routePath(): string;
    get routeId(): number;
}
export {};
