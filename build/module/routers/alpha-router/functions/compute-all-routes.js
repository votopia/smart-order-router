import { log } from "../../../util/log";
import { poolToString, routeToString } from "../../../util/routes";
import { V3Route } from "../../router";
export function computeAllV3Routes(tokenIn, tokenOut, pools, maxHops) {
    return computeAllRoutes(tokenIn, tokenOut, (route, tokenIn, tokenOut) => {
        return new V3Route(route, tokenIn, tokenOut);
    }, pools, maxHops);
}
export function computeAllRoutes(tokenIn, tokenOut, buildRoute, pools, maxHops) {
    var _a;
    const poolsUsed = Array(pools.length).fill(false);
    const routes = [];
    const computeRoutes = (tokenIn, tokenOut, currentRoute, poolsUsed, tokensVisited, _previousTokenOut) => {
        if (currentRoute.length > maxHops) {
            return;
        }
        if (currentRoute.length > 0 &&
            currentRoute[currentRoute.length - 1].involvesToken(tokenOut)) {
            routes.push(buildRoute([...currentRoute], tokenIn, tokenOut));
            return;
        }
        for (let i = 0; i < pools.length; i++) {
            if (poolsUsed[i]) {
                continue;
            }
            const curPool = pools[i];
            const previousTokenOut = _previousTokenOut ? _previousTokenOut : tokenIn;
            if (!curPool.involvesToken(previousTokenOut)) {
                continue;
            }
            const currentTokenOut = curPool.token0.equals(previousTokenOut)
                ? curPool.token1
                : curPool.token0;
            if (tokensVisited.has(currentTokenOut.address.toLowerCase())) {
                continue;
            }
            tokensVisited.add(currentTokenOut.address.toLowerCase());
            currentRoute.push(curPool);
            poolsUsed[i] = true;
            computeRoutes(tokenIn, tokenOut, currentRoute, poolsUsed, tokensVisited, currentTokenOut);
            poolsUsed[i] = false;
            currentRoute.pop();
            tokensVisited.delete(currentTokenOut.address.toLowerCase());
        }
    };
    computeRoutes(tokenIn, tokenOut, [], poolsUsed, new Set([tokenIn.address.toLowerCase()]));
    log.info({
        routes: routes.map(routeToString),
        pools: pools.map(poolToString),
    }, `Computed ${routes.length} possible routes for type ${(_a = routes[0]) === null || _a === void 0 ? void 0 : _a.protocol}.`);
    return routes;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcHV0ZS1hbGwtcm91dGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3JvdXRlcnMvYWxwaGEtcm91dGVyL2Z1bmN0aW9ucy9jb21wdXRlLWFsbC1yb3V0ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3hDLE9BQU8sRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbkUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUV2QyxNQUFNLFVBQVUsa0JBQWtCLENBQ2hDLE9BQWMsRUFDZCxRQUFlLEVBQ2YsS0FBYSxFQUNiLE9BQWU7SUFFZixPQUFPLGdCQUFnQixDQUNyQixPQUFPLEVBQ1AsUUFBUSxFQUNSLENBQUMsS0FBYSxFQUFFLE9BQWMsRUFBRSxRQUFlLEVBQUUsRUFBRTtRQUNqRCxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDL0MsQ0FBQyxFQUNELEtBQUssRUFDTCxPQUFPLENBQ1IsQ0FBQztBQUNKLENBQUM7QUFFRCxNQUFNLFVBQVUsZ0JBQWdCLENBQzlCLE9BQWMsRUFDZCxRQUFlLEVBQ2YsVUFBdUUsRUFDdkUsS0FBYyxFQUNkLE9BQWU7O0lBRWYsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFVLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDM0QsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO0lBRTVCLE1BQU0sYUFBYSxHQUFHLENBQ3BCLE9BQWMsRUFDZCxRQUFlLEVBQ2YsWUFBcUIsRUFDckIsU0FBb0IsRUFDcEIsYUFBMEIsRUFDMUIsaUJBQXlCLEVBQ3pCLEVBQUU7UUFDRixJQUFJLFlBQVksQ0FBQyxNQUFNLEdBQUcsT0FBTyxFQUFFO1lBQ2pDLE9BQU87U0FDUjtRQUVELElBQ0UsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDO1lBQ3ZCLFlBQVksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBRSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFDOUQ7WUFDQSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDOUQsT0FBTztTQUNSO1FBRUQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDckMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hCLFNBQVM7YUFDVjtZQUVELE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUUsQ0FBQztZQUMxQixNQUFNLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1lBRXpFLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7Z0JBQzVDLFNBQVM7YUFDVjtZQUVELE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDO2dCQUM3RCxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU07Z0JBQ2hCLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBRW5CLElBQUksYUFBYSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUU7Z0JBQzVELFNBQVM7YUFDVjtZQUVELGFBQWEsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0IsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNwQixhQUFhLENBQ1gsT0FBTyxFQUNQLFFBQVEsRUFDUixZQUFZLEVBQ1osU0FBUyxFQUNULGFBQWEsRUFDYixlQUFlLENBQ2hCLENBQUM7WUFDRixTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNuQixhQUFhLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztTQUM3RDtJQUNILENBQUMsQ0FBQztJQUVGLGFBQWEsQ0FDWCxPQUFPLEVBQ1AsUUFBUSxFQUNSLEVBQUUsRUFDRixTQUFTLEVBQ1QsSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FDekMsQ0FBQztJQUVGLEdBQUcsQ0FBQyxJQUFJLENBQ047UUFDRSxNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7UUFDakMsS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDO0tBQy9CLEVBQ0QsWUFBWSxNQUFNLENBQUMsTUFBTSw2QkFBNkIsTUFBQSxNQUFNLENBQUMsQ0FBQyxDQUFDLDBDQUFFLFFBQVEsR0FBRyxDQUM3RSxDQUFDO0lBRUYsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyJ9