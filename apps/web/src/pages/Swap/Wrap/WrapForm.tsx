import { InterfaceSectionName } from '@uniswap/analytics-events'
import { Currency, Token } from '@uniswap/sdk-core'
import { ButtonPrimary } from 'components/Button'
import { AutoColumn } from 'components/Column'
import SwapCurrencyInputPanel from 'components/CurrencyInputPanel/SwapCurrencyInputPanel'
import { Field } from 'components/swap/constants'
import { ArrowContainer, ArrowWrapper, Dots, OutputSwapSection, SwapSection } from 'components/swap/styled'
import { useSupportedChainId } from 'constants/chains'
import { isEitherStableChain } from 'constants/tokens'
import { useAccount } from 'hooks/useAccount'
import useSelectChain from 'hooks/useSelectChain'
import useStableWrapCallback, { StableWrapErrorText } from 'hooks/useStableWrapCallback'
import { ApprovalState, useApproval } from 'lib/hooks/useApproval'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { useTheme } from 'lib/styled-components'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown } from 'react-feather'
import { useCurrencyBalance } from 'state/connection/hooks'
import { useSwapActionHandlers } from 'state/swap/hooks'
import { CurrencyState } from 'state/swap/types'
import { useSwapAndLimitContext, useSwapContext } from 'state/swap/useSwapContext'
import { useHasPendingApproval } from 'state/transactions/hooks'
import { ThemedText } from 'theme/components'
import { USDT0_STABLE, USDT0_STABLE_TESTNET } from 'uniswap/src/constants/tokens'
import { WrapType } from 'uniswap/src/features/transactions/types/wrap'
import { Trans } from 'uniswap/src/i18n'
import { UniverseChainId } from 'uniswap/src/types/chains'
import { CurrencyField } from 'uniswap/src/types/currency'
import { logger } from 'utilities/src/logger/logger'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { didUserReject } from 'utils/swapErrorToUserReadableMessage'

interface WrapFormProps {
  disableTokenInputs?: boolean
  onCurrencyChange?: (selected: CurrencyState) => void
}

export function WrapForm({ disableTokenInputs = false, onCurrencyChange }: WrapFormProps) {
  const { chainId } = useSwapAndLimitContext()
  const supportedChainId = useSupportedChainId(chainId)
  const { swapState } = useSwapContext()
  const { typedValue, independentField } = swapState
  const { chainId: connectedChainId } = useAccount()
  const theme = useTheme()
  const account = useAccount()
  const native = useNativeCurrency(chainId)
  const chainIdWithDefault = chainId ?? UniverseChainId.Stable
  const usdt0: { [k: number]: Token } = {
    [UniverseChainId.StableTestnet]: USDT0_STABLE_TESTNET,
    [UniverseChainId.Stable]: USDT0_STABLE,
  }
  const WRAP_CONTRACT_ADDRESS: { [k: number]: string } = {
    [UniverseChainId.StableTestnet]: '0xcAB8F3ed8528655E0C2fad1C504c6CfEccf50B90',
    [UniverseChainId.Stable]: '0xDEd1660192d4d82e7c0B628ba556861EdBB5CAda',
  }

  const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers()

  const [inputCurrency, setInputCurrency] = useState<Currency | undefined>(native)
  const [outputCurrency, setOutputCurrency] = useState<Currency | undefined>(usdt0[chainIdWithDefault])

  useEffect(() => {
    if (chainId && isEitherStableChain(chainId)) {
      return
    }
    if (!inputCurrency || !outputCurrency) {
      setInputCurrency(native)
      setOutputCurrency(usdt0[chainIdWithDefault])
    }
  }, [chainId, native, usdt0, inputCurrency, outputCurrency])

  const inputBalance = useCurrencyBalance(account.address, inputCurrency ?? undefined)
  const maxInputAmount = useMemo(() => maxAmountSpend(inputBalance), [inputBalance])
  const showMaxButton = Boolean(maxInputAmount?.greaterThan(0))

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
    needsApproval,
    approve,
  } = useStableWrapCallback(inputCurrency, outputCurrency, typedValue)
  const showWrap: boolean = wrapType !== WrapType.NotApplicable

  const tokenForApproval: Token | undefined =
    inputCurrency && usdt0[chainIdWithDefault].equals(inputCurrency) ? usdt0[chainIdWithDefault] : undefined
  const inputAmount = useMemo(
    () => tryParseCurrencyAmount(typedValue, inputCurrency ?? undefined),
    [inputCurrency, typedValue],
  )
  const tokenAmountForApproval = useMemo(() => {
    if (!tokenForApproval || !inputAmount) {
      return undefined
    }
    if (inputAmount.currency.isToken) {
      return inputAmount as import('@uniswap/sdk-core').CurrencyAmount<Token>
    }
    return undefined
  }, [tokenForApproval, inputAmount])

  const [approvalState] = useApproval(
    tokenAmountForApproval,
    needsApproval ? WRAP_CONTRACT_ADDRESS[chainIdWithDefault] : undefined,
    useHasPendingApproval,
  )

  const [isApproving, setIsApproving] = useState(false)

  const isApprovalPending = useHasPendingApproval(tokenForApproval, WRAP_CONTRACT_ADDRESS[chainIdWithDefault])

  useEffect(() => {
    if (approvalState === ApprovalState.APPROVED || isApprovalPending) {
      setIsApproving(false)
    }
  }, [approvalState, isApprovalPending])

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput],
  )

  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput],
  )

  const handleSwitchTokens = useCallback(() => {
    if (!inputCurrency || !outputCurrency) {
      return
    }
    const newInput = outputCurrency
    const newOutput = inputCurrency
    setInputCurrency(newInput)
    setOutputCurrency(newOutput)
    onSwitchTokens({
      newOutputHasTax: false,
      previouslyEstimatedOutput: '',
    })
    onCurrencySelection(Field.INPUT, newInput)
    onCurrencySelection(Field.OUTPUT, newOutput)
    onCurrencyChange?.({
      inputCurrency: newInput,
      outputCurrency: newOutput,
    })
  }, [inputCurrency, outputCurrency, onSwitchTokens, onCurrencyChange, onCurrencySelection])

  const handleMaxInput = useCallback(() => {
    maxInputAmount && onUserInput(Field.INPUT, maxInputAmount.toFixed(6))
  }, [maxInputAmount, onUserInput])

  const selectChain = useSelectChain()

  const handleApprove = useCallback(async () => {
    if (!approve || isApproving) {
      return
    }

    setIsApproving(true)
    try {
      if (supportedChainId && connectedChainId !== chainId) {
        const correctChain = await selectChain(supportedChainId)
        if (!correctChain) {
          setIsApproving(false)
          return
        }
      }
      await approve()
    } catch (error) {
      setIsApproving(false)
      if (!didUserReject(error)) {
        logger.warn('WrapForm', 'handleApprove', 'Failed to approve', error)
      }
    }
  }, [approve, connectedChainId, chainId, supportedChainId, selectChain, isApproving])

  const handleOnWrap = useCallback(async () => {
    if (!onWrap) {
      return
    }

    try {
      if (supportedChainId && connectedChainId !== chainId) {
        const correctChain = await selectChain(supportedChainId)
        if (!correctChain) {
          return
        }
      }
      await onWrap()
      onUserInput(Field.INPUT, '')
    } catch (error) {
      if (!didUserReject(error)) {
        logger.warn('WrapForm', 'handleOnWrap', 'Failed to wrap', error)
      }
    }
  }, [onWrap, connectedChainId, chainId, supportedChainId, selectChain, onUserInput])

  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: typedValue,
    }),
    [dependentField, independentField, typedValue],
  )

  const inputCurrencyNumericalInputRef = useRef<HTMLInputElement>(null)

  if (chainId && !isEitherStableChain(chainId)) {
    return (
      <AutoColumn gap="md" style={{ padding: '1rem' }}>
        <ThemedText.DeprecatedMain mb="4px">
          <Trans i18nKey="common.unsupportedAsset_one" />
        </ThemedText.DeprecatedMain>
      </AutoColumn>
    )
  }

  return (
    <>
      <div style={{ display: 'relative' }}>
        <SwapSection>
          <SwapCurrencyInputPanel
            label={<Trans i18nKey="common.sell.label" />}
            disabled={disableTokenInputs}
            value={formattedAmounts[Field.INPUT]}
            showMaxButton={showMaxButton}
            currency={inputCurrency ?? null}
            currencyField={CurrencyField.INPUT}
            onUserInput={handleTypeInput}
            onMax={handleMaxInput}
            otherCurrency={outputCurrency}
            id={InterfaceSectionName.CURRENCY_INPUT_PANEL}
            ref={inputCurrencyNumericalInputRef}
            isWrapping={true}
          />
        </SwapSection>
        <ArrowWrapper clickable={!!supportedChainId}>
          <ArrowContainer
            data-testid="wrap-currency-button"
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
      <AutoColumn gap="xs">
        <div>
          <OutputSwapSection>
            <SwapCurrencyInputPanel
              value={formattedAmounts[Field.OUTPUT]}
              disabled={disableTokenInputs}
              onUserInput={handleTypeOutput}
              label={<Trans i18nKey="common.buy.label" />}
              showMaxButton={false}
              hideBalance={false}
              currency={outputCurrency ?? null}
              currencyField={CurrencyField.OUTPUT}
              otherCurrency={inputCurrency}
              id={InterfaceSectionName.CURRENCY_OUTPUT_PANEL}
            />
          </OutputSwapSection>
        </div>

        <div>
          {showWrap ? (
            needsApproval && approvalState !== ApprovalState.APPROVED ? (
              <ButtonPrimary
                $borderRadius="16px"
                disabled={!approve || approvalState === ApprovalState.PENDING || isApproving || isApprovalPending}
                onClick={handleApprove}
                fontWeight={535}
                data-testid="approve-button"
              >
                {approvalState === ApprovalState.PENDING || isApproving || isApprovalPending ? (
                  <Dots>
                    <Trans
                      i18nKey="pools.approving.amount"
                      values={{ amount: tokenForApproval?.symbol ?? inputCurrency?.symbol }}
                    />
                  </Dots>
                ) : (
                  <Trans i18nKey="common.approve" />
                )}
              </ButtonPrimary>
            ) : (
              <ButtonPrimary
                $borderRadius="16px"
                disabled={Boolean(wrapInputError)}
                onClick={handleOnWrap}
                fontWeight={535}
                data-testid="wrap-button"
              >
                {wrapInputError ? (
                  <StableWrapErrorText wrapInputError={wrapInputError} />
                ) : wrapType === WrapType.Wrap ? (
                  <Trans i18nKey="common.wrap.button" />
                ) : wrapType === WrapType.Unwrap ? (
                  <Trans i18nKey="common.unwrap.button" />
                ) : null}
              </ButtonPrimary>
            )
          ) : null}
        </div>
      </AutoColumn>
    </>
  )
}
