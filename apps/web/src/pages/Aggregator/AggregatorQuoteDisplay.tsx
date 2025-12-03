import styled from 'lib/styled-components'
import { Trans } from 'uniswap/src/i18n'
import { useAccount } from 'hooks/useAccount'
import { useTheme } from 'lib/styled-components'
import { BigNumber } from '@ethersproject/bignumber'
import { NumberType, useFormatter } from 'utils/formatNumbers'
import { Price, Percent } from '@uniswap/sdk-core'
import TradePrice from 'components/swap/TradePrice'
import { getTokenSymbolOverride } from 'components/CurrencyInputPanel/utils'
import { UnifiedQuote } from './aggregatorTypes'

const QuoteContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.surface3};
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  background: ${({ theme }) => theme.surface2};
`

const QuoteRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
`

const Label = styled.span`
  color: ${({ theme }) => theme.neutral2};
`

const Value = styled.span`
  color: ${({ theme }) => theme.neutral1};
  font-weight: 535;
`

const GasInfo = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.surface3};
`

interface AggregatorQuoteDisplayProps {
  quote: UnifiedQuote | null
  loading: boolean
  error: string | null
  slippage?: number
  exchangeRate?: Price<any, any> | null
  priceImpact?: Percent | undefined
}

export function AggregatorQuoteDisplay({ quote, loading, error, slippage, exchangeRate, priceImpact }: AggregatorQuoteDisplayProps) {
  const account = useAccount()
  const theme = useTheme()
  const { formatNumber, formatPercent } = useFormatter()

  if (loading) {
    return (
      <QuoteContainer>
        <div style={{ textAlign: 'center', padding: '20px', color: theme.neutral2 }}>
          Fetching quotes...
        </div>
      </QuoteContainer>
    )
  }

  if (error) {
    return (
      <QuoteContainer>
        <div style={{ color: theme.critical, textAlign: 'center', padding: '10px' }}>
          Error: {error}
        </div>
      </QuoteContainer>
    )
  }

  if (!quote) {
    return null
  }

  const gasCost = quote.gasCost
  const outputDecimals = quote.toToken.decimals ?? 18
  const outputTokenSymbol = getTokenSymbolOverride(quote.toToken.address, quote.toToken.symbol ?? 'tokens')
  
  const formatAmount = (amount: string, decimals: number): string => {
    if (!amount || amount === '0') return '0'
    try {
      const amountBN = BigNumber.from(amount)
      
      if (amountBN.isZero()) {
        return '0'
      }
      
      const divisor = BigNumber.from(10).pow(decimals)
      
      // Check for very small amounts (< 0.000001)
      if (decimals >= 6) {
        const thresholdWei = BigNumber.from(10).pow(decimals - 6)
        if (amountBN.lt(thresholdWei)) {
          return '<0.000001'
        }
      }
      
      // Convert to decimal number
      const amountDecimal = amountBN.mul(BigNumber.from(10).pow(6)).div(divisor)
      const decimalValue = amountDecimal.toNumber() / 1e6
      
      // Use formatNumber with SwapDetailsAmount to get proper formatting (removes trailing zeros, uses significant figures)
      return formatNumber({ input: decimalValue, type: NumberType.SwapDetailsAmount })
    } catch {
      return '0'
    }
  }
  
  const toAmountFormatted = formatAmount(quote.toAmount, outputDecimals)
  const minAmountFormatted = formatAmount(quote.toAmountMin, outputDecimals)

  const gasCostFormatted = gasCost 
    ? formatAmount(gasCost.amount, gasCost.token.decimals)
    : '0'

  return (
    <QuoteContainer>
      <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '16px' }}>
        Quote Details
      </div>
      
      {exchangeRate && (
        <QuoteRow>
          <Label>Exchange Rate:</Label>
          <Value>
            <TradePrice price={exchangeRate} />
          </Value>
        </QuoteRow>
      )}
      <QuoteRow>
        <Label>Output Amount:</Label>
        <Value>{toAmountFormatted} {outputTokenSymbol}</Value>
      </QuoteRow>
      {slippage !== undefined && (
        <QuoteRow>
          <Label>Max. Slippage:</Label>
          <Value>{Number((slippage * 100).toFixed(2))}%</Value>
        </QuoteRow>
      )}
      {/* {priceImpact && (
        <QuoteRow>
          <Label>Price Impact:</Label>
          <Value>
            {(() => {
              const absPriceImpact = priceImpact.lessThan(0) ? priceImpact.multiply(-1) : priceImpact
              if (absPriceImpact.lessThan(new Percent(1, 100))) {
                return '<1%'
              }
              return formatPercent(priceImpact)
            })()}
          </Value>
        </QuoteRow>
      )} */}
      <QuoteRow>
        <Label>Receive at least:</Label>
        <Value>{minAmountFormatted} {outputTokenSymbol}</Value>
      </QuoteRow>
      {quote.toAmountUSD && (
        <QuoteRow>
          <Label>USD Value:</Label>
          <Value>{formatNumber({ input: parseFloat(quote.toAmountUSD), type: NumberType.FiatTokenDetails })}</Value>
        </QuoteRow>
      )}
      
      {gasCost && (
        <GasInfo>
          <QuoteRow>
            <Label>Gas Cost:</Label>
            <Value>
              {gasCostFormatted} {getTokenSymbolOverride(gasCost.token.address, gasCost.token.symbol)}
            </Value>
          </QuoteRow>
          {gasCost.amountUSD && parseFloat(gasCost.amountUSD) > 0 && (
            <QuoteRow>
              <Label>Gas Cost USD:</Label>
              <Value>{formatNumber({ input: parseFloat(gasCost.amountUSD), type: NumberType.FiatGasPrice })}</Value>
            </QuoteRow>
          )}
        </GasInfo>
      )}
    </QuoteContainer>
  )
}

