import { useMemo, useState, useEffect } from 'react'
import { Currency } from '@uniswap/sdk-core'
import { BigNumber } from '@ethersproject/bignumber'
import { useEisenQuote, EisenQuoteParams } from './useEisenQuote'
import { useNordsternQuote, NordsternQuoteParams } from './useNordsternQuote'
import { useLiFiQuote, LiFiQuoteParams } from './useLiFiQuote'
import { useNordsternPrices } from './useNordsternPrices'
import { AggregatorType, UnifiedQuote, AggregatorQuoteResult } from './aggregatorTypes'
import { adaptEisenQuote, adaptNordsternQuote, adaptLiFiQuote, compareQuotes } from './quoteAdapters'
import { getNordsternRouterAddress } from './nordsternApiConfig'
import { FLOW_CHAIN_ID } from './mockTokenData'
import { NATIVE_CHAIN_ID } from 'constants/tokens'
import { useEisenTokens } from './useEisenTokens'
import { mockTokenToToken } from './mockTokenData'
import { wrappedNativeCurrency } from 'uniswap/src/utils/currency'
import { UniverseChainId } from 'uniswap/src/types/chains'

interface UnifiedQuoteParams {
  fromToken: Currency | null
  toToken: Currency | null
  fromAmount: string
  fromAddress: string
  chainId: number
  slippage: number
  order?: string
  includedDex?: string
  maxSplit?: number
  maxEdge?: number
  integrator?: string
  fee?: number
  referrer?: string
}

export function useUnifiedAggregatorQuote(params: UnifiedQuoteParams | null) {
  const [selectedAggregator, setSelectedAggregator] = useState<AggregatorType | null>(null)
  const { tokens: eisenTokens } = useEisenTokens(params?.chainId || FLOW_CHAIN_ID)

  const eisenParams: EisenQuoteParams | null = useMemo(() => {
    if (!params || !params.fromToken || !params.toToken) return null

    const fromAddress = params.fromToken.isNative
      ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
      : params.fromToken.address.toLowerCase()
    const toAddress = params.toToken.isNative
      ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
      : params.toToken.address.toLowerCase()

    return {
      fromAddress: params.fromAddress,
      fromChain: params.chainId,
      toChain: params.chainId,
      fromToken: fromAddress,
      toToken: toAddress,
      fromAmount: params.fromAmount,
      toAddress: params.fromAddress,
      order: params.order,
      slippage: params.slippage.toString(),
      fee: '0',
      includedDex: params.includedDex,
      maxSplit: params.maxSplit,
      maxEdge: params.maxEdge,
    }
  }, [params])

  const nordsternParams: NordsternQuoteParams | null = useMemo(() => {
    if (!params || !params.fromToken || !params.toToken) return null

    let fromAddress: string
    let toAddress: string

    if (params.fromToken.isNative) {
      try {
        const wrapped = wrappedNativeCurrency(params.chainId as UniverseChainId)
        fromAddress = wrapped.address.toLowerCase()
      } catch {
        return null
      }
    } else {
      fromAddress = params.fromToken.address.toLowerCase()
    }

    if (params.toToken.isNative) {
      try {
        const wrapped = wrappedNativeCurrency(params.chainId as UniverseChainId)
        toAddress = wrapped.address.toLowerCase()
      } catch {
        return null
      }
    } else {
      toAddress = params.toToken.address.toLowerCase()
    }

    return {
      chainId: params.chainId,
      src: fromAddress,
      dst: toAddress,
      amount: params.fromAmount,
      from: params.fromAddress,
      slippage: params.slippage * 100,
    }
  }, [params])

  const lifiParams: LiFiQuoteParams | null = useMemo(() => {
    if (!params || !params.fromToken || !params.toToken) return null

    const NATIVE_ADDRESS = '0x0000000000000000000000000000000000000000'
    
    const fromAddress = params.fromToken.isNative
      ? NATIVE_ADDRESS
      : params.fromToken.address.toLowerCase()
    
    const toAddress = params.toToken.isNative
      ? NATIVE_ADDRESS
      : params.toToken.address.toLowerCase()

    const order = params.order === 'CHEAPEST' ? 'CHEAPEST' : 'FASTEST'

    return {
      fromChain: params.chainId,
      toChain: params.chainId,
      fromToken: fromAddress,
      toToken: toAddress,
      fromAmount: params.fromAmount,
      fromAddress: params.fromAddress,
      toAddress: params.fromAddress,
      slippage: params.slippage,
      order,
      integrator: params.integrator,
      fee: params.fee,
      referrer: params.referrer,
    }
  }, [params])

  const eisenQuote = useEisenQuote(eisenParams)
  const nordsternQuote = useNordsternQuote(nordsternParams)
  const lifiQuote = useLiFiQuote(lifiParams)

  const fromTokenInfo = useMemo(() => {
    if (!params?.fromToken) return null
    if (params.fromToken.isNative) {
      try {
        const wrapped = wrappedNativeCurrency(params.chainId as UniverseChainId)
        return {
          address: wrapped.address.toLowerCase(),
          symbol: wrapped.symbol || params.fromToken.symbol || 'WFLOW',
          decimals: wrapped.decimals || params.fromToken.decimals || 18,
          name: wrapped.name || params.fromToken.name || 'Wrapped Flow',
        }
      } catch {
        return {
          address: NATIVE_CHAIN_ID,
          symbol: params.fromToken.symbol || 'FLOW',
          decimals: params.fromToken.decimals || 18,
          name: params.fromToken.name || 'Flow',
        }
      }
    }
    const token = eisenTokens.find((t) => t.address.toLowerCase() === params.fromToken?.address.toLowerCase())
    return token
      ? {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          name: token.name,
          logoURI: token.icon,
        }
      : {
          address: params.fromToken.address,
          symbol: params.fromToken.symbol || 'Unknown',
          decimals: params.fromToken.decimals || 18,
          name: params.fromToken.name || 'Unknown Token',
        }
  }, [params?.fromToken, params?.chainId, eisenTokens])

  const toTokenInfo = useMemo(() => {
    if (!params?.toToken) return null
    if (params.toToken.isNative) {
      try {
        const wrapped = wrappedNativeCurrency(params.chainId as UniverseChainId)
        return {
          address: wrapped.address.toLowerCase(),
          symbol: wrapped.symbol || params.toToken.symbol || 'WFLOW',
          decimals: wrapped.decimals || params.toToken.decimals || 18,
          name: wrapped.name || params.toToken.name || 'Wrapped Flow',
        }
      } catch {
        return {
          address: NATIVE_CHAIN_ID,
          symbol: params.toToken.symbol || 'FLOW',
          decimals: params.toToken.decimals || 18,
          name: params.toToken.name || 'Flow',
        }
      }
    }
    const token = eisenTokens.find((t) => t.address.toLowerCase() === params.toToken?.address.toLowerCase())
    return token
      ? {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          name: token.name,
          logoURI: token.icon,
        }
      : {
          address: params.toToken.address,
          symbol: params.toToken.symbol || 'Unknown',
          decimals: params.toToken.decimals || 18,
          name: params.toToken.name || 'Unknown Token',
        }
  }, [params?.toToken, params?.chainId, eisenTokens])

  const routerAddress = useMemo(() => {
    return getNordsternRouterAddress(params?.chainId || FLOW_CHAIN_ID) || ''
  }, [params?.chainId])

  const nordsternTokenAddresses = useMemo(() => {
    if (!nordsternParams) return []
    const addresses: string[] = []
    // Always include native token address for gas cost calculation
    const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    addresses.push(NATIVE_TOKEN_ADDRESS)
    if (nordsternParams.src) addresses.push(nordsternParams.src)
    if (nordsternParams.dst) addresses.push(nordsternParams.dst)
    return addresses
  }, [nordsternParams])

  const nordsternPrices = useNordsternPrices(
    params?.chainId || FLOW_CHAIN_ID,
    nordsternTokenAddresses
  )

  const unifiedQuotes = useMemo(() => {
    const quotes = new Map<AggregatorType, UnifiedQuote | null>()
    const errors = new Map<AggregatorType, string | null>()

    if (eisenQuote.quote && fromTokenInfo && toTokenInfo) {
      const adapted = adaptEisenQuote(eisenQuote.quote, fromTokenInfo, toTokenInfo)
      quotes.set(AggregatorType.EISEN, adapted)
    } else if (eisenQuote.error) {
      errors.set(AggregatorType.EISEN, eisenQuote.error)
    }

    if (nordsternQuote.quote && fromTokenInfo && toTokenInfo && routerAddress) {
      const adapted = adaptNordsternQuote(
        nordsternQuote.quote,
        fromTokenInfo,
        toTokenInfo,
        routerAddress,
        params?.slippage,
        nordsternPrices.pricesMap,
        params?.chainId
      )
      quotes.set(AggregatorType.NORDSTERN, adapted)
    } else if (nordsternQuote.error) {
      errors.set(AggregatorType.NORDSTERN, nordsternQuote.error)
    }

    if (lifiQuote.quote && fromTokenInfo && toTokenInfo) {
      const adapted = adaptLiFiQuote(lifiQuote.quote, fromTokenInfo, toTokenInfo)
      quotes.set(AggregatorType.LIFI, adapted)
    } else if (lifiQuote.error) {
      errors.set(AggregatorType.LIFI, lifiQuote.error)
    }

    return { quotes, errors }
  }, [eisenQuote.quote, eisenQuote.error, nordsternQuote.quote, nordsternQuote.error, lifiQuote.quote, lifiQuote.error, fromTokenInfo, toTokenInfo, routerAddress, params?.slippage, nordsternPrices.pricesMap])

  const bestQuote = useMemo(() => {
    const { quotes } = unifiedQuotes
    const availableQuotes = Array.from(quotes.values()).filter((q): q is UnifiedQuote => q !== null)

    if (availableQuotes.length === 0) return null
    if (availableQuotes.length === 1) return availableQuotes[0]

    return availableQuotes.reduce((best, current) => compareQuotes(best, current))
  }, [unifiedQuotes])

  const loading = eisenQuote.loading || nordsternQuote.loading || lifiQuote.loading

  // Reset selected aggregator when params change (new swap)
  useEffect(() => {
    setSelectedAggregator(null)
  }, [params?.fromToken, params?.toToken, params?.fromAmount])

  // Reset selected aggregator if it doesn't have a valid quote after loading completes
  useEffect(() => {
    if (selectedAggregator && !loading) {
      const hasQuote = unifiedQuotes.quotes.has(selectedAggregator) && unifiedQuotes.quotes.get(selectedAggregator) !== null
      if (!hasQuote) {
        // Selected aggregator failed or doesn't have a quote, reset to null to use best quote
        setSelectedAggregator(null)
      }
    }
  }, [selectedAggregator, unifiedQuotes.quotes, loading])

  const currentQuote = useMemo(() => {
    if (selectedAggregator) {
      return unifiedQuotes.quotes.get(selectedAggregator) || null
    }
    return bestQuote
  }, [selectedAggregator, unifiedQuotes.quotes, bestQuote])

  const result: AggregatorQuoteResult = useMemo(() => {
    return {
      quotes: unifiedQuotes.quotes,
      bestQuote,
      loading,
      errors: unifiedQuotes.errors,
    }
  }, [unifiedQuotes, bestQuote, loading])

  return {
    ...result,
    currentQuote,
    selectedAggregator: selectedAggregator || (bestQuote?.aggregator ?? null),
    setSelectedAggregator,
  }
}

