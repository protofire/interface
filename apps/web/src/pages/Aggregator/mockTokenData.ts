import { Currency, Token } from '@uniswap/sdk-core'
import { getTokenNameOverride, getTokenSymbolOverride } from 'components/CurrencyInputPanel/utils'
import { nativeOnChain } from 'constants/tokens'

// Flow Mainnet chain ID
export const FLOW_CHAIN_ID = 747
// Flow Testnet chain ID
export const FLOW_TESTNET_CHAIN_ID = 545

// Native token address pattern
const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

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
 * Convert mock token data to Uniswap Currency format
 * Returns NativeCurrency for native tokens, Token for ERC20 tokens
 */
export function mockTokenToToken(mockToken: MockToken): Currency {
  // Check if this is a native currency token
  if (mockToken.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) {
    // Return the proper NativeCurrency object for the chain
    return nativeOnChain(mockToken.chainId)
  }
  // Apply token overrides for aggregator - use overridden symbol/name if available
  const symbol = getTokenSymbolOverride(mockToken.address, mockToken.symbol)
  const name = getTokenNameOverride(mockToken.address, mockToken.name)
  // Return a Token object for ERC20 tokens with overridden values
  return new Token(mockToken.chainId, mockToken.address, mockToken.decimals, symbol, name)
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
