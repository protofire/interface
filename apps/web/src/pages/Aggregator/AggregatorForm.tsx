import { Currency, Token } from '@uniswap/sdk-core'
import { parseUnits } from '@ethersproject/units'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionRequest } from '@ethersproject/abstract-provider'
import { useAccountDrawer } from 'components/AccountDrawer/MiniPortfolio/hooks'
import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'
import { Field } from 'components/swap/constants'
import { ArrowContainer, ArrowWrapper, OutputSwapSection, SwapSection } from 'components/swap/styled'
import { useAccount } from 'hooks/useAccount'
import { useTheme } from 'lib/styled-components'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { ArrowDown } from 'react-feather'
import { Trans } from 'uniswap/src/i18n'
import { CurrencyField } from 'uniswap/src/types/currency'
import AggregatorSwapCurrencyInputPanel from './AggregatorSwapCurrencyInputPanel'
import { useEisenQuote } from './useEisenQuote'
import { FLOW_CHAIN_ID } from './mockTokenData'
import { useEisenDexs } from './useEisenDexs'
import { useEisenTokens } from './useEisenTokens'
import { mockTokenToToken } from './mockTokenData'
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
import { AggregatorSwapModal } from './AggregatorSwapModal'
import { ReactComponent as EisenLogo } from 'assets/svg/eisen.svg'
import useSelectChain from 'hooks/useSelectChain'
import { UNIVERSE_CHAIN_INFO } from 'uniswap/src/constants/chains'
import { UniverseChainId } from 'uniswap/src/types/chains'
import { useNavigate } from 'react-router-dom'
import { serializeSwapStateToURLParameters, queryParametersToCurrencyState } from 'state/swap/hooks'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { useCurrency } from 'hooks/Tokens'
import { currencyId } from 'utils/currencyId'
import { didUserReject } from 'utils/swapErrorToUserReadableMessage'
import { isAddress } from 'utilities/src/addresses'
import { NATIVE_CHAIN_ID } from 'constants/tokens'

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

  const parsedQs = useParsedQueryString()
  const parsedCurrencyState = useMemo(() => {
    return queryParametersToCurrencyState(parsedQs)
  }, [parsedQs])

  const [order, setOrder] = useState<OrderType>('CHEAPEST')
  const [slippage, setSlippage] = useState<number>(0.005)
  const [selectedDexs, setSelectedDexs] = useState<string[]>([])
  const [maxsplit, setMaxsplit] = useState<number>(5)
  const [maxedge, setMaxedge] = useState<number>(4)
  const [quoteResetKey, setQuoteResetKey] = useState<number>(0)

  const currentChainId = useMemo(() => {
    if (parsedCurrencyState.chainId === FLOW_CHAIN_ID) {
      return parsedCurrencyState.chainId
    }
    return FLOW_CHAIN_ID
  }, [parsedCurrencyState.chainId])

  const isCorrectChain = useMemo(() => {
    if (!account.chainId) return false
    return account.chainId === FLOW_CHAIN_ID
  }, [account.chainId])

  const urlInputCurrency = useCurrency(parsedCurrencyState.inputCurrencyId, currentChainId)
  const urlOutputCurrency = useCurrency(parsedCurrencyState.outputCurrencyId, currentChainId)
  
  const { tokens: eisenTokens, loading: eisenTokensLoading } = useEisenTokens(currentChainId)
  
  const isTokenAddress = useCallback((currencyId: string | undefined): boolean => {
    if (!currencyId) return false
    const lowerId = currencyId.toLowerCase()
    if ([NATIVE_CHAIN_ID, 'native', 'eth'].includes(lowerId)) {
      return false
    }
    return isAddress(currencyId) !== false
  }, [])
  
  const inputCurrencyIdIsAddress = useMemo(() => {
    return isTokenAddress(parsedCurrencyState.inputCurrencyId)
  }, [parsedCurrencyState.inputCurrencyId, isTokenAddress])
  
  const outputCurrencyIdIsAddress = useMemo(() => {
    return isTokenAddress(parsedCurrencyState.outputCurrencyId)
  }, [parsedCurrencyState.outputCurrencyId, isTokenAddress])
  
  const eisenInputCurrency = useMemo(() => {
    if (!inputCurrencyIdIsAddress || !parsedCurrencyState.inputCurrencyId || eisenTokensLoading) {
      return null
    }
    const address = parsedCurrencyState.inputCurrencyId.toLowerCase()
    const token = eisenTokens.find(t => t.address.toLowerCase() === address)
    return token ? mockTokenToToken(token) : null
  }, [inputCurrencyIdIsAddress, parsedCurrencyState.inputCurrencyId, eisenTokens, eisenTokensLoading])
  
  const eisenOutputCurrency = useMemo(() => {
    if (!outputCurrencyIdIsAddress || !parsedCurrencyState.outputCurrencyId || eisenTokensLoading) {
      return null
    }
    const address = parsedCurrencyState.outputCurrencyId.toLowerCase()
    const token = eisenTokens.find(t => t.address.toLowerCase() === address)
    return token ? mockTokenToToken(token) : null
  }, [outputCurrencyIdIsAddress, parsedCurrencyState.outputCurrencyId, eisenTokens, eisenTokensLoading])
  
  const resolvedInputCurrency = eisenInputCurrency || urlInputCurrency
  const resolvedOutputCurrency = eisenOutputCurrency || urlOutputCurrency
  
  const [hasInitializedFromUrl, setHasInitializedFromUrl] = useState(false)

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

  useEffect(() => {
    if (!hasInitializedFromUrl) {
      if ((inputCurrencyIdIsAddress || outputCurrencyIdIsAddress) && eisenTokensLoading) {
        return
      }
      
      let updated = false

      if (resolvedInputCurrency && !currencyState.inputCurrency) {
        setCurrencyState((prev) => ({
          ...prev,
          inputCurrency: resolvedInputCurrency,
        }))
        updated = true
      }

      if (resolvedOutputCurrency && !currencyState.outputCurrency) {
        setCurrencyState((prev) => ({
          ...prev,
          outputCurrency: resolvedOutputCurrency,
        }))
        updated = true
      }

      if (parsedCurrencyState.value && swapState.typedValue === '') {
        setSwapState({
          typedValue: parsedCurrencyState.value,
          independentField: parsedCurrencyState.field === 'OUTPUT' ? Field.OUTPUT : Field.INPUT,
        })
        updated = true
      }

      if (updated || resolvedInputCurrency || resolvedOutputCurrency || parsedCurrencyState.value || (!eisenTokensLoading && (inputCurrencyIdIsAddress || outputCurrencyIdIsAddress))) {
        setHasInitializedFromUrl(true)
      }
    }
  }, [
    hasInitializedFromUrl,
    resolvedInputCurrency,
    resolvedOutputCurrency,
    parsedCurrencyState.value,
    parsedCurrencyState.field,
    currencyState.inputCurrency,
    currencyState.outputCurrency,
    swapState.typedValue,
    inputCurrencyIdIsAddress,
    outputCurrencyIdIsAddress,
    eisenTokensLoading,
  ])

  useEffect(() => {
    // TODO: enable landing page
    // if (isLandingPage) {
    //   return
    // }
    if (currencyState.inputCurrency || currencyState.outputCurrency) {
      const serializedSwapState = serializeSwapStateToURLParameters({
        inputCurrency: currencyState.inputCurrency ?? undefined,
        outputCurrency: currencyState.outputCurrency ?? undefined,
        typedValue: swapState.typedValue,
        independentField: swapState.independentField,
        chainId: currentChainId ?? UniverseChainId.FlowMainnet,
      })
      navigate('/aggregator' + serializedSwapState, { replace: true })
    }
  }, [currencyState.inputCurrency, currencyState.outputCurrency, swapState.typedValue, swapState.independentField, currentChainId, navigate, isLandingPage])

  const [executing, setExecuting] = useState(false)
  const [txHash, setTxHash] = useState<string | undefined>(undefined)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [transactionError, setTransactionError] = useState<Error | null>(null)
  const [wasCancelled, setWasCancelled] = useState(false)

  const DEFAULT_INPUT_TOKEN_ADDRESS = '0xF1815bd50389c46847f0Bda824eC8da914045D14'
  const defaultInputCurrencyFromHook = useCurrency(DEFAULT_INPUT_TOKEN_ADDRESS, currentChainId)
  
  const defaultInputCurrencyFromEisen = useMemo(() => {
    if (eisenTokensLoading) return null
    const token = eisenTokens.find(t => t.address.toLowerCase() === DEFAULT_INPUT_TOKEN_ADDRESS.toLowerCase())
    return token ? mockTokenToToken(token) : null
  }, [eisenTokens, eisenTokensLoading])
  
  const defaultInputCurrency = defaultInputCurrencyFromEisen || defaultInputCurrencyFromHook

  useEffect(() => {
    const hasUrlParams = parsedCurrencyState.inputCurrencyId || parsedCurrencyState.outputCurrencyId
    
    if (!hasUrlParams && !currencyState.inputCurrency && !currencyState.outputCurrency && currentChainId && !eisenTokensLoading) {
      setCurrencyState({
        inputCurrency: defaultInputCurrency || null,
        outputCurrency: nativeOnChain(currentChainId),
      })
    }
  }, [currentChainId, currencyState.inputCurrency, currencyState.outputCurrency, defaultInputCurrency, parsedCurrencyState.inputCurrencyId, parsedCurrencyState.outputCurrencyId, eisenTokensLoading])

  const isTransactionPending = useIsTransactionPending(txHash)
  const isTransactionConfirmed = useIsTransactionConfirmed(txHash)

  const handleTransactionModalDismiss = useCallback(() => {
    setShowTransactionModal(false)
    setTransactionError(null)
    setExecuting(false)
    setTxHash(undefined)
    
    if (!wasCancelled) {
      setSwapState({
        typedValue: '',
        independentField: Field.INPUT,
      })
      setCurrencyState({
        inputCurrency: defaultInputCurrency || null,
        outputCurrency: nativeOnChain(currentChainId),
      })
      setQuoteResetKey(prev => prev + 1)
    }
    
    setWasCancelled(false)
  }, [currentChainId, wasCancelled, defaultInputCurrency])

  const { typedValue, independentField } = swapState

  const currencies = useMemo(
    () => ({
      [Field.INPUT]: currencyState.inputCurrency,
      [Field.OUTPUT]: currencyState.outputCurrency,
    }),
    [currencyState]
  )

  const inputCurrencyBalance = useCurrencyBalance(account.address, currencies[Field.INPUT] ?? undefined)

  const parsedAmount = useMemo(() => {
    if (!typedValue || !currencies[Field.INPUT]) {
      return undefined
    }
    return tryParseCurrencyAmount(typedValue, currencies[Field.INPUT])
  }, [typedValue, currencies[Field.INPUT]])

  const maxInputAmount = useMemo(
    () => maxAmountSpend(inputCurrencyBalance),
    [inputCurrencyBalance]
  )

  const showMaxButton = Boolean(
    maxInputAmount?.greaterThan(0) &&
    (!parsedAmount || !parsedAmount.equalTo(maxInputAmount))
  )

  const hasInsufficientFunds = useMemo(() => {
    if (!parsedAmount || !inputCurrencyBalance) {
      return false
    }
    return inputCurrencyBalance.lessThan(parsedAmount)
  }, [parsedAmount, inputCurrencyBalance])

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const inputFiatValue = undefined
  const outputFiatValue = undefined

  const { dexs: availableDexs } = useEisenDexs(currentChainId)

  const quoteParams = useMemo(() => {
    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT] || !account.address) {
      return null
    }

    // Eisen API only accepts input amounts (fromAmount)
    if (independentField !== Field.INPUT) {
      return null
    }

    if (!typedValue || typedValue.trim() === '') {
      return null
    }

    const parsedValue = parseFloat(typedValue)
    if (isNaN(parsedValue) || parsedValue <= 0) {
      return null
    }

    const inputCurrency = currencies[Field.INPUT]
    const decimals = inputCurrency?.decimals || 18
    let fromAmountWei: string
    try {
      fromAmountWei = parseUnits(typedValue, decimals).toString()
      if (fromAmountWei === '0') {
        return null
      }
    } catch (error) {
      console.error('Error parsing amount:', error)
      return null
    }

    const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    const fromToken = inputCurrency?.isNative
      ? NATIVE_TOKEN_ADDRESS
      : inputCurrency?.address || ''
    const toToken = currencies[Field.OUTPUT]?.isNative
      ? NATIVE_TOKEN_ADDRESS
      : currencies[Field.OUTPUT]?.address || ''

    let includedDex: string | undefined = undefined

    const allDexsSelected = availableDexs.length > 0 &&
      selectedDexs.length === availableDexs.length &&
      availableDexs.every(dex => selectedDexs.includes(dex))

    if (!allDexsSelected && selectedDexs.length > 0) {
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
      fee: '0',
      integrator: 'flow-swap',
      maxSplit: maxsplit,
      maxEdge: maxedge,
    }

    if (includedDex) {
      params.includedDex = includedDex
    }

    return params
  }, [currencies, typedValue, independentField, account.address, currentChainId, order, slippage, selectedDexs, availableDexs, maxsplit, maxedge])

  const { quote, loading: quoteLoading, error: quoteError } = useEisenQuote(quoteParams)

  const estimatedOutput = useMemo(() => {
    if (quote?.result?.estimate && currencies[Field.OUTPUT]) {
      const outputCurrency = currencies[Field.OUTPUT]
      const decimals = outputCurrency?.decimals || 6

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

        const remainderStr = remainder.toString().padStart(decimals, '0')
        const trimmedRemainder = remainderStr.replace(/0+$/, '')
        return `${quotient}.${trimmedRemainder}`
      }

      const expectedOutput = formatAmount(expectedOutputWei, decimals)
      return expectedOutput
    }
    return ''
  }, [quote, currencies])

  const handleTypeInput = useCallback((value: string) => {
    setSwapState((prev) => ({ ...prev, typedValue: value, independentField: Field.INPUT }))
  }, [])

  const handleTypeOutput = useCallback((value: string) => {
    setSwapState((prev) => ({ ...prev, typedValue: value, independentField: Field.OUTPUT }))
  }, [])

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

  const handleSwitchTokens = useCallback(() => {
    setCurrencyState((prev) => ({
      inputCurrency: prev.outputCurrency,
      outputCurrency: prev.inputCurrency,
    }))
    setSwapState((prev) => ({
      ...prev,
      typedValue: estimatedOutput || '',
      independentField: Field.INPUT,
    }))
  }, [estimatedOutput])

  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue || '',
      [dependentField]: quoteLoading ? '...' : (estimatedOutput || ''),
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
  const provider = useEthersProvider({ chainId: account.chainId })
  const addTransaction = useTransactionAdder()

  const inputToken = quote?.result?.action?.fromToken
  const routerAddress = quote?.result?.transactionRequest?.to
  const fromAmount = quote?.result?.action?.fromAmount

  const tokenForApproval = inputToken && !inputToken.address.toLowerCase().includes('eeee') ? new Token(
    inputToken.chainId,
    inputToken.address,
    inputToken.decimals,
    inputToken.symbol,
    inputToken.name
  ) : null

  const { needsApproval, isApproving, approvalPending, approve, error: approvalError } = useTokenApproval(
    tokenForApproval,
    routerAddress || null,
    fromAmount || null,
    inputToken?.logoURI
  )

  const handleExecute = async () => {
    const txnRequest = quote?.result?.transactionRequest
    if (!txnRequest || !account.address || !provider) {
      return
    }

    setExecuting(true)
    setTransactionError(null)
    setTxHash(undefined)
    setWasCancelled(false)
    setShowTransactionModal(true)

    try {
      const signer = provider.getSigner()

      const txRequest: TransactionRequest = {
        from: account.address,
        to: txnRequest.to,
        data: txnRequest.data as `0x${string}`,
        gasPrice: txnRequest.gasPrice,
        value: txnRequest.value,
      }

      let gasLimit: BigNumber
      try {
        const gasEstimate = await provider.estimateGas(txRequest)
        gasLimit = calculateGasMargin(gasEstimate)
      } catch (gasError) {
        console.warn('Failed to estimate gas, using quote gasLimit:', gasError)
        gasLimit = BigNumber.from(txnRequest.gasLimit)
      }

      const tx = await signer.sendTransaction({
        ...txRequest,
        gasLimit,
      })

      setTxHash(tx.hash)
      setShowTransactionModal(true)

      const action = quote?.result?.action
      const estimate = quote?.result?.estimate

      const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
      const inputCurrencyId = currencies[Field.INPUT] 
        ? currencyId(currencies[Field.INPUT])
        : (action?.fromToken?.address?.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() 
            ? 'ETH' 
            : action?.fromToken?.address || '')
      const outputCurrencyId = currencies[Field.OUTPUT]
        ? currencyId(currencies[Field.OUTPUT])
        : (action?.toToken?.address?.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
            ? 'ETH'
            : action?.toToken?.address || '')

      const transactionInfo: ExactInputSwapTransactionInfo = {
        type: TransactionType.SWAP,
        tradeType: 'EXACT_INPUT' as any,
        inputCurrencyId,
        outputCurrencyId,
        inputCurrencyAmountRaw: action?.fromAmount || '0',
        expectedOutputCurrencyAmountRaw: estimate?.toAmount || '0',
        minimumOutputCurrencyAmountRaw: estimate?.toAmountMin || '0',
        isUniswapXOrder: false,
        inputCurrencySymbol: action?.fromToken?.symbol || currencies[Field.INPUT]?.symbol,
        outputCurrencySymbol: action?.toToken?.symbol || currencies[Field.OUTPUT]?.symbol,
        inputLogoURI: action?.fromToken?.logoURI,
        outputLogoURI: action?.toToken?.logoURI,
      } as any

      // @ts-ignore - TransactionResponse type
      addTransaction(tx, transactionInfo)
    } catch (err) {
      console.error('Transaction failed:', err)
      
      if (didUserReject(err)) {
        setWasCancelled(true)
        setShowTransactionModal(false)
        setTransactionError(null)
        setExecuting(false)
        setTxHash(undefined)
        return
      }
      
      setTransactionError(err instanceof Error ? err : new Error('Transaction failed'))
      setShowTransactionModal(true)
    } finally {
      setExecuting(false)
    }
  }

  const hasBothTokens = currencies[Field.INPUT] && currencies[Field.OUTPUT]
  const hasAmount = typedValue && parseFloat(typedValue) > 0
  const hasQuote = quote && quote.result?.transactionRequest

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
      <AggregatorHeader>
        <div />
        <RowFixed>
          <AggregatorSettings
            order={order}
            slippage={slippage}
            selectedDexs={selectedDexs}
            chainId={currentChainId}
            maxsplit={maxsplit}
            maxedge={maxedge}
            onOrderChange={setOrder}
            onSlippageChange={setSlippage}
            onDexsChange={setSelectedDexs}
            onMaxsplitChange={setMaxsplit}
            onMaxedgeChange={setMaxedge}
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
            initialCurrencyLoading={inputCurrencyIdIsAddress && eisenTokensLoading}
          />
        </SwapSection>
        <ArrowWrapper clickable={!!chainId}>
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
          readonly={true}
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
            initialCurrencyLoading={outputCurrencyIdIsAddress && eisenTokensLoading}
        />
      </OutputSwapSection>

      <AggregatorQuoteDisplay 
        key={`quote-${quoteResetKey}-${typedValue}-${currencies[Field.INPUT]?.symbol}-${currencies[Field.OUTPUT]?.symbol}`}
        quote={quote} 
        loading={quoteLoading} 
        error={quoteError}
        slippage={slippage}
      />

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
                  ? (UNIVERSE_CHAIN_INFO[currentChainId as UniverseChainId]?.label || 'Flow Mainnet')
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
            disabled={isApproving || approvalPending || isTransactionPending}
            onClick={approve}
            $borderRadius="16px"
            style={{ width: '100%', fontWeight: 535 }}
          >
            {isApproving ? 'Approving...' : approvalPending ? 'Approval pending...' : `Approve ${inputToken?.symbol || 'Token'}`}
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

        <AggregatorSwapModal
          key={`swap-modal-${quoteResetKey}`}
          isOpen={(executing || showTransactionModal) && !!(currencies[Field.INPUT] && currencies[Field.OUTPUT])}
          onDismiss={handleTransactionModalDismiss}
          inputCurrency={currencies[Field.INPUT]}
          outputCurrency={currencies[Field.OUTPUT]}
          inputAmount={quote?.result?.action?.fromAmount || '0'}
          outputAmount={quote?.result?.estimate?.toAmount || '0'}
          inputLogoURI={quote?.result?.action?.fromToken?.logoURI}
          outputLogoURI={quote?.result?.action?.toToken?.logoURI}
          txHash={txHash}
          error={transactionError}
          attemptingTxn={executing && !txHash && !transactionError}
        />

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
            <EisenLogo style={{ height: '16px', width: 'auto' }} />
          </Flex>
        </a>
      </>
    )
  }

