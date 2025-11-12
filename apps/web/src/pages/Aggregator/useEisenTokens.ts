import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { FLOW_CHAIN_ID } from './mockTokenData'
import { mockTokenToToken, MockToken } from './mockTokenData'
import { Token } from '@uniswap/sdk-core'

interface EisenTokenResponse {
  result: {
    [chainId: number]: MockToken[]
  }
}

/**
 * Fetches tokens from Eisen API with caching
 */
export function useEisenTokens(chainId: number = FLOW_CHAIN_ID) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['eisenTokens', chainId],
    queryFn: async () => {
      try {
        const response = await fetch(`https://hiker.hetz-01.eisenfinance.com/public/v1/tokens?chainId=${chainId}`, {
          headers: {
            'X-EISEN-KEY': process.env.REACT_APP_EISEN_API_KEY || '',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch tokens: ${response.statusText}`)
        }

        const data: EisenTokenResponse = await response.json()
        
        // Extract tokens from the nested result structure
        return data.result?.[chainId] || []
      } catch (err) {
        console.error('Error fetching tokens from Eisen API:', err)
        
        // Fallback to mock tokens on error
        const { getMockTokensForChain } = await import('./mockTokenData')
        return getMockTokensForChain(chainId)
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })

  const tokens = data || []

  // Convert to Uniswap Token format
  const tokenList = useMemo(() => {
    return tokens.map(mockTokenToToken)
  }, [tokens])

  return {
    tokens,
    tokenList,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to load tokens') : null,
  }
}

