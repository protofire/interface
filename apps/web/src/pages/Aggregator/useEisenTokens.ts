import { useState, useEffect, useMemo } from 'react'
import { FLOW_CHAIN_ID } from './mockTokenData'
import { mockTokenToToken, MockToken } from './mockTokenData'
import { Token } from '@uniswap/sdk-core'

interface EisenTokenResponse {
  result: {
    [chainId: number]: MockToken[]
  }
}

/**
 * Fetches tokens from Eisen API
 */
export function useEisenTokens(chainId: number = FLOW_CHAIN_ID) {
  const [tokens, setTokens] = useState<MockToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true)
      setError(null)
      
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
        const chainTokens = data.result?.[chainId] || []
        setTokens(chainTokens)
      } catch (err) {
        console.error('Error fetching tokens from Eisen API:', err)
        setError(err instanceof Error ? err.message : 'Failed to load tokens')
        
        // Fallback to mock tokens on error
        const { getMockTokensForChain } = await import('./mockTokenData')
        const mockTokens = getMockTokensForChain(chainId)
        setTokens(mockTokens)
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [chainId])

  // Convert to Uniswap Token format
  const tokenList = useMemo(() => {
    return tokens.map(mockTokenToToken)
  }, [tokens])

  return {
    tokens,
    tokenList,
    loading,
    error,
  }
}

