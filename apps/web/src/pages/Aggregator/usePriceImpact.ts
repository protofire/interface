import { useMemo, useEffect } from 'react';
import { Percent } from '@uniswap/sdk-core';
import { BigNumber } from '@ethersproject/bignumber';
import { useEisenPrices } from './useEisenPrices';
import { FLOW_CHAIN_ID } from './mockTokenData';
import { BIPS_BASE } from 'constants/misc';

const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

// TODO: fix impact calculation
export function usePriceImpact(
  quote: any,
  quoteLoading: boolean,
  chainId: number = FLOW_CHAIN_ID
): Percent | undefined {
  const { pricesMap, loading, refetch } = useEisenPrices(chainId);

  // Refetch prices when quote finishes loading
  useEffect(() => {
    if (!quoteLoading && quote?.result?.estimate) {
      refetch()
    }
  }, [quoteLoading, quote?.result?.estimate, refetch])

  return useMemo(() => {
    if (!quote?.result?.estimate || loading) return undefined;

    const { estimate } = quote.result;
    const { action } = quote.result;
    const fromToken = action?.fromToken;
    const toToken = action?.toToken;

    if (!fromToken || !toToken || !estimate.fromAmount || !estimate.toAmount) {
      return undefined;
    }

    const fromTokenPrice =
      parseFloat(pricesMap.get(fromToken.address?.toLowerCase())?.price ??
        pricesMap.get(NATIVE_TOKEN_ADDRESS)?.price ?? '0');
    const toTokenPrice =
      parseFloat(pricesMap.get(toToken.address?.toLowerCase())?.price ?? '0');

    if (isNaN(fromTokenPrice) || fromTokenPrice <= 0 || isNaN(toTokenPrice) || toTokenPrice <= 0) {
      return undefined;
    }

    const marginalRate = fromTokenPrice / toTokenPrice;

    const fromAmountBN = BigNumber.from(estimate.fromAmount);
    const toAmountBN = BigNumber.from(estimate.toAmount);

    const fromDecimals = fromToken.decimals || 18;
    const toDecimals = toToken.decimals || 18;

    const fromAmount = Number(fromAmountBN) / (10 ** fromDecimals);
    const toAmount = Number(toAmountBN) / (10 ** toDecimals);

    if (fromAmount <= 0 || toAmount <= 0) return undefined;

    const realizedRate = toAmount / fromAmount;
    const priceImpactRatio = 1 - (realizedRate / marginalRate);

    const numerator = Math.floor(priceImpactRatio * BIPS_BASE);
    return new Percent(numerator, BIPS_BASE);

  }, [quote, pricesMap, loading, chainId, quoteLoading]);
}
