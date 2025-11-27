import { useQuery } from '@tanstack/react-query'
import { EISEN_API_ENDPOINTS, EISEN_API_HEADERS } from './eisenApiConfig'

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
      const response = await fetch(`${EISEN_API_ENDPOINTS.DEXS}?chainId=${chainId}`, {
        headers: EISEN_API_HEADERS,
      })

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

