import { useState } from 'react'
import styled from 'lib/styled-components'
import { ButtonPrimary } from 'components/Button'
import { Trans } from 'uniswap/src/i18n'
import { useAccount } from 'hooks/useAccount'
import { useTheme } from 'lib/styled-components'
import { useEthersProvider } from 'hooks/useEthersProvider'
import { useTransactionAdder } from 'state/transactions/hooks'
import { ExactInputSwapTransactionInfo, TransactionType } from 'state/transactions/types'
import { useTokenApproval } from './useTokenApproval'
import { Token } from '@uniswap/sdk-core'

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
  onExecute?: () => void
}

export function AggregatorQuoteDisplay({ quote, loading, error, onExecute }: AggregatorQuoteDisplayProps) {
  const account = useAccount()
  const theme = useTheme()
  const [executing, setExecuting] = useState(false)
  const provider = useEthersProvider({ chainId: account.chainId })
  const addTransaction = useTransactionAdder()

  // Check if we need approval for the input token
  const inputToken = quote?.result?.action?.fromToken
  const routerAddress = quote?.result?.transactionRequest?.to // This is the router contract that needs approval
  const fromAmount = quote?.result?.action?.fromAmount

  // Create Token object for approval check
  const tokenForApproval = inputToken ? new Token(
    inputToken.chainId,
    inputToken.address,
    inputToken.decimals,
    inputToken.symbol,
    inputToken.name
  ) : null

  // Check if user has approved the router contract to spend their tokens
  const { needsApproval, isApproving, approve, error: approvalError } = useTokenApproval(
    tokenForApproval,
    routerAddress || null, // Router contract address that needs approval
    fromAmount || null // Amount of tokens to approve
  )

  const handleExecute = async () => {
    const txnRequest = quote?.result?.transactionRequest
    if (!txnRequest || !account.address || !provider) {
      return
    }

    setExecuting(true)
    try {
      const signer = provider.getSigner()
      
      const tx = await signer.sendTransaction({
        to: txnRequest.to,
        value: txnRequest.value,
        data: txnRequest.data as `0x${string}`,
        gasPrice: txnRequest.gasPrice,
        gasLimit: txnRequest.gasLimit,
      })

      console.log('Transaction sent:', tx.hash)
      
      // Add transaction to the app's transaction list
      const action = quote?.result?.action
      const estimate = quote?.result?.estimate
      
      const transactionInfo: ExactInputSwapTransactionInfo = {
        type: TransactionType.SWAP,
        tradeType: 'EXACT_INPUT' as any,
        inputCurrencyId: action?.fromToken?.address || '',
        outputCurrencyId: action?.toToken?.address || '',
        inputCurrencyAmountRaw: action?.fromAmount || '0',
        expectedOutputCurrencyAmountRaw: estimate?.toAmount || '0',
        minimumOutputCurrencyAmountRaw: estimate?.toAmountMin || '0',
        isUniswapXOrder: false,
      }
      
      // @ts-ignore - TransactionResponse type
      addTransaction(tx, transactionInfo)
      
      onExecute?.()
    } catch (err) {
      console.error('Transaction failed:', err)
    } finally {
      setExecuting(false)
    }
  }

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

  // Parse output amounts with proper decimals (assume 6 decimals for USDF)
  const formatAmount = (amount: string, decimals: number = 6): string => {
    if (!amount) return '0'
    const amountBigInt = BigInt(amount)
    const divisor = BigInt(10 ** decimals)
    const quotient = amountBigInt / divisor
    const remainder = amountBigInt % divisor
    
    if (remainder === BigInt(0)) {
      return quotient.toString()
    }
    
    // Format with proper decimal places
    const remainderStr = remainder.toString().padStart(decimals, '0')
    const trimmedRemainder = remainderStr.replace(/0+$/, '')
    return `${quotient}.${trimmedRemainder}`
  }
  
  const toAmountFormatted = formatAmount(estimate.toAmount, 6)
  const minAmountFormatted = formatAmount(estimate.toAmountMin, 6)

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
        <Value>{toAmountFormatted} tokens</Value>
      </QuoteRow>
      <QuoteRow>
        <Label>Min Output:</Label>
        <Value>{minAmountFormatted} tokens</Value>
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

      {quote?.result?.transactionRequest && account.address && (
        <div style={{ marginTop: '16px' }}>
          {needsApproval ? (
            <ButtonPrimary
              disabled={isApproving}
              onClick={approve}
              $borderRadius="12px"
              style={{ width: '100%', fontWeight: 535 }}
            >
              {isApproving ? 'Approving...' : `Approve ${inputToken?.symbol || 'Token'}`}
            </ButtonPrimary>
          ) : (
            <ButtonPrimary
              disabled={executing}
              onClick={handleExecute}
              $borderRadius="12px"
              style={{ width: '100%', fontWeight: 535 }}
            >
              {executing ? 'Processing...' : 'Execute Swap'}
            </ButtonPrimary>
          )}
          
          {approvalError && (
            <div style={{ 
              color: theme.critical, 
              fontSize: '12px', 
              marginTop: '8px', 
              textAlign: 'center' 
            }}>
              Approval failed: {approvalError}
            </div>
          )}
        </div>
      )}
    </QuoteContainer>
  )
}

