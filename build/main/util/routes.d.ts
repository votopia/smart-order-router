import { Pool } from "@votopia/sdk-core";
import { RouteWithValidQuote } from "../routers/alpha-router";
import { V3Route } from "../routers/router";
export declare const routeToString: (route: V3Route) => string;
export declare const routeAmountsToString: (routeAmounts: RouteWithValidQuote[]) => string;
export declare const routeAmountToString: (routeAmount: RouteWithValidQuote) => string;
export declare const poolToString: (p: Pool) => string;
