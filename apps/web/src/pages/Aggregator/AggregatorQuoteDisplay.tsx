import styled from 'lib/styled-components'
import { Trans } from 'uniswap/src/i18n'
import { useAccount } from 'hooks/useAccount'
import { useTheme } from 'lib/styled-components'
import { BigNumber } from '@ethersproject/bignumber'

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
  quote: any
  loading: boolean
  error: string | null
  slippage?: number
}

export function AggregatorQuoteDisplay({ quote, loading, error, slippage }: AggregatorQuoteDisplayProps) {
  const account = useAccount()
  const theme = useTheme()

  if (loading) {
    return (
      <QuoteContainer>
        <div style={{ textAlign: 'center', padding: '20px', color: theme.neutral2 }}>
          Fetching quote...
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

  const estimate = quote?.result?.estimate
  const gasCost = estimate?.gasCosts?.[0]

  if (!estimate) {
    return null
  }

  // Parse output amounts with proper decimals - get decimals from the quote's toToken
  const toToken = quote?.result?.action?.toToken
  const outputDecimals = toToken?.decimals ?? 18 // Default to 18 if not available
  const outputTokenSymbol = toToken?.symbol ?? 'tokens'
  
  const formatAmount = (amount: string, decimals: number): string => {
    if (!amount || amount === '0') return '0'
    try {
      const amountBN = BigNumber.from(amount)
      
      if (amountBN.isZero()) {
        return '0'
      }
      
      const divisor = BigNumber.from(10).pow(decimals)
      
      if (decimals >= 6) {
        const thresholdWei = BigNumber.from(10).pow(decimals - 6)
        if (amountBN.lt(thresholdWei)) {
          return '<0.000001'
        }
      }
      
      const amountDecimal = amountBN.mul(BigNumber.from(10).pow(6)).div(divisor)
      const decimalValue = amountDecimal.toNumber() / 1e6
      
      return decimalValue.toFixed(6)
    } catch {
      return '0'
    }
  }
  
  const toAmountFormatted = formatAmount(estimate.toAmount, outputDecimals)
  const minAmountFormatted = formatAmount(estimate.toAmountMin, outputDecimals)

  // Format gas cost with proper decimals
  const gasCostFormatted = gasCost 
    ? formatAmount(gasCost.amount, gasCost.token.decimals)
    : '0'

  return (
    <QuoteContainer>
      <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '16px' }}>
        Quote Details
      </div>
      
      <QuoteRow>
        <Label>Output Amount:</Label>
        <Value>{toAmountFormatted} {outputTokenSymbol}</Value>
      </QuoteRow>
      {slippage !== undefined && (
        <QuoteRow>
          <Label>Max. Slippage:</Label>
          <Value>{(slippage * 100).toFixed(2)}%</Value>
        </QuoteRow>
      )}
      <QuoteRow>
        <Label>Receive at least:</Label>
        <Value>{minAmountFormatted} {outputTokenSymbol}</Value>
      </QuoteRow>
      {estimate.toAmountUSD && (
        <QuoteRow>
          <Label>USD Value:</Label>
          <Value>${parseFloat(estimate.toAmountUSD).toFixed(4)}</Value>
        </QuoteRow>
      )}
      
      {gasCost && (
        <GasInfo>
          <QuoteRow>
            <Label>Gas Cost:</Label>
            <Value>
              {gasCostFormatted} {gasCost.token.symbol}
            </Value>
          </QuoteRow>
          <QuoteRow>
            <Label>Gas Cost USD:</Label>
            <Value>${parseFloat(gasCost.amountUSD).toFixed(6)}</Value>
          </QuoteRow>
        </GasInfo>
      )}
    </QuoteContainer>
  )
}

