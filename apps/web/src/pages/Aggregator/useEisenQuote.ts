import { useState, useEffect } from 'react'
import { EISEN_API_ENDPOINTS, EISEN_API_HEADERS } from './eisenApiConfig'

interface EisenQuoteParams {
  fromAddress: string
  fromChain: number
  toChain: number
  fromToken: string
  toToken: string
  fromAmount: string
  toAddress: string
  order?: string
  integrator?: string
  fee?: string
  slippage?: string
  referrer?: string
  includedDex?: string
  maxSplit?: number
  maxEdge?: number
}

async function parseQuoteError(response: Response): Promise<string> {
  try {
    const errorData = await response.json()
    const message = errorData?.message?.toLowerCase() || ''
    if (message.includes('no swap path found')) {
      return 'No swap path found'
    }
  } catch (parseError) {
    console.warn('Quote error response:', parseError)
  }
  return 'Failed to fetch quote'
}

interface EisenQuoteResponse {
  result: {
    type: string
    id: string
    tool: string
    toolDetails: {
      key: string
      name: string
      logoURI: string
    }
    action: {
      fromToken: {
        address: string
        chainId: number
        symbol: string
        decimals: number
        name: string
        coinKey: string
        logoURI: string
        priceUSD: string
      }
      fromAmount: string
      toToken: {
        address: string
        chainId: number
        symbol: string
        decimals: number
        name: string
        coinKey: string
        logoURI: string
        priceUSD: string
      }
      fromChainId: number
      toChainId: number
      slippage: number
      fromAddress: string
      toAddress: string
    }
    estimate: {
      tool: string
      approvalAddress: string
      toAmountMin: string
      toAmount: string
      fromAmount: string
      gasCosts: Array<{
        type: string
        price: string
        estimate: string
        limit: string
        amount: string
        amountUSD: string
        token: {
          address: string
          chainId: number
          symbol: string
          decimals: number
          name: string
          coinKey: string
          logoURI: string
          priceUSD: string
        }
      }>
      executionDuration: number
      fromAmountUSD: string
      toAmountUSD: string
    }
    includedSteps: Array<any>
    integrator: string
    transactionRequest: {
      value: string
      to: string
      data: string
      chainId: number
      gasPrice: string
      gasLimit: string
      from: string
    }
  }
}

/**
 * Fetches a quote from Eisen API
 */
export function useEisenQuote(params: EisenQuoteParams | null) {
  const [quote, setQuote] = useState<EisenQuoteResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuote = async () => {
      if (!params) {
        setQuote(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        // Build query params manually to avoid URLSearchParams double encoding issues
        const queryParts: string[] = [
          `fromAddress=${encodeURIComponent(params.fromAddress)}`,
          `fromChain=${params.fromChain}`,
          `toChain=${params.toChain}`,
          `fromToken=${encodeURIComponent(params.fromToken)}`,
          `toToken=${encodeURIComponent(params.toToken)}`,
          `fromAmount=${encodeURIComponent(params.fromAmount)}`,
          `toAddress=${encodeURIComponent(params.toAddress)}`,
        ]
        
        // Add optional parameters only if provided
        if (params.order) {
          queryParts.push(`order=${params.order}`)
        }
        if (params.integrator) {
          queryParts.push(`integrator=${encodeURIComponent(params.integrator)}`)
        }
        // Fee must always be specified (default to 0)
        if (params.fee !== undefined) {
          queryParts.push(`fee=${params.fee}`)
        }
        if (params.slippage) {
          queryParts.push(`slippage=${params.slippage}`)
        }
        if (params.referrer) {
          queryParts.push(`referrer=${encodeURIComponent(params.referrer)}`)
        }
        if (params.includedDex) {
          queryParts.push(`includedDex=${encodeURIComponent(params.includedDex)}`)
        }
        if (params.maxSplit) {
          queryParts.push(`maxSplit=${params.maxSplit}`)
        }
        if (params.maxEdge) {
          queryParts.push(`maxEdge=${params.maxEdge}`)
        }

        const queryString = queryParts.join('&')

        const response = await fetch(`${EISEN_API_ENDPOINTS.QUOTE}?${queryString}`, {
          headers: EISEN_API_HEADERS,
        })

        if (!response.ok) {
          const errorMessage = await parseQuoteError(response)
          throw new Error(errorMessage)
        }

        const data = await response.json()
        setQuote(data)
      } catch (err) {
        console.error('Error fetching quote from Eisen API:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch quote')
        setQuote(null)
      } finally {
        setLoading(false)
      }
    }

    fetchQuote()
  }, [
    params?.fromAddress,
    params?.fromChain,
    params?.toChain,
    params?.fromToken,
    params?.toToken,
    params?.fromAmount,
    params?.toAddress,
    params?.order,
    params?.slippage,
    params?.fee,
    params?.integrator,
    params?.maxSplit,
    params?.maxEdge,
    params?.includedDex,
  ])

  return {
    quote,
    loading,
    error,
  }
}

