import { useMemo } from 'react'
import { Currency } from '@uniswap/sdk-core'
import { FLOW_CHAIN_ID, getMockTokensForChain, mockTokenToToken } from './mockTokenData'

/**
 * Hook that provides mock token search results
 * This simulates the backend API response for token search
 */
export function useCurrencySearchResultsWithMock() {
  const mockTokens = useMemo(() => {
    // Get mock tokens for Flow chain
    const mockTokenData = getMockTokensForChain(FLOW_CHAIN_ID)
    
    // Convert to Uniswap Token format
    return mockTokenData.map(mockTokenToToken)
  }, [])
  
  // Simulate the backend response structure
  const searchResults = useMemo(() => {
    return {
      popularTokens: mockTokens,
      searchResults: mockTokens,
      isSearching: false,
      searchQuery: '',
      selectedChainId: FLOW_CHAIN_ID,
    }
  }, [mockTokens])
  
  return searchResults
}

