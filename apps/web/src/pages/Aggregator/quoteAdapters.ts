import { AggregatorType, UnifiedQuote } from './aggregatorTypes'
import { BigNumber } from '@ethersproject/bignumber'

export function adaptEisenQuote(eisenQuote: any, fromToken: any, toToken: any): UnifiedQuote | null {
  if (!eisenQuote?.result?.estimate || !eisenQuote?.result?.transactionRequest) {
    return null
  }

  const estimate = eisenQuote.result.estimate
  const txRequest = eisenQuote.result.transactionRequest
  const action = eisenQuote.result.action
  const gasCost = estimate.gasCosts?.[0]

  return {
    aggregator: AggregatorType.EISEN,
    toAmount: estimate.toAmount,
    fromAmount: estimate.fromAmount || action.fromAmount,
    toAmountMin: estimate.toAmountMin,
    routerAddress: txRequest.to,
    transactionRequest: {
      to: txRequest.to,
      data: txRequest.data,
      value: txRequest.value,
      gasPrice: txRequest.gasPrice,
      gasLimit: txRequest.gasLimit,
    },
    gasCost: gasCost
      ? {
          amount: gasCost.amount,
          amountUSD: gasCost.amountUSD,
          token: {
            address: gasCost.token.address,
            symbol: gasCost.token.symbol,
            decimals: gasCost.token.decimals,
          },
        }
      : undefined,
    fromToken: {
      address: action.fromToken.address,
      symbol: action.fromToken.symbol,
      decimals: action.fromToken.decimals,
      name: action.fromToken.name,
      logoURI: action.fromToken.logoURI,
    },
    toToken: {
      address: action.toToken.address,
      symbol: action.toToken.symbol,
      decimals: action.toToken.decimals,
      name: action.toToken.name,
      logoURI: action.toToken.logoURI,
    },
    fromAmountUSD: estimate.fromAmountUSD,
    toAmountUSD: estimate.toAmountUSD,
    rawQuote: eisenQuote,
  }
}

export function adaptNordsternQuote(
  nordsternQuote: any,
  fromToken: any,
  toToken: any,
  routerAddress: string,
  slippage?: number
): UnifiedQuote | null {
  if (!nordsternQuote?.tx || !nordsternQuote?.toAmount) {
    return null
  }

  const totalGasUnits = nordsternQuote.swaps?.reduce((sum: number, swap: any) => sum + (swap.gasUnits || 0), 0) || 0

  const toAmountBN = BigNumber.from(nordsternQuote.toAmount)
  const slippageBN = slippage ? BigNumber.from(Math.floor(slippage * 10000)) : BigNumber.from(0)
  const slippageMultiplier = BigNumber.from(10000).sub(slippageBN)
  const toAmountMin = toAmountBN.mul(slippageMultiplier).div(10000).toString()

  return {
    aggregator: AggregatorType.NORDSTERN,
    toAmount: nordsternQuote.toAmount,
    fromAmount: nordsternQuote.fromAmount,
    toAmountMin,
    routerAddress: nordsternQuote.tx?.to || routerAddress,
    transactionRequest: {
      to: nordsternQuote.tx.to,
      data: nordsternQuote.tx.data,
      value: nordsternQuote.tx.value || '0',
    },
    gasCost: totalGasUnits > 0 && fromToken
      ? {
          amount: BigNumber.from(totalGasUnits).toString(),
          amountUSD: '0',
          token: {
            address: fromToken.address,
            symbol: fromToken.symbol,
            decimals: fromToken.decimals,
          },
        }
      : undefined,
    fromToken: {
      address: nordsternQuote.src,
      symbol: fromToken?.symbol || 'Unknown',
      decimals: fromToken?.decimals || 18,
      name: fromToken?.name || 'Unknown Token',
      logoURI: fromToken?.logoURI,
    },
    toToken: {
      address: nordsternQuote.dst,
      symbol: toToken?.symbol || 'Unknown',
      decimals: toToken?.decimals || 18,
      name: toToken?.name || 'Unknown Token',
      logoURI: toToken?.logoURI,
    },
    rawQuote: nordsternQuote,
  }
}

export function compareQuotes(quote1: UnifiedQuote, quote2: UnifiedQuote): UnifiedQuote {
  const amount1 = BigNumber.from(quote1.toAmount)
  const amount2 = BigNumber.from(quote2.toAmount)

  if (amount1.gt(amount2)) {
    return quote1
  } else if (amount2.gt(amount1)) {
    return quote2
  }

  return quote1
}

