import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { NORDSTERN_API_ENDPOINTS } from './nordsternApiConfig'
import { FLOW_CHAIN_ID } from './mockTokenData'

interface NordsternPricesResponse {
  [tokenAddress: string]: number
}

export function useNordsternPrices(chainId: number, tokenAddresses: string[]) {
  const tokenList = useMemo(() => {
    return tokenAddresses.filter(Boolean).join(',')
  }, [tokenAddresses])

  const { data, isLoading, error } = useQuery({
    queryKey: ['nordsternPrices', chainId, tokenList],
    queryFn: async () => {
      if (!tokenList) return {}

      try {
        const response = await fetch(`${NORDSTERN_API_ENDPOINTS.PRICES(chainId)}?token=${encodeURIComponent(tokenList)}`, {
          method: 'GET',
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch prices: ${response.statusText}`)
        }

        const data: NordsternPricesResponse = await response.json()
        return data
      } catch (err) {
        console.error('Error fetching prices from Nordstern API:', err)
        return {}
      }
    },
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    enabled: !!chainId && tokenList.length > 0,
    refetchInterval: false,
  })

  const pricesMap = useMemo(() => {
    const map = new Map<string, number>()
    if (data) {
      Object.entries(data).forEach(([address, price]) => {
        map.set(address.toLowerCase(), price)
      })
    }
    return map
  }, [data])

  return {
    prices: data || {},
    pricesMap,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch prices') : null,
  }
}


