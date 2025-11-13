import { Currency } from '@uniswap/sdk-core'

const TOKEN_OVERRIDES: Record<string, { name: string; symbol: string }> = {
  '0xf1815bd50389c46847f0bda824ec8da914045d14': {
    name: 'USDC',
    symbol: 'USDC',
  },
  '0x49c6b2799af2db7404b930f24471dd961cfe18b7': {
    name: 'More Flow USDC',
    symbol: 'mFlowUSDC',
  },
}

function getTokenOverride(address: string): { name: string; symbol: string } | undefined {
  return TOKEN_OVERRIDES[address.toLowerCase()]
}

export function formatCurrencySymbol(currency?: Currency): string | undefined {
  if (!currency) return undefined

  if (currency.isToken && currency.address) {
    const override = getTokenOverride(currency.address)
    if (override?.symbol) {
      const symbol = override.symbol
      return symbol.length > 20 ? symbol.slice(0, 4) + '...' + symbol.slice(symbol.length - 5, symbol.length) : symbol
    }
  }

  return currency.symbol && currency.symbol.length > 20
    ? currency.symbol.slice(0, 4) + '...' + currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
    : currency?.symbol
}

export function getTokenSymbolOverride(address: string | undefined, fallbackSymbol?: string): string {
  if (!address) return fallbackSymbol || 'UNK'
  const override = TOKEN_OVERRIDES[address.toLowerCase()]
  return override?.symbol ?? fallbackSymbol ?? 'UNK'
}

export function getTokenNameOverride(address: string | undefined, fallbackName?: string): string {
  if (!address) return fallbackName || 'Unknown'
  const override = TOKEN_OVERRIDES[address.toLowerCase()]
  return override?.name ?? fallbackName ?? 'Unknown'
}
