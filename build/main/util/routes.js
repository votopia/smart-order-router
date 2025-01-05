"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolToString = exports.routeAmountToString = exports.routeAmountsToString = exports.routeToString = void 0;
const sdk_core_1 = require("@votopia/sdk-core");
const lodash_1 = __importDefault(require("lodash"));
const _1 = require(".");
const routeToString = (route) => {
    const routeStr = [];
    const tokens = route.protocol === sdk_core_1.Protocol.V3 ? route.tokenPath : undefined;
    const tokenPath = lodash_1.default.map(tokens, (token) => `${token.symbol}`);
    const pools = route.protocol === sdk_core_1.Protocol.V3 ? route.pools : undefined;
    const poolFeePath = lodash_1.default.map(pools, (pool) => {
        return `${pool instanceof sdk_core_1.Pool
            ? ` -- ${pool.fee / 10000}% [${sdk_core_1.Pool.getAddress(pool.token0, pool.token1, pool.fee, undefined, sdk_core_1.FACTORY_ADDRESS)}]`
            : ` -- []`} --> `;
    });
    for (let i = 0; i < tokenPath.length; i++) {
        routeStr.push(tokenPath[i]);
        if (i < poolFeePath.length) {
            routeStr.push(poolFeePath[i]);
        }
    }
    return routeStr.join("");
};
exports.routeToString = routeToString;
const routeAmountsToString = (routeAmounts) => {
    const total = lodash_1.default.reduce(routeAmounts, (total, cur) => {
        return total.add(cur.amount);
    }, _1.CurrencyAmount.fromRawAmount(routeAmounts[0].amount.currency, 0));
    const routeStrings = lodash_1.default.map(routeAmounts, ({ protocol, route, amount }) => {
        const portion = amount.divide(total);
        const percent = new sdk_core_1.Percent(portion.numerator, portion.denominator);
        /// @dev special case for MIXED routes we want to show user friendly V2+V3 instead
        return `[${protocol}] ${percent.toFixed(2)}% = ${(0, exports.routeToString)(route)}`;
    });
    return lodash_1.default.join(routeStrings, ", ");
};
exports.routeAmountsToString = routeAmountsToString;
const routeAmountToString = (routeAmount) => {
    const { route, amount } = routeAmount;
    return `${amount.toExact()} = ${(0, exports.routeToString)(route)}`;
};
exports.routeAmountToString = routeAmountToString;
const poolToString = (p) => {
    return `${p.token0.symbol}/${p.token1.symbol}${p instanceof sdk_core_1.Pool ? `/${p.fee / 10000}%` : ``}`;
};
exports.poolToString = poolToString;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWwvcm91dGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGdEQUE2RTtBQUU3RSxvREFBdUI7QUFLdkIsd0JBQW1DO0FBRTVCLE1BQU0sYUFBYSxHQUFHLENBQUMsS0FBYyxFQUFVLEVBQUU7SUFDdEQsTUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxRQUFRLEtBQUssbUJBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUM1RSxNQUFNLFNBQVMsR0FBRyxnQkFBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDOUQsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLFFBQVEsS0FBSyxtQkFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ3ZFLE1BQU0sV0FBVyxHQUFHLGdCQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ3hDLE9BQU8sR0FDTCxJQUFJLFlBQVksZUFBSTtZQUNsQixDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssTUFBTSxlQUFJLENBQUMsVUFBVSxDQUMxQyxJQUFJLENBQUMsTUFBTSxFQUNYLElBQUksQ0FBQyxNQUFNLEVBQ1gsSUFBSSxDQUFDLEdBQUcsRUFDUixTQUFTLEVBQ1QsMEJBQWUsQ0FDaEIsR0FBRztZQUNOLENBQUMsQ0FBQyxRQUNOLE9BQU8sQ0FBQztJQUNWLENBQUMsQ0FBQyxDQUFDO0lBRUgsS0FBSyxJQUFJLENBQUMsR0FB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