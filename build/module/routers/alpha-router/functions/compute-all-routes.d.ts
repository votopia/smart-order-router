import { Token, Pool } from "@votopia/sdk-core";
import { V3Route } from "../../router";
export declare function computeAllV3Routes(tokenIn: Token, tokenOut: Token, pools: Pool[], maxHops: number): V3Route[];
export declare function computeAllRoutes<TPool extends Pool, TRoute extends V3Route>(tokenIn: Token, tokenOut: Token, buildRoute: (route: TPool[], tokenIn: Token, tokenOut: Token) => TRoute, pools: TPool[], maxHops: number): TRoute[];
