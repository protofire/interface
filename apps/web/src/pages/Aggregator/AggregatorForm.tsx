import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { parseUnits } from '@ethersproject/units'
import { BigNumber } from '@ethersproject/bignumber'
import { useAccountDrawer } from 'components/AccountDrawer/MiniPortfolio/hooks'
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { Field } from 'components/swap/constants'
import { ArrowContainer, ArrowWrapper, OutputSwapSection, SwapSection } from 'components/swap/styled'
import { useAccount } from 'hooks/useAccount'
import { useTheme } from 'lib/styled-components'
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { ArrowDown } from 'react-feather'
import { ThemedText } from 'theme/components'
import { Trans } from 'uniswap/src/i18n'
import { CurrencyField } from 'uniswap/src/types/currency'
import AggregatorSwapCurrencyInputPanel from './AggregatorSwapCurrencyInputPanel'
import { useEisenQuote } from './useEisenQuote'
import { FLOW_CHAIN_ID, FLOW_TESTNET_CHAIN_ID } from './mockTokenData'
import { useEisenDexs } from './useEisenDexs'
import { useSwapAndLimitContext } from 'state/swap/useSwapContext'
import { AggregatorQuoteDisplay } from './AggregatorQuoteDisplay'
import { AggregatorSettings, OrderType } from './AggregatorSettings'
import { useTokenApproval } from './useTokenApproval'
import { useEthersProvider } from 'hooks/useEthersProvider'
import { useTransactionAdder } from 'state/transactions/hooks'
import { ExactInputSwapTransactionInfo, TransactionType } from 'state/transactions/types'
import { RowBetween, RowFixed } from 'components/Row'
import { Text, Flex } from 'ui/src'
import styled from 'lib/styled-components'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { useCurrencyBalance } from 'state/connection/hooks'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { nativeOnChain } from 'constants/tokens'
import { useIsTransactionPending, useIsTransactionConfirmed } from 'state/transactions/hooks'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { ReactComponent as EisenLogo } from 'assets/svg/eisen.svg'
import useSelectChain from 'hooks/useSelectChain'
import { UNIVERSE_CHAIN_INFO } from 'uniswap/src/constants/chains'
import { UniverseChainId } from 'uniswap/src/types/chains'
import { useNavigate } from 'react-router-dom'

const SWAP_FORM_CURRENCY_SEARCH_FILTERS = {
  showCommonBases: true,
}

const AggregatorHeader = styled(RowBetween)`
  margin-bottom: 12px;
  padding-right: 4px;
  color: ${({ theme }) => theme.neutral2};
`

interface AggregatorFormProps {
  disableTokenInputs?: boolean
  isLandingPage?: boolean
}

export function AggregatorForm({ disableTokenInputs = false, isLandingPage = false }: AggregatorFormProps) {
  const account = useAccount()
  const selectChain = useSelectChain()
  const navigate = useNavigate()
  
  // Settings state
  const [order, setOrder] = useState<OrderType>('CHEAPEST')
  const [slippage, setSlippage] = useState<number>(0.005)
  const [selectedDexs, setSelectedDexs] = useState<string[]>([])
  
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
  
  // Check if connected chain is Flow (mainnet or testnet)
  const isCorrectChain = useMemo(() => {
    if (!account.chainId) return false
    return account.chainId === FLOW_CHAIN_ID || account.chainId === FLOW_TESTNET_CHAIN_ID
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
  
  const [executing, setExecuting] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>(undefined)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [transactionError, setTransactionError] = useState<Error | null>(null)
  
  // Set default input currency to native currency on mount
  useEffect(() => {
    if (!currencyState.inputCurrency && currentChainId) {
      setCurrencyState((prev) => ({
        ...prev,
        inputCurrency: nativeOnChain(currentChainId),
      }))
    }
  }, [currentChainId, currencyState.inputCurrency])
  
  // Check transaction status
  const isTransactionPending = useIsTransactionPending(txHash)
  const isTransactionConfirmed = useIsTransactionConfirmed(txHash)
  
  // Reset form state after transaction modal is dismissed and transaction is confirmed
  const handleTransactionModalDismiss = useCallback(() => {
    setShowTransactionModal(false)
    setTransactionError(null)
    // Only reset if transaction is confirmed
    if (isTransactionConfirmed) {
      setTxHash(undefined)
      setSwapState({
        typedValue: '',
        independentField: Field.INPUT,
      })
      setCurrencyState({
        inputCurrency: nativeOnChain(currentChainId),
        outputCurrency: null,
      })
    }
  }, [currentChainId, isTransactionConfirmed])
  
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
  
  // Get currency balances
  const inputCurrencyBalance = useCurrencyBalance(account.address, currencies[Field.INPUT] ?? undefined)
  
  // Parse typed value to CurrencyAmount
  const parsedAmount = useMemo(() => {
    if (!typedValue || !currencies[Field.INPUT]) {
      return undefined
    }
    return tryParseCurrencyAmount(typedValue, currencies[Field.INPUT])
  }, [typedValue, currencies[Field.INPUT]])
  
  // Calculate max input amount (reserving gas for native tokens)
  const maxInputAmount = useMemo(
    () => maxAmountSpend(inputCurrencyBalance),
    [inputCurrencyBalance]
  )
  
  // Show max button if balance > 0 and not already at max
  const showMaxButton = Boolean(
    maxInputAmount?.greaterThan(0) && 
    (!parsedAmount || !parsedAmount.equalTo(maxInputAmount))
  )
  
  // Check for insufficient balance
  const hasInsufficientFunds = useMemo(() => {
    if (!parsedAmount || !inputCurrencyBalance) {
      return false
    }
    return inputCurrencyBalance.lessThan(parsedAmount)
  }, [parsedAmount, inputCurrencyBalance])
  
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT
  
  // Mock fiat values - not using real hooks
  const inputFiatValue = undefined
  const outputFiatValue = undefined
  
  // Fetch available DEXs for the current chain
  const { dexs: availableDexs } = useEisenDexs(currentChainId)
  
  // Prepare Eisen quote parameters
  const quoteParams = useMemo(() => {
    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT] || !account.address) {
      return null
    }
    
    // Don't fetch quote if amount is empty, zero, or invalid
    if (!typedValue || typedValue.trim() === '') {
      return null
    }
    
    // Check if the parsed value is actually greater than 0
    // This handles cases like "0", "0.", "0.0", "0.00000", etc.
    const parsedValue = parseFloat(typedValue)
    if (isNaN(parsedValue) || parsedValue <= 0) {
      return null
    }
    
    // Calculate fromAmount in wei (smallest unit)
    // Convert the input amount to wei based on token decimals
    // Use parseUnits to avoid scientific notation for large numbers
    const inputCurrency = currencies[Field.INPUT]
    const decimals = inputCurrency?.decimals || 18
    let fromAmountWei: string
    try {
      // parseUnits converts human-readable amount to wei, always returns integer string
      fromAmountWei = parseUnits(typedValue, decimals).toString()
      
      // Double check: if the wei amount is 0, don't fetch quote
      if (fromAmountWei === '0') {
        return null
      }
    } catch (error) {
      // Fallback if parseUnits fails (shouldn't happen with valid input)
      console.error('Error parsing amount:', error)
      return null
    }
    
    // For native currency, use the zero address
    const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    const fromToken = inputCurrency?.isNative 
      ? NATIVE_TOKEN_ADDRESS
      : inputCurrency?.address || ''
    const toToken = currencies[Field.OUTPUT]?.isNative 
      ? NATIVE_TOKEN_ADDRESS
      : currencies[Field.OUTPUT]?.address || ''
    
    // Build includedDex param
    // If all available DEXs are selected, don't include the param
    // Otherwise, include selected DEXs + WRAPPED_NATIVE
    let includedDex: string | undefined = undefined
    
    // Check if all available DEXs are selected
    const allDexsSelected = availableDexs.length > 0 && 
      selectedDexs.length === availableDexs.length &&
      availableDexs.every(dex => selectedDexs.includes(dex))
    
    // Only include includedDex param if not all DEXs are selected
    if (!allDexsSelected && selectedDexs.length > 0) {
      // Always include WRAPPED_NATIVE if not already in the list
      const dexsWithWrapped = selectedDexs.includes('WRAPPED_NATIVE')
        ? selectedDexs
        : [...selectedDexs, 'WRAPPED_NATIVE']
      includedDex = dexsWithWrapped.join(',')
    }

    const params: any = {
      fromAddress: account.address,
      fromChain: currentChainId,
      toChain: currentChainId,
      fromToken,
      toToken,
      fromAmount: fromAmountWei,
      toAddress: account.address,
      order: order,
      slippage: slippage.toString(),
    }

    // Only add includedDex if we have a value (not all DEXs selected)
    if (includedDex) {
      params.includedDex = includedDex
    }

    return params
  }, [currencies, typedValue, independentField, account.address, currentChainId, order, slippage, selectedDexs, availableDexs])
  
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
  
  const handleMaxInput = useCallback(() => {
    if (maxInputAmount) {
      handleTypeInput(maxInputAmount.toExact())
    }
  }, [maxInputAmount, handleTypeInput])
  
  const accountDrawer = useAccountDrawer()
  const isDisconnected = !account.address
  const theme = useTheme()
  const { chainId } = useSwapAndLimitContext()
  const supportedChainId = chainId // For aggregator, we support Flow chains
  const provider = useEthersProvider({ chainId: account.chainId })
  const addTransaction = useTransactionAdder()

  // Check if we need approval for the input token
  const inputToken = quote?.result?.action?.fromToken
  const routerAddress = quote?.result?.transactionRequest?.to
  const fromAmount = quote?.result?.action?.fromAmount

  // Create Token object for approval check
  const tokenForApproval = inputToken && !inputToken.address.toLowerCase().includes('eeee') ? new Token(
    inputToken.chainId,
    inputToken.address,
    inputToken.decimals,
    inputToken.symbol,
    inputToken.name
  ) : null

  // Check if user has approved the router contract to spend their tokens
  const { needsApproval, isApproving, approve, error: approvalError } = useTokenApproval(
    tokenForApproval,
    routerAddress || null,
    fromAmount || null
  )

  const handleExecute = async () => {
    const txnRequest = quote?.result?.transactionRequest
    if (!txnRequest || !account.address || !provider) {
      return
    }

    setExecuting(true)
    setTransactionError(null)
    
    try {
      const signer = provider.getSigner()
      
      // Prepare base transaction
      const txRequest = {
        to: txnRequest.to,
        value: txnRequest.value,
        data: txnRequest.data as `0x${string}`,
        gasPrice: txnRequest.gasPrice,
      }
      
      // Estimate gas ourselves (with fallback to quote's gasLimit)
      let gasLimit: BigNumber
      try {
        const gasEstimate = await provider.estimateGas(txRequest)
        gasLimit = calculateGasMargin(gasEstimate) // Add 20% margin
      } catch (gasError) {
        console.warn('Failed to estimate gas, using quote gasLimit:', gasError)
        // Fallback to quote's gasLimit if estimation fails
        gasLimit = BigNumber.from(txnRequest.gasLimit)
      }
      
      const tx = await signer.sendTransaction({
        ...txRequest,
        gasLimit,
      })

      console.log('Transaction sent:', tx.hash)
      
      // Store transaction hash to track status and show modal
      setTxHash(tx.hash)
      setShowTransactionModal(true)
      
      // Add transaction to the app's transaction list
      const action = quote?.result?.action
      const estimate = quote?.result?.estimate
      
      // Store token symbols and decimals directly to avoid GraphQL dependency
      const inputCurrencySymbol = action?.fromToken?.symbol || currencies[Field.INPUT]?.symbol || ''
      const outputCurrencySymbol = action?.toToken?.symbol || currencies[Field.OUTPUT]?.symbol || ''
      const inputCurrencyDecimals = action?.fromToken?.decimals || currencies[Field.INPUT]?.decimals || 18
      const outputCurrencyDecimals = action?.toToken?.decimals || currencies[Field.OUTPUT]?.decimals || 18
      
      const transactionInfo: ExactInputSwapTransactionInfo = {
        type: TransactionType.SWAP,
        tradeType: 'EXACT_INPUT' as any,
        inputCurrencyId: action?.fromToken?.address || '',
        outputCurrencyId: action?.toToken?.address || '',
        inputCurrencyAmountRaw: action?.fromAmount || '0',
        expectedOutputCurrencyAmountRaw: estimate?.toAmount || '0',
        minimumOutputCurrencyAmountRaw: estimate?.toAmountMin || '0',
        isUniswapXOrder: false,
        inputCurrencySymbol,
        outputCurrencySymbol,
        inputCurrencyDecimals,
        outputCurrencyDecimals,
      }
      
      // @ts-ignore - TransactionResponse type
      addTransaction(tx, transactionInfo)
    } catch (err) {
      console.error('Transaction failed:', err)
      setTransactionError(err instanceof Error ? err : new Error('Transaction failed'))
      setShowTransactionModal(false)
    } finally {
      setExecuting(false)
    }
  }

  // Determine button state
  const hasBothTokens = currencies[Field.INPUT] && currencies[Field.OUTPUT]
  const hasAmount = typedValue && parseFloat(typedValue) > 0
  const hasQuote = quote && quote.result?.transactionRequest

  // Get error message for button
  const buttonError = useMemo(() => {
    if (hasInsufficientFunds && currencies[Field.INPUT]) {
      return (
        <Trans 
          i18nKey="common.insufficientTokenBalance.error" 
          values={{ tokenSymbol: currencies[Field.INPUT].symbol }} 
        />
      )
    }
    return null
  }, [hasInsufficientFunds, currencies[Field.INPUT]])

  return (
    <>
      {/* Header with Settings */}
      <AggregatorHeader>
        <div />
        <RowFixed>
          <AggregatorSettings
            order={order}
            slippage={slippage}
            selectedDexs={selectedDexs}
            chainId={currentChainId}
            onOrderChange={setOrder}
            onSlippageChange={setSlippage}
            onDexsChange={setSelectedDexs}
            compact={false}
          />
        </RowFixed>
      </AggregatorHeader>

      <div style={{ display: 'relative' }}>
        <SwapSection>
          <AggregatorSwapCurrencyInputPanel
            label={<Trans i18nKey="common.sell.label" />}
            disabled={disableTokenInputs}
            value={formattedAmounts[Field.INPUT]}
            showMaxButton={showMaxButton}
            currency={currencies[Field.INPUT] ?? null}
            currencyField={CurrencyField.INPUT}
            onUserInput={handleTypeInput}
            onMax={handleMaxInput}
            fiatValue={inputFiatValue}
            onCurrencySelect={handleInputSelect}
            otherCurrency={currencies[Field.OUTPUT]}
            id="aggregator-currency-input"
            loading={independentField === Field.OUTPUT && quoteLoading}
            ref={inputRef}
          />
        </SwapSection>
        <ArrowWrapper clickable={!!supportedChainId}>
          <ArrowContainer
            data-testid="swap-currency-button"
            onClick={() => {
              if (disableTokenInputs) {
                return
              }
              handleSwitchTokens()
            }}
            color={theme.neutral1}
          >
            <ArrowDown size="16" color={theme.neutral1} />
          </ArrowContainer>
        </ArrowWrapper>
      </div>
      <OutputSwapSection>
        <AggregatorSwapCurrencyInputPanel
          value={formattedAmounts[Field.OUTPUT]}
          disabled={disableTokenInputs}
          onUserInput={handleTypeOutput}
          label={<Trans i18nKey="common.buy.label" />}
          showMaxButton={false}
          hideBalance={false}
          fiatValue={outputFiatValue}
          currency={currencies[Field.OUTPUT] ?? null}
          currencyField={CurrencyField.OUTPUT}
          onCurrencySelect={handleOutputSelect}
          otherCurrency={currencies[Field.INPUT]}
          id="aggregator-currency-output"
          loading={independentField === Field.INPUT && quoteLoading}
          ref={outputRef}
        />
      </OutputSwapSection>

      <AggregatorQuoteDisplay quote={quote} loading={quoteLoading} error={quoteError} />

      {/* Swap Button */}
      <div style={{ marginTop: '16px' }}>
        {isDisconnected ? (
          <ButtonLight onClick={accountDrawer.open} fontWeight={535} $borderRadius="16px">
            <Trans i18nKey="common.connectWallet.button" />
          </ButtonLight>
        ) : account.isConnected && !isCorrectChain ? (
          <ButtonPrimary 
            $borderRadius="16px" 
            onClick={async () => await selectChain(currentChainId as UniverseChainId)}
            style={{ width: '100%', fontWeight: 535 }}
          >
            <Trans
              i18nKey="common.connectToChain.button"
              values={{ 
                chainName: currentChainId 
                  ? (UNIVERSE_CHAIN_INFO[currentChainId as UniverseChainId]?.label || (currentChainId === FLOW_CHAIN_ID ? 'Flow Mainnet' : 'Flow EVM Testnet'))
                  : 'Flow'
              }}
            />
          </ButtonPrimary>
        ) : isLandingPage && account.isConnected && isCorrectChain ? (
          <ButtonPrimary 
            $borderRadius="16px" 
            onClick={() => navigate('/aggregator')}
            style={{ width: '100%', fontWeight: 535 }}
          >
            Get Started
          </ButtonPrimary>
        ) : !hasBothTokens ? (
          <ButtonError disabled={true} $borderRadius="16px">
            <Text fontSize={20} color="neutralContrast">
              <Trans i18nKey="tokens.selector.button.choose" />
            </Text>
          </ButtonError>
        ) : !hasAmount ? (
          <ButtonError disabled={true} $borderRadius="16px">
            <Text fontSize={20} color="neutralContrast">
              Enter an amount
            </Text>
          </ButtonError>
        ) : quoteLoading ? (
          <ButtonError disabled={true} $borderRadius="16px">
            <Text fontSize={20} color="neutralContrast">
              Loading quote...
            </Text>
          </ButtonError>
        ) : quoteError ? (
          <ButtonError disabled={true} $borderRadius="16px">
            <Text fontSize={20} color="neutralContrast">
              Error: {quoteError}
            </Text>
          </ButtonError>
        ) : hasInsufficientFunds ? (
          <ButtonError disabled={true} $borderRadius="16px">
            <Text fontSize={20} color="neutralContrast">
              {buttonError}
            </Text>
          </ButtonError>
        ) : !hasQuote ? (
          <ButtonError disabled={true} $borderRadius="16px">
            <Text fontSize={20} color="neutralContrast">
              No quote available
            </Text>
          </ButtonError>
        ) : needsApproval ? (
          <ButtonPrimary
            disabled={isApproving || isTransactionPending}
            onClick={approve}
            $borderRadius="16px"
            style={{ width: '100%', fontWeight: 535 }}
          >
            {isApproving ? 'Approving...' : `Approve ${inputToken?.symbol || 'Token'}`}
          </ButtonPrimary>
        ) : (
          <ButtonError
            disabled={executing || isTransactionPending}
            onClick={handleExecute}
            $borderRadius="16px"
            style={{ width: '100%' }}
          >
            <Text fontSize={20} color="neutralContrast">
              {executing || isTransactionPending ? 'Processing...' : 'Execute Swap'}
            </Text>
          </ButtonError>
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
        
        {/* Transaction Modal - Shows pending, then success/failure automatically */}
        <TransactionConfirmationModal
          isOpen={showTransactionModal && !!txHash}
          onDismiss={handleTransactionModalDismiss}
          hash={txHash}
          attemptingTxn={executing && !txHash}
          pendingText={<Trans i18nKey="common.transactionSubmitted" />}
          reviewContent={() => null}
        />
        
        {/* Show error if transaction failed before getting hash */}
        {transactionError && !showTransactionModal && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: theme.surface2,
            border: `1px solid ${theme.critical}`,
            color: theme.critical,
            textAlign: 'center',
          }}>
            <Text fontSize={14} color="critical">
              Transaction failed: {transactionError.message}
            </Text>
            <ButtonLight
              onClick={() => setTransactionError(null)}
              style={{ marginTop: '8px', width: '100%' }}
            >
              <Trans i18nKey="common.close" />
            </ButtonLight>
          </div>
        )}
        
        {/* Powered by Eisen */}
        <a
          href="https://eisenfinance.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', paddingTop: '8px', paddingBottom: '20px', marginTop: '16px' }}
        >
          <Flex
            alignItems="center"
            justifyContent="center"
            gap="$gap4"
            row
          >
            <Text variant="body3" color="$neutral2">
              Powered by
            </Text>
            <EisenLogo style={{ height: '20px', width: 'auto' }} />
          </Flex>
        </a>
      </>
    )
  }

