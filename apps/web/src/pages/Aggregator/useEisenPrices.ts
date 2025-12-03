import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { FLOW_CHAIN_ID } from './mockTokenData'
import { EISEN_API_ENDPOINTS, EISEN_API_HEADERS } from './eisenApiConfig'

export interface TokenPrice {
  address: string
  name: string
  symbol: string
  price: string
}

interface EisenPricesResponse {
  result: {
    [chainId: string]: TokenPrice[]
  }
}

/**
 * Fetches token prices from Eisen API with caching
 * @param chainId - Chain ID to filter prices (defaults to Flow Mainnet)
 */
export function useEisenPrices(chainId: number = FLOW_CHAIN_ID) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['eisenPrices', chainId],
    queryFn: async () => {
      try {
        const response = await fetch(`${EISEN_API_ENDPOINTS.PRICES}?chainId=${chainId}`, {
          headers: EISEN_API_HEADERS,
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch prices: ${response.statusText}`)
        }

        const data: EisenPricesResponse = await response.json()
        return data.result?.[chainId.toString()] || []
      } catch (err) {
        console.error('Error fetching prices from Eisen API:', err)
        return []
      }
    },
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    enabled: !!chainId,
    refetchInterval: false,
  })

  const pricesMap = useMemo(() => {
    const map = new Map<string, TokenPrice>()
    const prices = data || []
    prices.forEach((tokenPrice) => {
      map.set(tokenPrice.address.toLowerCase(), tokenPrice)
    })
    return map
  }, [data])

  return {
    prices: data || [],
    pricesMap,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch prices') : null,
    refetch,
  }
}

