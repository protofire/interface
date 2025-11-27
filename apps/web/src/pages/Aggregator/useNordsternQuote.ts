import { useState, useEffect } from 'react'
import { NORDSTERN_API_ENDPOINTS } from './nordsternApiConfig'
import { FLOW_CHAIN_ID } from './mockTokenData'

interface NordsternQuoteParams {
  chainId: number
  src: string
  dst: string
  amount: string
  from: string
  slippage: number
}

interface NordsternSwap {
  amountIn: string
  gasUnits: number
  hops: number
  route: Array<{
    pool: string
    tokenIn: string
    tokenOut: string
    type: string
  }>
}

interface NordsternQuoteResponse {
  dst: string
  fromAmount: string
  src: string
  swaps: NordsternSwap[]
  toAmount: string
  tx: {
    data: string
    from: string
    to: string
    value: string
  }
}

async function parseNordsternError(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json()
      const message = errorData?.message || errorData?.error || ''
      if (message.toLowerCase().includes('no swap path') || message.toLowerCase().includes('insufficient')) {
        return 'No swap path found'
      }
      return message || 'Failed to fetch quote'
    } else {
      const text = await response.text()
      if (text.toLowerCase().includes('src and dst')) {
        return 'Invalid token addresses'
      }
      return text || `Failed to fetch quote: ${response.statusText}`
    }
  } catch (parseError) {
    console.warn('Nordstern error response:', parseError)
    return `Failed to fetch quote: ${response.statusText}`
  }
}

export function useNordsternQuote(params: NordsternQuoteParams | null) {
  const [quote, setQuote] = useState<NordsternQuoteResponse | null>(null)
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
          src: params.src,
          dst: params.dst,
          amount: params.amount,
          from: params.from,
          slippage: params.slippage.toString(),
        })

        const url = `${NORDSTERN_API_ENDPOINTS.QUOTE(params.chainId)}?${searchParams.toString()}`

        const response = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
        })

        if (!response.ok) {
          const errorMessage = await parseNordsternError(response)
          throw new Error(errorMessage)
        }

        const data: NordsternQuoteResponse = await response.json()
        setQuote(data)
      } catch (err) {
        console.error('Error fetching quote from Nordstern API:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch quote')
        setQuote(null)
      } finally {
        setLoading(false)
      }
    }

    fetchQuote()
  }, [
    params?.chainId,
    params?.src,
    params?.dst,
    params?.amount,
    params?.from,
    params?.slippage,
  ])

  return {
    quote,
    loading,
    error,
  }
}

