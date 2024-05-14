import {
  FeeAmount,
  Token,
  TradeType,
  Protocol,
  WRAPPED_NATIVE_TOKEN,
} from "@votopia/sdk-core";
import _ from "lodash";

import { ITokenListProvider } from "../../../providers";
import { ITokenProvider, USDC_BASE } from "../../../providers/token-provider";

import {
  IV3PoolProvider,
  V3PoolAccessor,
} from "../../../providers/v3/pool-provider";
import {
  IV3SubgraphProvider,
  V3SubgraphPool,
} from "../../../providers/v3/subgraph-provider";
import { unparseFeeAmount } from "../../../util";
import { parseFeeAmount } from "../../../util/amounts";
import { log } from "../../../util/log";
import { metric, MetricLoggerUnit } from "../../../util/metric";
import { AlphaRouterConfig } from "../alpha-router";

export type PoolId = { id: string };
export type CandidatePoolsBySelectionCriteria = {
  protocol: Protocol;
  selections: CandidatePoolsSelections;
};

/// Utility type for allowing us to use `keyof CandidatePoolsSelections` to map
export type CandidatePoolsSelections = {
  topByBaseWithTokenIn: PoolId[];
  topByBaseWithTokenOut: PoolId[];
  topByDirectSwapPool: PoolId[];
  topByEthQuoteTokenPool: PoolId[];
  topByTVL: PoolId[];
  topByTVLUsingTokenIn: PoolId[];
  topByTVLUsingTokenOut: PoolId[];
  topByTVLUsingTokenInSecondHops: PoolId[];
  topByTVLUsingTokenOutSecondHops: PoolId[];
};

export type V3GetCandidatePoolsParams = {
  tokenIn: Token;
  tokenOut: Token;
  routeType: TradeType;
  routingConfig: AlphaRouterConfig;
  subgraphProvider: IV3SubgraphProvider;
  tokenProvider: ITokenProvider;
  poolProvider: IV3PoolProvider;
  blockedTokenListProvider?: ITokenListProvider;
};

const baseTokensByChain = [USDC_BASE];

export type V3CandidatePools = {
  poolAccessor: V3PoolAccessor;
  candidatePools: CandidatePoolsBySelectionCriteria;
  subgraphPools: V3SubgraphPool[];
};

export async function getV3CandidatePools({
  tokenIn,
  tokenOut,
  routeType,
  routingConfig,
  subgraphProvider,
  tokenProvider,
  poolProvider,
  blockedTokenListProvider,
}: V3GetCandidatePoolsParams): Promise<V3CandidatePools> {
  const {
    blockNumber,
    v3PoolSelection: {
      topN,
      topNDirectSwaps,
      topNTokenInOut,
      topNSecondHop,
      topNSecondHopForTokenAddress,
      topNWithEachBaseToken,
      topNWithBaseToken,
    },
  } = routingConfig;
  const tokenInAddress = tokenIn.address.toLowerCase();
  const tokenOutAddress = tokenOut.address.toLowerCase();

  const beforeSubgraphPools = Date.now();

  const allPools = await subgraphProvider.getPools(tokenIn, tokenOut, {
    blockNumber,
  });

  log.info(
    { samplePools: allPools.slice(0, 3) },
    "Got all pools from V3 subgraph provider"
  );

  // Although this is less of an optimization than the V2 equivalent,
  // save some time copying objects by mutating the underlying pool directly.
  for (const pool of allPools) {
    pool.token0.id = pool.token0.id.toLowerCase();
    pool.token1.id = pool.token1.id.toLowerCase();
  }

  metric.putMetric(
    "V3SubgraphPoolsLoad",
    Date.now() - beforeSubgraphPools,
    MetricLoggerUnit.Milliseconds
  );

  const beforePoolsFiltered = Date.now();

  // Only consider pools where neither tokens are in the blocked token list.
  let filteredPools: V3SubgraphPool[] = allPools;
  if (blockedTokenListProvider) {
    filteredPools = [];
    for (const pool of allPools) {
      const token0InBlocklist =
        await blockedTokenListProvider.hasTokenByAddress(pool.token0.id);
      const token1InBlocklist =
        await blockedTokenListProvider.hasTokenByAddress(pool.token1.id);

      if (token0InBlocklist || token1InBlocklist) {
        continue;
      }

      filteredPools.push(pool);
    }
  }

  // Sort by tvlUSD in descending order
  const subgraphPoolsSorted = filteredPools.sort((a, b) => b.tvlUSD - a.tvlUSD);

  log.info(
    `After filtering blocked tokens went from ${allPools.length} to ${subgraphPoolsSorted.length}.`
  );

  const poolAddressesSoFar = new Set<string>();
  const addToAddressSet = (pools: V3SubgraphPool[]) => {
    _(pools)
      .map((pool) => pool.id)
      .forEach((poolAddress) => poolAddressesSoFar.add(poolAddress));
  };

  const baseTokens = baseTokensByChain ?? [];

  const topByBaseWithTokenIn = _(baseTokens)
    .flatMap((token: Token) => {
      return _(subgraphPoolsSorted)
        .filter((subgraphPool) => {
          const tokenAddress = token.address.toLowerCase();
          return (
            (subgraphPool.token0.id == tokenAddress &&
              subgraphPool.token1.id == tokenInAddress) ||
            (subgraphPool.token1.id == tokenAddress &&
              subgraphPool.token0.id == tokenInAddress)
          );
        })
        .sortBy((tokenListPool) => -tokenListPool.tvlUSD)
        .slice(0, topNWithEachBaseToken)
        .value();
    })
    .sortBy((tokenListPool) => -tokenListPool.tvlUSD)
    .slice(0, topNWithBaseToken)
    .value();

  const topByBaseWithTokenOut = _(baseTokens)
    .flatMap((token: Token) => {
      return _(subgraphPoolsSorted)
        .filter((subgraphPool) => {
          const tokenAddress = token.address.toLowerCase();
          return (
            (subgraphPool.token0.id == tokenAddress &&
              subgraphPool.token1.id == tokenOutAddress) ||
            (subgraphPool.token1.id == tokenAddress &&
              subgraphPool.token0.id == tokenOutAddress)
          );
        })
        .sortBy((tokenListPool) => -tokenListPool.tvlUSD)
        .slice(0, topNWithEachBaseToken)
        .value();
    })
    .sortBy((tokenListPool) => -tokenListPool.tvlUSD)
    .slice(0, topNWithBaseToken)
    .value();

  let top2DirectSwapPool = _(subgraphPoolsSorted)
    .filter((subgraphPool) => {
      return (
        !poolAddressesSoFar.has(subgraphPool.id) &&
        ((subgraphPool.token0.id == tokenInAddress &&
          subgraphPool.token1.id == tokenOutAddress) ||
          (subgraphPool.token1.id == tokenInAddress &&
            subgraphPool.token0.id == tokenOutAddress))
      );
    })
    .slice(0, topNDirectSwaps)
    .value();

  if (top2DirectSwapPool.length == 0 && topNDirectSwaps > 0) {
    // If we requested direct swap pools but did not find any in the subgraph query.
    // Optimistically add them into the query regardless. Invalid pools ones will be dropped anyway
    // when we query the pool on-chain. Ensures that new pools for new pairs can be swapped on immediately.
    top2DirectSwapPool = _.map(
      [FeeAmount.HIGH, FeeAmount.MEDIUM, FeeAmount.LOW, FeeAmount.LOWEST],
      (feeAmount) => {
        const { token0, token1, poolAddress } = poolProvider.getPoolAddress(
          tokenIn,
          tokenOut,
          feeAmount
        );
        return {
          id: poolAddress,
          feeTier: unparseFeeAmount(feeAmount),
          liquidity: "10000",
          token0: {
            id: token0.address,
          },
          token1: {
            id: token1.address,
          },
          tvlETH: 10000,
          tvlUSD: 10000,
        };
      }
    );
  }

  addToAddressSet(top2DirectSwapPool);

  const wrappedNativeAddress = WRAPPED_NATIVE_TOKEN.address.toLowerCase();

  // Main reason we need this is for gas estimates, only needed if token out is not native.
  // We don't check the seen address set because if we've already added pools for getting native quotes
  // theres no need to add more.
  let top2EthQuoteTokenPool: V3SubgraphPool[] = [];
  if (
    tokenOut.symbol != "WETH" &&
    tokenOut.symbol != "WETH9" &&
    tokenOut.symbol != "ETH"
  ) {
    top2EthQuoteTokenPool = _(subgraphPoolsSorted)
      .filter((subgraphPool) => {
        if (routeType == TradeType.EXACT_INPUT) {
          return (
            (subgraphPool.token0.id == wrappedNativeAddress &&
              subgraphPool.token1.id == tokenOutAddress) ||
            (subgraphPool.token1.id == wrappedNativeAddress &&
              subgraphPool.token0.id == tokenOutAddress)
          );
        } else {
          return (
            (subgraphPool.token0.id == wrappedNativeAddress &&
              subgraphPool.token1.id == tokenInAddress) ||
            (subgraphPool.token1.id == wrappedNativeAddress &&
              subgraphPool.token0.id == tokenInAddress)
          );
        }
      })
      .slice(0, 1)
      .value();
  }

  addToAddressSet(top2EthQuoteTokenPool);

  const topByTVL = _(subgraphPoolsSorted)
    .filter((subgraphPool) => {
      return !poolAddressesSoFar.has(subgraphPool.id);
    })
    .slice(0, topN)
    .value();

  addToAddressSet(topByTVL);

  const topByTVLUsingTokenIn = _(subgraphPoolsSorted)
    .filter((subgraphPool) => {
      return (
        !poolAddressesSoFar.has(subgraphPool.id) &&
        (subgraphPool.token0.id == tokenInAddress ||
          subgraphPool.token1.id == tokenInAddress)
      );
    })
    .slice(0, topNTokenInOut)
    .value();

  addToAddressSet(topByTVLUsingTokenIn);

  const topByTVLUsingTokenOut = _(subgraphPoolsSorted)
    .filter((subgraphPool) => {
      return (
        !poolAddressesSoFar.has(subgraphPool.id) &&
        (subgraphPool.token0.id == tokenOutAddress ||
          subgraphPool.token1.id == tokenOutAddress)
      );
    })
    .slice(0, topNTokenInOut)
    .value();

  addToAddressSet(topByTVLUsingTokenOut);

  const topByTVLUsingTokenInSecondHops = _(topByTVLUsingTokenIn)
    .map((subgraphPool) => {
      return tokenInAddress == subgraphPool.token0.id
        ? subgraphPool.token1.id
        : subgraphPool.token0.id;
    })
    .flatMap((secondHopId: string) => {
      return _(subgraphPoolsSorted)
        .filter((subgraphPool) => {
          return (
            !poolAddressesSoFar.has(subgraphPool.id) &&
            (subgraphPool.token0.id == secondHopId ||
              subgraphPool.token1.id == secondHopId)
          );
        })
        .slice(
          0,
          topNSecondHopForTokenAddress?.get(secondHopId) ?? topNSecondHop
        )
        .value();
    })
    .uniqBy((pool) => pool.id)
    .value();

  addToAddressSet(topByTVLUsingTokenInSecondHops);

  const topByTVLUsingTokenOutSecondHops = _(topByTVLUsingTokenOut)
    .map((subgraphPool) => {
      return tokenOutAddress == subgraphPool.token0.id
        ? subgraphPool.token1.id
        : subgraphPool.token0.id;
    })
    .flatMap((secondHopId: string) => {
      return _(subgraphPoolsSorted)
        .filter((subgraphPool) => {
          return (
            !poolAddressesSoFar.has(subgraphPool.id) &&
            (subgraphPool.token0.id == secondHopId ||
              subgraphPool.token1.id == secondHopId)
          );
        })
        .slice(
          0,
          topNSecondHopForTokenAddress?.get(secondHopId) ?? topNSecondHop
        )
        .value();
    })
    .uniqBy((pool) => pool.id)
    .value();

  addToAddressSet(topByTVLUsingTokenOutSecondHops);

  const subgraphPools = _([
    ...topByBaseWithTokenIn,
    ...topByBaseWithTokenOut,
    ...top2DirectSwapPool,
    ...top2EthQuoteTokenPool,
    ...topByTVL,
    ...topByTVLUsingTokenIn,
    ...topByTVLUsingTokenOut,
    ...topByTVLUsingTokenInSecondHops,
    ...topByTVLUsingTokenOutSecondHops,
  ])
    .compact()
    .uniqBy((pool) => pool.id)
    .value();

  const tokenAddresses = _(subgraphPools)
    .flatMap((subgraphPool) => [subgraphPool.token0.id, subgraphPool.token1.id])
    .compact()
    .uniq()
    .value();

  log.info(
    `Getting the ${tokenAddresses.length} tokens within the ${subgraphPools.length} V3 pools we are considering`
  );

  const tokenAccessor = await tokenProvider.getTokens(tokenAddresses, {
    blockNumber,
  });

  const printV3SubgraphPool = (s: V3SubgraphPool) =>
    `${tokenAccessor.getTokenByAddress(s.token0.id)?.symbol ?? s.token0.id}/${
      tokenAccessor.getTokenByAddress(s.token1.id)?.symbol ?? s.token1.id
    }/${s.feeTier}`;

  log.info(
    {
      topByBaseWithTokenIn: topByBaseWithTokenIn.map(printV3SubgraphPool),
      topByBaseWithTokenOut: topByBaseWithTokenOut.map(printV3SubgraphPool),
      topByTVL: topByTVL.map(printV3SubgraphPool),
      topByTVLUsingTokenIn: topByTVLUsingTokenIn.map(printV3SubgraphPool),
      topByTVLUsingTokenOut: topByTVLUsingTokenOut.map(printV3SubgraphPool),
      topByTVLUsingTokenInSecondHops:
        topByTVLUsingTokenInSecondHops.map(printV3SubgraphPool),
      topByTVLUsingTokenOutSecondHops:
        topByTVLUsingTokenOutSecondHops.map(printV3SubgraphPool),
      top2DirectSwap: top2DirectSwapPool.map(printV3SubgraphPool),
      top2EthQuotePool: top2EthQuoteTokenPool.map(printV3SubgraphPool),
    },
    `V3 Candidate Pools`
  );

  const tokenPairsRaw = _.map<
    V3SubgraphPool,
    [Token, Token, FeeAmount] | undefined
  >(subgraphPools, (subgraphPool) => {
    const tokenA = tokenAccessor.getTokenByAddress(subgraphPool.token0.id);
    const tokenB = tokenAccessor.getTokenByAddress(subgraphPool.token1.id);
    let fee: FeeAmount;
    try {
      fee = parseFeeAmount(subgraphPool.feeTier);
    } catch (err) {
      log.info(
        { subgraphPool },
        `Dropping candidate pool for ${subgraphPool.token0.id}/${subgraphPool.token1.id}/${subgraphPool.feeTier} because fee tier not supported`
      );
      return undefined;
    }

    if (!tokenA || !tokenB) {
      log.info(
        `Dropping candidate pool for ${subgraphPool.token0.id}/${
          subgraphPool.token1.id
        }/${fee} because ${
          tokenA ? subgraphPool.token1.id : subgraphPool.token0.id
        } not found by token provider`
      );
      return undefined;
    }

    return [tokenA, tokenB, fee];
  });

  const tokenPairs = _.compact(tokenPairsRaw);

  metric.putMetric(
    "V3PoolsFilterLoad",
    Date.now() - beforePoolsFiltered,
    MetricLoggerUnit.Milliseconds
  );

  const beforePoolsLoad = Date.now();

  const poolAccessor = await poolProvider.getPools(tokenPairs, {
    blockNumber,
  });

  metric.putMetric(
    "V3PoolsLoad",
    Date.now() - beforePoolsLoad,
    MetricLoggerUnit.Milliseconds
  );

  const poolsBySelection: CandidatePoolsBySelectionCriteria = {
    protocol: Protocol.V3,
    selections: {
      topByBaseWithTokenIn,
      topByBaseWithTokenOut,
      topByDirectSwapPool: top2DirectSwapPool,
      topByEthQuoteTokenPool: top2EthQuoteTokenPool,
      topByTVL,
      topByTVLUsingTokenIn,
      topByTVLUsingTokenOut,
      topByTVLUsingTokenInSecondHops,
      topByTVLUsingTokenOutSecondHops,
    },
  };

  return { poolAccessor, candidatePools: poolsBySelection, subgraphPools };
}
