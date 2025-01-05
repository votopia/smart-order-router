"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unparseFeeAmount = exports.parseFeeAmount = exports.parseAmount = exports.MAX_UINT160 = exports.CurrencyAmount = void 0;
const units_1 = require("@ethersproject/units");
const sdk_core_1 = require("@votopia/sdk-core");
const jsbi_1 = __importDefault(require("jsbi"));
class CurrencyAmount extends sdk_core_1.CurrencyAmount {
}
exports.CurrencyAmount = CurrencyAmount;
exports.MAX_UINT160 = "0xffffffffffffffffffffffffffffffffffffffff";
// Try to parse a user entered amount for a given token
function parseAmount(value, currency) {
    const typedValueParsed = (0, units_1.parseUnits)(value, currency.decimals).toString();
    return CurrencyAmount.fromRawAmount(currency, jsbi_1.default.BigInt(typedValueParsed));
}
exports.parseAmount = parseAmount;
function parseFeeAmount(feeAmountStr) {
    switch (feeAmountStr) {
        case "10000":
            return sdk_core_1.FeeAmount.HIGH;
        case "3000":
            return sdk_core_1.FeeAmount.MEDIUM;
        case "500":
            return sdk_core_1.FeeAmount.LOW;
        case "100":
            return sdk_core_1.FeeAmount.LOWEST;
        default:
            throw new Error(`Fee amount ${feeAmountStr} not supported.`);
    }
}
exports.parseFeeAmount = parseFeeAmount;
function unparseFeeAmount(feeAmount) {
    switch (feeAmount) {
        case sdk_core_1.FeeAmount.HIGH:
            return "10000";
        case sdk_core_1.FeeAmount.MEDIUM:
            return "3000";
        case sdk_core_1.FeeAmount.LOW:
            return "500";
        case sdk_core_1.FeeAmount.LOWEST:
            return "100";
        default:
            throw new Error(`Fee amount ${feeAmount} not supported.`);
    }
}
exports.unparseFeeAmount = unparseFeeAmount;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW1vdW50cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsL2Ftb3VudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsZ0RBQWtEO0FBQ2xELGdEQUkyQjtBQUUzQixnREFBd0I7QUFFeEIsTUFBYSxjQUFlLFNBQVEseUJBQTJCO0NBQUc7QUFBbEUsd0NBQWtFO0FBRXJELFFBQUEsV0FBVyxHQUFHLDRDQUE0QyxDQUFDO0FBRXhFLHVEQUF1RDtBQUN2RCxTQUFnQixXQUFXLENBQUMsS0FBYSxFQUFFLFFBQWtCO0lBQzNELE1BQU0sZ0JBQWdCLEdBQUcsSUFBQSxrQkFBVSxFQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDekUsT0FBTyxjQUFjLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxjQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztBQUMvRSxDQUFDO0FBSEQsa0NBR0M7QUFFRCxTQUFnQixjQUFjLENBQUMsWUFBb0I7SUFDakQsUUFBUSxZQUFZLEVBQUU7UUFDcEIsS0FBSyxPQUFPO1lBQ1YsT0FBTyxvQkFBUyxDQUFDLElBQUksQ0FBQztRQUN4QixLQUFLLE1BQU07WUFDVCxPQUFPLG9CQUFTLENBQUMsTUFBTSxDQUFDO1FBQzFCLEtBQUssS0FBSztZQUNSLE9BQU8sb0JBQVMsQ0FBQyxHQUFHLENBQUM7UUFDdkIsS0FBSyxLQUFLO1lBQ1IsT0FBTyxvQkFBUyxDQUFDLE1BQU0sQ0FBQztRQUMxQjtZQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMsY0FBYyxZQUFZLGlCQUFpQixDQUFDLENBQUM7S0FDaEU7QUFDSCxDQUFDO0FBYkQsd0NBYUM7QUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxTQUFvQjtJQUNuRCxRQUFRLFNBQVMsRUFBRTtRQUNqQixLQUFLLG9CQUFTLENBQUMsSUFBSTtZQUNqQixPQUFPLE9BQU8sQ0FBQztRQUNqQixLQUFLLG9CQUFTLENBQUMsTUFBTTtZQUNuQixPQUFPLE1BQU0sQ0FBQztRQUNoQixLQUFLLG9CQUFTLENBQUMsR0FBRztZQUNoQixPQUFPLEtBQUssQ0FBQztRQUNmLEtBQUssb0JBQVMsQ0FBQyxNQUFNO1lBQ25CLE9BQU8sS0FBSyxDQUFDO1FBQ2Y7WUFDRSxNQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsU0FBUyxpQkFBaUIsQ0FBQyxDQUFDO0tBQzdEO0FBQ0gsQ0FBQztBQWJELDRDQWFDIn0=