import { useQuery } from '@tanstack/react-query'

interface EisenDexsResponse {
  result: {
    [chainId: string]: string[]
  }
}

/**
 * Fetches supported DEXs from Eisen API with caching
 */
export function useEisenDexs(chainId: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['eisenDexs', chainId],
    queryFn: async () => {
      const response = await fetch(
        `https://hiker.hetz-01.eisenfinance.com/public/v1/dexs?chainId=${chainId}`,
        {
          headers: {
            'X-EISEN-KEY': process.env.REACT_APP_EISEN_API_KEY || '',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch DEXs: ${response.statusText}`)
      }

      const data: EisenDexsResponse = await response.json()
      return data.result?.[chainId.toString()] || []
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    enabled: !!chainId,
  })

  return {
    dexs: data || [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch DEXs') : null,
  }
}

