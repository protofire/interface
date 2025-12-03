import { useState, useEffect } from 'react'
import { LIFI_API_ENDPOINTS, LIFI_API_HEADERS } from './lifiApiConfig'
import { FLOW_CHAIN_ID } from './mockTokenData'

interface LiFiQuoteParams {
  fromChain: number
  toChain: number
  fromToken: string
  toToken: string
  fromAmount: string
  fromAddress: string
  toAddress?: string
  slippage: number
  order?: 'FASTEST' | 'CHEAPEST'
  integrator?: string
  fee?: number
  referrer?: string
}

interface LiFiQuoteResponse {
  id: string
  type: string
  tool: string
  toolDetails: {
    key: string
    logoURI: string
    name: string
  }
  action: {
    fromChainId: number
    toChainId: number
    fromToken: {
      address: string
      symbol: string
      decimals: number
      chainId: number
      name: string
      coinKey: string
      priceUSD: string
      logoURI: string
    }
    toToken: {
      address: string
      symbol: string
      decimals: number
      chainId: number
      name: string
      coinKey: string
      logoURI: string
    }
    fromAmount: string
    slippage: number
    fromAddress: string
    toAddress: string
  }
  estimate: {
    fromAmount: string
    toAmount: string
    toAmountMin: string
    approvalAddress: string
    feeCosts: Array<any>
    gasCosts: Array<{
      type: string
      price: string
      estimate: string
      limit: string
      amount: string
      amountUSD: string
      token: {
        address: string
        symbol: string
        decimals: number
        chainId: number
        name: string
        coinKey: string
        priceUSD: string
        logoURI: string
      }
    }>
  }
  transactionRequest: {
    from: string
    to: string
    chainId: number
    data: string
    value: string
    gasPrice: string
    gasLimit: string
  }
  includedSteps: Array<any>
}

async function parseLiFiError(response: Response): Promise<string> {
  try {
    // Log the error for debugging but always return user-friendly message
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json()
      console.warn('LiFi API error:', errorData)
    }
    // Always return user-friendly message for any error
    return 'No quote found'
  } catch (parseError) {
    console.warn('LiFi error response:', parseError)
    return 'No quote found'
  }
}

export function useLiFiQuote(params: LiFiQuoteParams | null) {
  const [quote, setQuote] = useState<LiFiQuoteResponse | null>(null)
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
        const searchParams = new URLSearchParams({
          fromChain: params.fromChain.toString(),
          toChain: params.toChain.toString(),
          fromToken: params.fromToken,
          toToken: params.toToken,
          fromAmount: params.fromAmount,
          fromAddress: params.fromAddress,
          slippage: params.slippage.toString(),
        })

        if (params.toAddress) {
          searchParams.set('toAddress', params.toAddress)
        }
        if (params.order) {
          searchParams.set('order', params.order)
        }
        if (params.integrator) {
          searchParams.set('integrator', params.integrator)
        }
        if (params.fee !== undefined) {
          searchParams.set('fee', params.fee.toString())
        }
        if (params.referrer) {
          searchParams.set('referrer', params.referrer)
        }

        const url = `${LIFI_API_ENDPOINTS.QUOTE}?${searchParams.toString()}`

        const response = await fetch(url, {
          method: 'GET',
          headers: LIFI_API_HEADERS,
        })

        if (!response.ok) {
          const errorMessage = await parseLiFiError(response)
          throw new Error(errorMessage)
        }

        const data: LiFiQuoteResponse = await response.json()
        setQuote(data)
      } catch (err) {
        console.error('Error fetching quote from LiFi API:', err)
        // Always show user-friendly message for any error
        setError('No quote found')
        setQuote(null)
      } finally {
        setLoading(false)
      }
    }

    fetchQuote()
  }, [
    params?.fromChain,
    params?.toChain,
    params?.fromToken,
    params?.toToken,
    params?.fromAmount,
    params?.fromAddress,
    params?.toAddress,
    params?.slippage,
    params?.order,
    params?.integrator,
    params?.fee,
    params?.referrer,
  ])

  return {
    quote,
    loading,
    error,
  }
}

