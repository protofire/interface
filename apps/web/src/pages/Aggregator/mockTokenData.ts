import { Token } from '@uniswap/sdk-core'
import { UniverseChainId } from 'uniswap/src/types/chains'

// Flow Mainnet chain ID
export const FLOW_CHAIN_ID = 747
// Flow Testnet chain ID
export const FLOW_TESTNET_CHAIN_ID = 545

export interface MockToken {
  address: string
  name: string
  coinKey: string
  symbol: string
  decimals: number
  icon: string
  chainId: number
}

// Mock token data for Flow chains
export const MOCK_TOKENS: Record<number, MockToken[]> = {
  [FLOW_CHAIN_ID]: [
    {
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      name: 'Flow',
      coinKey: 'FLOW',
      symbol: 'FLOW',
      decimals: 18,
      icon: '',
      chainId: FLOW_CHAIN_ID,
    },
  ],
}

/**
 * Convert mock token data to Uniswap Token format
 */
export function mockTokenToToken(mockToken: MockToken): Token {
  return new Token(mockToken.chainId, mockToken.address, mockToken.decimals, mockToken.symbol, mockToken.name)
}

/**
 * Get mock tokens for a specific chain
 */
export function getMockTokensForChain(chainId: number): MockToken[] {
  return MOCK_TOKENS[chainId] || []
}

/**
 * Get mock token result structure matching the backend API
 */
export function getMockTokenResult(chainId: number) {
  const tokens = getMockTokensForChain(chainId)
  return {
    result: {
      [chainId]: tokens,
    },
  }
}

