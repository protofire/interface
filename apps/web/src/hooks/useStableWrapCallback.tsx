import type { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount, MaxUint256, Token } from '@uniswap/sdk-core'
import { useAccount } from 'hooks/useAccount'
import { useContract } from 'hooks/useContract'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { useTokenAllowance, useUpdateTokenAllowance } from 'hooks/useTokenAllowance'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useCurrencyBalance } from 'state/connection/hooks'
import { useSwapAndLimitContext } from 'state/swap/useSwapContext'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionType } from 'state/transactions/types'
import { WrapType } from 'uniswap/src/features/transactions/types/wrap'
import { Trans } from 'uniswap/src/i18n'
import { UniverseChainId } from 'uniswap/src/types/chains'
import { USDT0_STABLE, USDT0_STABLE_TESTNET } from 'uniswap/src/constants/tokens'
import WETH_ABI from 'uniswap/src/abis/weth.json'
import { logger } from 'utilities/src/logger/logger'
import { didUserReject } from 'utils/swapErrorToUserReadableMessage'
import { isEitherStableChain } from 'constants/tokens'

const WRAP_CONTRACT_ADDRESS: { [k: number]: string } = {
  [UniverseChainId.StableTestnet]: '0xcAB8F3ed8528655E0C2fad1C504c6CfEccf50B90',
  [UniverseChainId.Stable]: '0xDEd1660192d4d82e7c0B628ba556861EdBB5CAda'
}

const NOT_APPLICABLE = { wrapType: WrapType.NotApplicable }

enum WrapInputError {
  NO_ERROR,
  ENTER_NATIVE_AMOUNT,
  ENTER_USDT0_AMOUNT,
  INSUFFICIENT_NATIVE_BALANCE,
  INSUFFICIENT_USDT0_BALANCE,
}

export function StableWrapErrorText({ wrapInputError }: { wrapInputError: WrapInputError }): JSX.Element | null {
  const { chainId } = useSwapAndLimitContext()
  const native = useNativeCurrency(chainId)

  switch (wrapInputError) {
    case WrapInputError.NO_ERROR:
      return null
    case WrapInputError.ENTER_NATIVE_AMOUNT:
      return <Trans i18nKey="swap.enterAmount" values={{ sym: native?.symbol }} />
    case WrapInputError.ENTER_USDT0_AMOUNT:
      return <Trans i18nKey="swap.enterAmount" values={{ sym: 'USDT0' }} />
    case WrapInputError.INSUFFICIENT_NATIVE_BALANCE:
      return <Trans i18nKey="common.insufficientTokenBalance.error" values={{ tokenSymbol: native?.symbol }} />
    case WrapInputError.INSUFFICIENT_USDT0_BALANCE:
      return <Trans i18nKey="common.insufficientTokenBalance.error" values={{ tokenSymbol: 'USDT0' }} />
    default:
      return null
  }
}

export default function useStableWrapCallback(
  inputCurrency: Currency | undefined | null,
  outputCurrency: Currency | undefined | null,
  typedValue: string | undefined,
): {
  wrapType: WrapType
  execute?: () => Promise<string | undefined>
  inputError?: WrapInputError
  needsApproval?: boolean
  approve?: () => Promise<void>
} {
  const account = useAccount()
  const { chainId } = useSwapAndLimitContext()
  const native = useNativeCurrency(chainId)
  const chainIdWithDefault = chainId ?? UniverseChainId.Stable;
  const usdt0: { [k: number]: Token } = {
    [UniverseChainId.StableTestnet]: USDT0_STABLE_TESTNET,
    [UniverseChainId.Stable]: USDT0_STABLE
  }

  const wrapContract = useContract(WRAP_CONTRACT_ADDRESS[chainIdWithDefault], WETH_ABI, true, chainId)
  const wrapContractRef = useRef(wrapContract)
  wrapContractRef.current = wrapContract

  const balance = useCurrencyBalance(account.address, inputCurrency ?? undefined)
  const inputAmount = useMemo(
    () => tryParseCurrencyAmount(typedValue, inputCurrency ?? undefined),
    [inputCurrency, typedValue],
  )

  const tokenForAllowance: Token | undefined = inputCurrency && usdt0[chainIdWithDefault].equals(inputCurrency) ? usdt0[chainIdWithDefault] : undefined
  const { tokenAllowance } = useTokenAllowance(
    tokenForAllowance,
    account.address,
    WRAP_CONTRACT_ADDRESS[chainIdWithDefault],
  )

  const tokenAmountForAllowance = useMemo(() => {
    if (!tokenForAllowance || !inputAmount) {
      return undefined
    }
    if (inputAmount.currency.isToken) {
      return inputAmount as CurrencyAmount<Token>
    }
    return undefined
  }, [tokenForAllowance, inputAmount])

  const updateTokenAllowance = useUpdateTokenAllowance(
    tokenAmountForAllowance,
    WRAP_CONTRACT_ADDRESS[chainIdWithDefault],
  )

  const addTransaction = useTransactionAdder()

  const handleApprove = useCallback(async () => {
    if (!tokenAmountForAllowance) {
      return
    }
    const { response: approveTx, info } = await updateTokenAllowance()
    addTransaction(approveTx, info)
  }, [tokenAmountForAllowance, updateTokenAllowance, addTransaction])

  const [error, setError] = useState<Error>()
  if (error) {
    throw error
  }

  return useMemo(() => {
    if (!wrapContractRef.current || !chainId || !inputCurrency || !outputCurrency || !native) {
      return NOT_APPLICABLE
    }

    if (!isEitherStableChain(chainId)) {
      return NOT_APPLICABLE
    }

    const hasInputAmount = Boolean(inputAmount?.greaterThan('0'))
    const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount)

    if (inputCurrency.isNative && usdt0[chainIdWithDefault].equals(outputCurrency)) {
      return {
        wrapType: WrapType.Wrap,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                const contract = wrapContractRef.current
                if (!contract) {
                  throw new Error('wrapContract is null')
                }
                const txReceipt = (await contract.deposit({ value: `0x${inputAmount.quotient.toString(16)}` })) as TransactionResponse
                addTransaction(txReceipt, {
                  type: TransactionType.WRAP,
                  unwrapped: false,
                  currencyAmountRaw: inputAmount?.quotient.toString(),
                  chainId,
                })
                return txReceipt.hash
              }
            : undefined,
        inputError: sufficientBalance
          ? undefined
          : hasInputAmount
            ? WrapInputError.INSUFFICIENT_NATIVE_BALANCE
            : WrapInputError.ENTER_NATIVE_AMOUNT,
      }
    } else if (usdt0[chainIdWithDefault].equals(inputCurrency) && outputCurrency.isNative) {
      const needsApproval = inputAmount && tokenAllowance ? tokenAllowance.lessThan(inputAmount) : false

      return {
        wrapType: WrapType.Unwrap,
        needsApproval,
        approve: needsApproval ? handleApprove : undefined,
        execute:
          sufficientBalance && inputAmount && !needsApproval
            ? async () => {
                try {
                  const contract = wrapContractRef.current
                  if (!contract) {
                    throw new Error('wrapContract is null')
                  }
                  const txReceipt = (await contract.withdraw(`0x${inputAmount.quotient.toString(16)}`)) as TransactionResponse
                  addTransaction(txReceipt, {
                    type: TransactionType.WRAP,
                    unwrapped: true,
                    currencyAmountRaw: inputAmount?.quotient.toString(),
                    chainId,
                  })
                  return txReceipt.hash
                } catch (error) {
                  if (!didUserReject(error)) {
                    logger.warn('useStableWrapCallback', 'useStableWrapCallback', 'Failed to wrap', error)
                  }
                  throw error
                }
              }
            : undefined,
        inputError: sufficientBalance
          ? undefined
          : hasInputAmount
            ? WrapInputError.INSUFFICIENT_USDT0_BALANCE
            : WrapInputError.ENTER_USDT0_AMOUNT,
      }
    } else {
      return NOT_APPLICABLE
    }
  }, [
    chainId,
    inputCurrency,
    outputCurrency,
    inputAmount,
    balance,
    addTransaction,
    native,
    usdt0,
    tokenAllowance,
    handleApprove,
  ])
}
