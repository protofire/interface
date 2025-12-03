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
  slippage?: number,
  pricesMap?: Map<string, number>,
  chainId?: number
): UnifiedQuote | null {
  if (!nordsternQuote?.tx || !nordsternQuote?.toAmount) {
    return null
  }

  const totalGasUnits = nordsternQuote.swaps?.reduce((sum: number, swap: any) => sum + (swap.gasUnits || 0), 0) || 0

  const safeBigNumberFrom = (value: string | number): BigNumber => {
    if (typeof value === 'number') {
      if (!Number.isInteger(value)) {
        return BigNumber.from(Math.floor(value))
      }
      return BigNumber.from(value.toString())
    }
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && !Number.isInteger(numValue)) {
      return BigNumber.from(Math.floor(numValue).toString())
    }
    return BigNumber.from(value)
  }

  const toAmountBN = safeBigNumberFrom(nordsternQuote.toAmount)
  const slippageBN = slippage ? BigNumber.from(Math.floor(slippage * 10000)) : BigNumber.from(0)
  const slippageMultiplier = BigNumber.from(10000).sub(slippageBN)
  const toAmountMin = toAmountBN.mul(slippageMultiplier).div(10000).toString()

  const fromTokenAddress = nordsternQuote.src.toLowerCase()
  const toTokenAddress = nordsternQuote.dst.toLowerCase()
  const fromTokenPrice = pricesMap?.get(fromTokenAddress)
  const toTokenPrice = pricesMap?.get(toTokenAddress)

  // Gas is always paid in native token (FLOW)
  const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
  const nativeTokenPrice = pricesMap?.get(NATIVE_TOKEN_ADDRESS)
  const NATIVE_TOKEN_DECIMALS = 18
  const NATIVE_TOKEN_SYMBOL = 'FLOW'
  
  // Default gas price for Flow chain (1 gwei = 10^9 wei)
  // This is a reasonable default - can be adjusted based on actual Flow gas prices
  const DEFAULT_GAS_PRICE_GWEI = 1
  const DEFAULT_GAS_PRICE_WEI = BigNumber.from(10).pow(9).mul(DEFAULT_GAS_PRICE_GWEI)

  let fromAmountUSD: string | undefined
  let toAmountUSD: string | undefined

  if (fromTokenPrice && fromToken) {
    try {
      const fromAmountBN = safeBigNumberFrom(nordsternQuote.fromAmount)
      const fromAmountDecimal = Number(fromAmountBN) / Math.pow(10, fromToken.decimals || 18)
      fromAmountUSD = (fromAmountDecimal * fromTokenPrice).toFixed(6)
    } catch {
      fromAmountUSD = undefined
    }
  }

  if (toTokenPrice && toToken) {
    try {
      const toAmountDecimal = Number(toAmountBN) / Math.pow(10, toToken.decimals || 18)
      toAmountUSD = (toAmountDecimal * toTokenPrice).toFixed(6)
    } catch {
      toAmountUSD = undefined
    }
  }

  // Calculate gas cost: gasUnits * gasPrice = total cost in wei
  let gasCostAmountWei: BigNumber | null = null
  let gasCostAmountUSD: string | undefined = undefined
  
  if (totalGasUnits > 0) {
    try {
      const gasUnitsBN = safeBigNumberFrom(totalGasUnits)
      // Calculate total cost in wei: gasUnits * gasPrice
      gasCostAmountWei = gasUnitsBN.mul(DEFAULT_GAS_PRICE_WEI)
      
      // Calculate USD value if we have native token price
      if (nativeTokenPrice) {
        // Convert wei to FLOW: divide by 10^18
        const gasCostInFLOW = Number(gasCostAmountWei) / Math.pow(10, NATIVE_TOKEN_DECIMALS)
        // Multiply by FLOW price to get USD
        gasCostAmountUSD = (gasCostInFLOW * nativeTokenPrice).toFixed(6)
      }
    } catch (error) {
      console.warn('Error calculating gas cost:', error)
    }
  }

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
    gasCost: gasCostAmountWei
      ? {
          amount: gasCostAmountWei.toString(),
          amountUSD: gasCostAmountUSD || '0',
          token: {
            address: NATIVE_TOKEN_ADDRESS,
            symbol: NATIVE_TOKEN_SYMBOL,
            decimals: NATIVE_TOKEN_DECIMALS,
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
    fromAmountUSD,
    toAmountUSD,
    rawQuote: nordsternQuote,
  }
}

export function adaptLiFiQuote(lifiQuote: any, fromToken: any, toToken: any): UnifiedQuote | null {
  if (!lifiQuote?.estimate || !lifiQuote?.transactionRequest) {
    return null
  }

  const estimate = lifiQuote.estimate
  const txRequest = lifiQuote.transactionRequest
  const action = lifiQuote.action
  const gasCost = estimate.gasCosts?.[0]

  return {
    aggregator: AggregatorType.LIFI,
    toAmount: estimate.toAmount,
    fromAmount: estimate.fromAmount || action.fromAmount,
    toAmountMin: estimate.toAmountMin,
    routerAddress: estimate.approvalAddress || txRequest.to,
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
    rawQuote: lifiQuote,
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

