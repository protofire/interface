import { Currency } from '@uniswap/sdk-core'
import { useAccountDrawer } from 'components/AccountDrawer/MiniPortfolio/hooks'
import { ButtonLight } from 'components/Button'
import { GrayCard } from 'components/Card'
import { Field } from 'components/swap/constants'
import { useAccount } from 'hooks/useAccount'
import { useState, useCallback, useMemo, useRef } from 'react'
import { ArrowDown } from 'react-feather'
import { ThemedText } from 'theme/components'
import { Text } from 'ui/src'
import { Trans } from 'uniswap/src/i18n'
import { AggregatorCurrencyInputPanel } from './AggregatorCurrencyInputPanel'
import { useEisenQuote } from './useEisenQuote'
import { FLOW_CHAIN_ID, FLOW_TESTNET_CHAIN_ID } from './mockTokenData'
import { useSwapAndLimitContext } from 'state/swap/useSwapContext'
import { AggregatorQuoteDisplay } from './AggregatorQuoteDisplay'

const SWAP_FORM_CURRENCY_SEARCH_FILTERS = {
  showCommonBases: true,
}

interface AggregatorFormProps {
  disableTokenInputs?: boolean
}

export function AggregatorForm({ disableTokenInputs = false }: AggregatorFormProps) {
  const account = useAccount()
  
  // Auto-detect testnet based on connected wallet's chain ID
  const isTestnet = useMemo(() => {
    if (!account.chainId) return false
    return account.chainId === FLOW_TESTNET_CHAIN_ID
  }, [account.chainId])
  
  // Get current chain ID based on wallet's chain or default to mainnet
  const currentChainId = useMemo(() => {
    if (!account.chainId) return FLOW_CHAIN_ID
    return account.chainId === FLOW_TESTNET_CHAIN_ID ? FLOW_TESTNET_CHAIN_ID : FLOW_CHAIN_ID
  }, [account.chainId])
  
  // Simple state management for aggregator (no backend interaction)
  const [currencyState, setCurrencyState] = useState<{
    inputCurrency: Currency | null
    outputCurrency: Currency | null
  }>({
    inputCurrency: null,
    outputCurrency: null,
  })
  
  const [swapState, setSwapState] = useState<{
    typedValue: string
    independentField: Field
  }>({
    typedValue: '',
    independentField: Field.INPUT,
  })
  
  const { typedValue, independentField } = swapState
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLInputElement>(null)
  
  // Get selected currencies
  const currencies = useMemo(
    () => ({
      [Field.INPUT]: currencyState.inputCurrency,
      [Field.OUTPUT]: currencyState.outputCurrency,
    }),
    [currencyState]
  )
  
  // Mock balance data - not using real hooks
  
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT
  
  // Mock fiat values - not using real hooks
  const inputFiatValue = undefined
  const outputFiatValue = undefined
  
  // Prepare Eisen quote parameters
  const quoteParams = useMemo(() => {
    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT] || !typedValue || !account.address) {
      return null
    }
    
    // Calculate fromAmount in wei (smallest unit)
    // Convert the input amount to wei based on token decimals
    const inputCurrency = currencies[Field.INPUT]
    const decimals = inputCurrency?.decimals || 18
    const fromAmountWei = (parseFloat(typedValue) * Math.pow(10, decimals)).toString()
    
    // For native currency, use the zero address
    const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    const fromToken = inputCurrency?.isNative 
      ? NATIVE_TOKEN_ADDRESS
      : inputCurrency?.address || ''
    const toToken = currencies[Field.OUTPUT]?.isNative 
      ? NATIVE_TOKEN_ADDRESS
      : currencies[Field.OUTPUT]?.address || ''
    
    return {
      fromAddress: account.address,
      fromChain: currentChainId,
      toChain: currentChainId,
      fromToken,
      toToken,
      fromAmount: fromAmountWei,
      toAddress: account.address,
      // Optional parameters - only include if needed
      order: 'CHEAPEST',
      // Omitting includedDex, referrer, fee, slippage to use API defaults
    }
  }, [currencies, typedValue, independentField, account.address, currentChainId])
  
  // Fetch quote from Eisen API
  const { quote, loading: quoteLoading, error: quoteError } = useEisenQuote(quoteParams)
  
  // Calculate estimated output amount from quote
  const estimatedOutput = useMemo(() => {
    if (quote?.result?.estimate && currencies[Field.OUTPUT]) {
      // Extract the estimated output amount from quote response
      const outputCurrency = currencies[Field.OUTPUT]
      const decimals = outputCurrency?.decimals || 6
      
      // Convert from smallest unit (wei) to human readable format with proper decimals
      const expectedOutputWei = quote.result.estimate.toAmount
      const formatAmount = (amount: string, decimals: number): string => {
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
      
      const expectedOutput = formatAmount(expectedOutputWei, decimals)
      return expectedOutput
    }
    return ''
  }, [quote, currencies])
  
  // Handle user input
  const handleTypeInput = useCallback((value: string) => {
    setSwapState((prev) => ({ ...prev, typedValue: value, independentField: Field.INPUT }))
  }, [])
  
  const handleTypeOutput = useCallback((value: string) => {
    setSwapState((prev) => ({ ...prev, typedValue: value, independentField: Field.OUTPUT }))
  }, [])
  
  // Handle currency selection with mock data
  const handleCurrencySelect = useCallback(
    (field: Field, currency: Currency) => {
      setCurrencyState((prev) => ({
        inputCurrency: field === Field.INPUT ? currency : prev.inputCurrency,
        outputCurrency: field === Field.OUTPUT ? currency : prev.outputCurrency,
      }))
    },
    []
  )
  
  const handleInputSelect = useCallback(
    (inputCurrency: Currency) => {
      handleCurrencySelect(Field.INPUT, inputCurrency)
    },
    [handleCurrencySelect]
  )
  
  const handleOutputSelect = useCallback(
    (outputCurrency: Currency) => {
      handleCurrencySelect(Field.OUTPUT, outputCurrency)
    },
    [handleCurrencySelect]
  )
  
  // Switch tokens
  const handleSwitchTokens = useCallback(() => {
    setCurrencyState((prev) => ({
      inputCurrency: prev.outputCurrency,
      outputCurrency: prev.inputCurrency,
    }))
  }, [])
  
  // Format amounts for display
  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue || '',
      [dependentField]: quoteLoading ? '...' : (estimatedOutput || '0'),
    }),
    [independentField, dependentField, typedValue, quoteLoading, estimatedOutput]
  )
  
  // Mock: don't show max button in aggregator mode
  const showMaxButton = false
  
  const handleMaxInput = useCallback(() => {
    // Mock: no-op in aggregator mode
  }, [])
  
  const accountDrawer = useAccountDrawer()
  const isDisconnected = !account.address

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* Network Indicator */}
      {account.chainId && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <span style={{
            background: isTestnet ? '#66CC66' : '#f0f0f0',
            color: isTestnet ? 'white' : '#666',
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '14px',
            fontWeight: 535,
          }}>
            {isTestnet ? 'Testnet' : 'Mainnet'}
          </span>
        </div>
      )}

      <AggregatorCurrencyInputPanel
        label="Sell"
        value={formattedAmounts[Field.INPUT]}
        onUserInput={handleTypeInput}
        onCurrencySelect={handleInputSelect}
        currency={currencies[Field.INPUT]}
        otherCurrency={currencies[Field.OUTPUT]}
        disabled={disableTokenInputs}
        showMaxButton={showMaxButton}
        onMax={handleMaxInput}
        fiatValue={inputFiatValue}
        ref={inputRef}
      />

      <div style={{ display: 'flex', justifyContent: 'center', margin: '-12px 0' }}>
        <button
          onClick={handleSwitchTokens}
          style={{
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f5f5f5'
            e.currentTarget.style.borderColor = '#bdbdbd'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.borderColor = '#e0e0e0'
          }}
        >
          <ArrowDown size="18" />
        </button>
      </div>

      <AggregatorCurrencyInputPanel
        label="Buy"
        value={formattedAmounts[Field.OUTPUT]}
        onUserInput={handleTypeOutput}
        onCurrencySelect={handleOutputSelect}
        currency={currencies[Field.OUTPUT]}
        otherCurrency={currencies[Field.INPUT]}
        disabled={disableTokenInputs}
        fiatValue={outputFiatValue}
        ref={outputRef}
      />

      <AggregatorQuoteDisplay quote={quote} loading={quoteLoading} error={quoteError} />
      
      <div>
        {isDisconnected ? (
          <ButtonLight onClick={accountDrawer.open} fontWeight={535} $borderRadius="16px">
            <Trans i18nKey="common.connectWallet.button" />
          </ButtonLight>
        ) : (
          <GrayCard style={{ textAlign: 'center' }}>
            <ThemedText.DeprecatedMain mb="4px">
              <Text color="neutral2">Aggregator mode</Text>
            </ThemedText.DeprecatedMain>
          </GrayCard>
        )}
      </div>
    </div>
  )
}

