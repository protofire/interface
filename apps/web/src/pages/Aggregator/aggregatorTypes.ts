export enum AggregatorType {
  EISEN = 'EISEN',
  NORDSTERN = 'NORDSTERN',
}

export interface UnifiedQuote {
  aggregator: AggregatorType
  toAmount: string
  fromAmount: string
  toAmountMin: string
  routerAddress: string
  transactionRequest: {
    to: string
    data: string
    value: string
    gasPrice?: string
    gasLimit?: string
  }
  gasCost?: {
    amount: string
    amountUSD: string
    token: {
      address: string
      symbol: string
      decimals: number
    }
  }
  fromToken: {
    address: string
    symbol: string
    decimals: number
    name: string
    logoURI?: string
  }
  toToken: {
    address: string
    symbol: string
    decimals: number
    name: string
    logoURI?: string
  }
  fromAmountUSD?: string
  toAmountUSD?: string
  rawQuote: any
}

export interface AggregatorQuoteResult {
  quotes: Map<AggregatorType, UnifiedQuote | null>
  bestQuote: UnifiedQuote | null
  loading: boolean
  errors: Map<AggregatorType, string | null>
}

