import { BigNumber } from '@ethersproject/bignumber'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { Currency, CurrencyAmount, TradeType, Token } from '@uniswap/sdk-core'
import UniswapXBolt from 'assets/svg/bolt.svg'
import { getCurrency } from 'components/AccountDrawer/MiniPortfolio/Activity/getCurrency'
import { Activity, ActivityMap } from 'components/AccountDrawer/MiniPortfolio/Activity/types'
import {
  CancelledTransactionTitleTable,
  LimitOrderTextTable,
  OrderTextTable,
  getActivityTitle,
} from 'components/AccountDrawer/MiniPortfolio/constants'
import { SupportedInterfaceChainId } from 'constants/chains'
import { nativeOnChain } from 'constants/tokens'
import { ChainTokenMap, useAllTokensMultichain } from 'hooks/TokensLegacy'
import { isOnChainOrder, useAllSignatures } from 'state/signatures/hooks'
import { SignatureDetails, SignatureType } from 'state/signatures/types'
import { isConfirmedTx, useMultichainTransactions } from 'state/transactions/hooks'
import {
  AddLiquidityV2PoolTransactionInfo,
  AddLiquidityV3PoolTransactionInfo,
  ApproveTransactionInfo,
  CollectFeesTransactionInfo,
  CreateV3PoolTransactionInfo,
  ExactInputSwapTransactionInfo,
  ExactOutputSwapTransactionInfo,
  MigrateV2LiquidityToV3TransactionInfo,
  RemoveLiquidityV3TransactionInfo,
  SendTransactionInfo,
  TransactionDetails,
  TransactionType,
  WrapTransactionInfo,
} from 'state/transactions/types'
import { TransactionStatus } from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'
import { t } from 'uniswap/src/i18n'
import { InterfaceChainId } from 'uniswap/src/types/chains'
import { isAddress } from 'utilities/src/addresses'
import { logger } from 'utilities/src/logger/logger'
import { NumberType, useFormatter } from 'utils/formatNumbers'

type FormatNumberFunctionType = ReturnType<typeof useFormatter>['formatNumber']

function buildCurrencyDescriptor(
  currencyA: Currency | undefined,
  amtA: string,
  currencyB: Currency | undefined,
  amtB: string,
  formatNumber: FormatNumberFunctionType,
  isSwap = false,
) {
  // Ensure amounts are valid strings (not undefined)
  const safeAmtA = amtA || '0'
  const safeAmtB = amtB || '0'
  
  const formattedA = currencyA && safeAmtA
    ? formatNumber({
        input: parseFloat(CurrencyAmount.fromRawAmount(currencyA, safeAmtA).toSignificant()),
        type: NumberType.TokenNonTx,
      })
    : t('common.unknown')
  const symbolA = currencyA?.symbol ? ` ${currencyA?.symbol}` : ''
  const formattedB = currencyB && safeAmtB
    ? formatNumber({
        input: parseFloat(CurrencyAmount.fromRawAmount(currencyB, safeAmtB).toSignificant()),
        type: NumberType.TokenNonTx,
      })
    : t('common.unknown')
  const symbolB = currencyB?.symbol ? ` ${currencyB?.symbol}` : ''

  const amountWithSymbolA = `${formattedA}${symbolA}`
  const amountWithSymbolB = `${formattedB}${symbolB}`

  return isSwap
    ? t('activity.transaction.swap.descriptor', {
        amountWithSymbolA,
        amountWithSymbolB,
      })
    : t('activity.transaction.tokens.descriptor', {
        amountWithSymbolA,
        amountWithSymbolB,
      })
}

async function parseSwap(
  swap: ExactInputSwapTransactionInfo | ExactOutputSwapTransactionInfo,
  chainId: SupportedInterfaceChainId,
  formatNumber: FormatNumberFunctionType,
  tokens?: ChainTokenMap,
): Promise<Partial<Activity>> {
  const [tokenIn, tokenOut] = await Promise.all([
    getCurrency(swap.inputCurrencyId, chainId, tokens),
    getCurrency(swap.outputCurrencyId, chainId, tokens),
  ])
  const [inputRaw, outputRaw] =
    swap.tradeType === TradeType.EXACT_INPUT
      ? [swap.inputCurrencyAmountRaw, swap.settledOutputCurrencyAmountRaw ?? swap.expectedOutputCurrencyAmountRaw]
      : [swap.expectedInputCurrencyAmountRaw, swap.outputCurrencyAmountRaw]

  // If currencies couldn't be resolved and we have symbols stored, use them
  const inputSymbol = tokenIn?.symbol || (swap as any).inputCurrencySymbol || undefined
  const outputSymbol = tokenOut?.symbol || (swap as any).outputCurrencySymbol || undefined
  const inputDecimals = (swap as any).inputCurrencyDecimals || tokenIn?.decimals || 18
  const outputDecimals = (swap as any).outputCurrencyDecimals || tokenOut?.decimals || 18
  
  // Ensure raw amounts are valid strings (not undefined)
  const safeInputRaw = inputRaw || '0'
  const safeOutputRaw = outputRaw || '0'
  
  // Create a custom descriptor if we have symbols but no currency objects
  let descriptor: string
  if ((!tokenIn || !tokenOut) && inputSymbol && outputSymbol && safeInputRaw && safeOutputRaw) {
    try {
      // Use stored symbols when currency objects aren't available
      // Create temporary Token objects with stored decimals for proper formatting
      const tempInputToken = tokenIn || new Token(chainId, swap.inputCurrencyId || '0x0', inputDecimals, inputSymbol, inputSymbol)
      const tempOutputToken = tokenOut || new Token(chainId, swap.outputCurrencyId || '0x0', outputDecimals, outputSymbol, outputSymbol)
      
      const inputAmount = parseFloat(CurrencyAmount.fromRawAmount(tempInputToken, safeInputRaw).toSignificant())
      const outputAmount = parseFloat(CurrencyAmount.fromRawAmount(tempOutputToken, safeOutputRaw).toSignificant())
      
      // Check if amounts are effectively 0 or invalid - if so, hide amounts
      const isInputZero = isNaN(inputAmount) || inputAmount === 0 || inputAmount < 0.000001
      const isOutputZero = isNaN(outputAmount) || outputAmount === 0 || outputAmount < 0.000001
      
      if (isInputZero || isOutputZero) {
        // Hide amounts, just show symbols
        descriptor = t('activity.transaction.swap.descriptor', {
          amountWithSymbolA: inputSymbol,
          amountWithSymbolB: outputSymbol,
        })
      } else {
        const formattedA = formatNumber({
          input: inputAmount,
          type: NumberType.TokenNonTx,
        })
        const formattedB = formatNumber({
          input: outputAmount,
          type: NumberType.TokenNonTx,
        })
        descriptor = t('activity.transaction.swap.descriptor', {
          amountWithSymbolA: `${formattedA} ${inputSymbol}`,
          amountWithSymbolB: `${formattedB} ${outputSymbol}`,
        })
      }
    } catch (error) {
      // Fallback: if we have symbols, show them without amounts
      if (inputSymbol && outputSymbol) {
        descriptor = t('activity.transaction.swap.descriptor', {
          amountWithSymbolA: inputSymbol,
          amountWithSymbolB: outputSymbol,
        })
      } else {
        // Fallback to buildCurrencyDescriptor if there's an error
        descriptor = buildCurrencyDescriptor(tokenIn, safeInputRaw, tokenOut, safeOutputRaw, formatNumber, true)
      }
    }
  } else {
    // Check if amounts are effectively 0 before building descriptor
    try {
      if (tokenIn && tokenOut && safeInputRaw !== '0' && safeOutputRaw !== '0') {
        const inputAmount = parseFloat(CurrencyAmount.fromRawAmount(tokenIn, safeInputRaw).toSignificant())
        const outputAmount = parseFloat(CurrencyAmount.fromRawAmount(tokenOut, safeOutputRaw).toSignificant())
        const isInputZero = isNaN(inputAmount) || inputAmount === 0 || inputAmount < 0.000001
        const isOutputZero = isNaN(outputAmount) || outputAmount === 0 || outputAmount < 0.000001
        
        if (isInputZero || isOutputZero) {
          // Hide amounts, just show symbols
          const inputSym = tokenIn.symbol || inputSymbol || 'Unknown'
          const outputSym = tokenOut.symbol || outputSymbol || 'Unknown'
          descriptor = t('activity.transaction.swap.descriptor', {
            amountWithSymbolA: inputSym,
            amountWithSymbolB: outputSym,
          })
        } else {
          descriptor = buildCurrencyDescriptor(tokenIn, safeInputRaw, tokenOut, safeOutputRaw, formatNumber, true)
        }
      } else {
        descriptor = buildCurrencyDescriptor(tokenIn, safeInputRaw, tokenOut, safeOutputRaw, formatNumber, true)
      }
    } catch (error) {
      // Fallback: if we have symbols, show them without amounts
      if (inputSymbol && outputSymbol) {
        descriptor = t('activity.transaction.swap.descriptor', {
          amountWithSymbolA: inputSymbol,
          amountWithSymbolB: outputSymbol,
        })
      } else {
        descriptor = buildCurrencyDescriptor(tokenIn, safeInputRaw, tokenOut, safeOutputRaw, formatNumber, true)
      }
    }
  }

  return {
    descriptor,
    currencies: [tokenIn, tokenOut],
    prefixIconSrc: swap.isUniswapXOrder ? UniswapXBolt : undefined,
  }
}

function parseWrap(
  wrap: WrapTransactionInfo,
  chainId: InterfaceChainId,
  status: TransactionStatus,
  formatNumber: FormatNumberFunctionType,
): Partial<Activity> {
  const native = nativeOnChain(chainId)
  const wrapped = native.wrapped
  const [input, output] = wrap.unwrapped ? [wrapped, native] : [native, wrapped]

  const descriptor = buildCurrencyDescriptor(
    input,
    wrap.currencyAmountRaw,
    output,
    wrap.currencyAmountRaw,
    formatNumber,
    true,
  )
  const title = getActivityTitle(TransactionType.WRAP, status, wrap.unwrapped)
  const currencies = wrap.unwrapped ? [wrapped, native] : [native, wrapped]

  return { title, descriptor, currencies }
}

async function parseApproval(
  approval: ApproveTransactionInfo,
  chainId: SupportedInterfaceChainId,
  status: TransactionStatus,
  tokens?: ChainTokenMap,
): Promise<Partial<Activity>> {
  const currency = await getCurrency(approval.tokenAddress, chainId, tokens)
  const descriptor = currency?.symbol ?? currency?.name ?? t('common.unknown')
  return {
    title: getActivityTitle(
      TransactionType.APPROVAL,
      status,
      BigNumber.from(approval.amount).eq(0) /* use alternate if it's a revoke */,
    ),
    descriptor,
    currencies: [currency],
  }
}

type GenericLPInfo = Omit<
  AddLiquidityV3PoolTransactionInfo | RemoveLiquidityV3TransactionInfo | AddLiquidityV2PoolTransactionInfo,
  'type'
>
async function parseLP(
  lp: GenericLPInfo,
  chainId: SupportedInterfaceChainId,
  formatNumber: FormatNumberFunctionType,
  tokens?: ChainTokenMap,
): Promise<Partial<Activity>> {
  // const baseCurrency = getCurrency(lp.baseCurrencyId, chainId, tokens)
  // const quoteCurrency = getCurrency(lp.quoteCurrencyId, chainId, tokens)
  // const [baseRaw, quoteRaw] = [lp.expectedAmountBaseRaw, lp.expectedAmountQuoteRaw]
  // const descriptor = buildCurrencyDescriptor(baseCurrency, baseRaw, quoteCurrency, quoteRaw, formatNumber, t`and`)

  // return { descriptor, currencies: [baseCurrency, quoteCurrency] }

  const [baseCurrency, quoteCurrency] = await Promise.all([
    getCurrency(lp.baseCurrencyId, chainId, tokens),
    getCurrency(lp.quoteCurrencyId, chainId, tokens),
  ])

  const [baseRaw, quoteRaw] = [lp.expectedAmountBaseRaw, lp.expectedAmountQuoteRaw]
  const descriptor = buildCurrencyDescriptor(baseCurrency, baseRaw, quoteCurrency, quoteRaw, formatNumber)

  return { descriptor, currencies: [baseCurrency, quoteCurrency] }
}

async function parseCollectFees(
  collect: CollectFeesTransactionInfo,
  chainId: SupportedInterfaceChainId,
  formatNumber: FormatNumberFunctionType,
  tokens?: ChainTokenMap,
): Promise<Partial<Activity>> {
  // Adapts CollectFeesTransactionInfo to generic LP type
  const {
    currencyId0: baseCurrencyId,
    currencyId1: quoteCurrencyId,
    expectedCurrencyOwed0: expectedAmountBaseRaw,
    expectedCurrencyOwed1: expectedAmountQuoteRaw,
  } = collect
  return parseLP(
    { baseCurrencyId, quoteCurrencyId, expectedAmountBaseRaw, expectedAmountQuoteRaw },
    chainId,
    formatNumber,
    tokens,
  )
}

async function parseMigrateCreateV3(
  lp: MigrateV2LiquidityToV3TransactionInfo | CreateV3PoolTransactionInfo,
  chainId: SupportedInterfaceChainId,
  tokens?: ChainTokenMap,
): Promise<Partial<Activity>> {
  const [baseCurrency, quoteCurrency] = await Promise.all([
    getCurrency(lp.baseCurrencyId, chainId, tokens),
    getCurrency(lp.quoteCurrencyId, chainId, tokens),
  ])
  const baseSymbol = baseCurrency?.symbol ?? t('common.unknown')
  const quoteSymbol = quoteCurrency?.symbol ?? t('common.unknown')
  const descriptor = t('activity.transaction.tokens.descriptor', {
    amountWithSymbolA: baseSymbol,
    amountWithSymbolB: quoteSymbol,
  })

  return { descriptor, currencies: [baseCurrency, quoteCurrency] }
}

async function parseSend(
  send: SendTransactionInfo,
  chainId: SupportedInterfaceChainId,
  formatNumber: FormatNumberFunctionType,
  tokens?: ChainTokenMap,
): Promise<Partial<Activity>> {
  const { currencyId, amount, recipient } = send
  const currency = await getCurrency(currencyId, chainId, tokens)
  const formattedAmount = currency
    ? formatNumber({
        input: parseFloat(CurrencyAmount.fromRawAmount(currency, amount).toSignificant()),
        type: NumberType.TokenNonTx,
      })
    : t('common.unknown')
  const otherAccount = isAddress(recipient) || undefined

  return {
    descriptor: t('activity.transaction.send.descriptor', {
      amountWithSymbol: `${formattedAmount} ${currency?.symbol}`,
      walletAddress: recipient,
    }),
    otherAccount,
    currencies: [currency],
  }
}

export async function transactionToActivity(
  details: TransactionDetails | undefined,
  chainId: SupportedInterfaceChainId,
  formatNumber: FormatNumberFunctionType,
  tokens: ChainTokenMap,
): Promise<Activity | undefined> {
  if (!details) {
    return undefined
  }
  try {
    const defaultFields = {
      hash: details.hash,
      chainId,
      title: getActivityTitle(details.info.type, details.status),
      status: details.status,
      timestamp: (isConfirmedTx(details) ? details.confirmedTime : details.addedTime) / 1000,
      from: details.from,
      nonce: details.nonce,
      cancelled: details.cancelled,
    }

    let additionalFields: Partial<Activity> = {}
    const info = details.info
    if (info.type === TransactionType.SWAP) {
      additionalFields = await parseSwap(info, chainId, formatNumber, tokens)
    } else if (info.type === TransactionType.APPROVAL) {
      additionalFields = await parseApproval(info, chainId, details.status, tokens)
    } else if (info.type === TransactionType.WRAP) {
      additionalFields = parseWrap(info, chainId, details.status, formatNumber)
    } else if (
      info.type === TransactionType.ADD_LIQUIDITY_V3_POOL ||
      info.type === TransactionType.REMOVE_LIQUIDITY_V3 ||
      info.type === TransactionType.ADD_LIQUIDITY_V2_POOL
    ) {
      additionalFields = await parseLP(info, chainId, formatNumber, tokens)
    } else if (info.type === TransactionType.COLLECT_FEES) {
      additionalFields = await parseCollectFees(info, chainId, formatNumber, tokens)
    } else if (info.type === TransactionType.MIGRATE_LIQUIDITY_V3 || info.type === TransactionType.CREATE_V3_POOL) {
      additionalFields = await parseMigrateCreateV3(info, chainId, tokens)
    } else if (info.type === TransactionType.SEND) {
      additionalFields = await parseSend(info, chainId, formatNumber, tokens)
    }

    const activity = { ...defaultFields, ...additionalFields }

    if (details.cancelled) {
      activity.title = CancelledTransactionTitleTable[details.info.type]
      activity.status = TransactionStatus.Confirmed
    }

    return activity
  } catch (error) {
    logger.warn('parseLocal', 'transactionToActivity', `Failed to parse transaction ${details.hash}`, error)
    return undefined
  }
}

export function getTransactionToActivityQueryOptions(
  transaction: TransactionDetails | undefined,
  chainId: SupportedInterfaceChainId,
  formatNumber: FormatNumberFunctionType,
  tokens: ChainTokenMap,
) {
  return queryOptions({
    queryKey: ['transactionToActivity', transaction, chainId],
    queryFn: async () => transactionToActivity(transaction, chainId, formatNumber, tokens),
  })
}

export function getSignatureToActivityQueryOptions(
  signature: SignatureDetails | undefined,
  formatNumber: FormatNumberFunctionType,
) {
  return queryOptions({
    queryKey: ['signatureToActivity', signature],
    queryFn: async () => signatureToActivity(signature, formatNumber),
  })
}

function convertToSecTimestamp(timestamp: number) {
  // UNIX timestamp in ms for Jan 1, 2100
  const threshold: number = 4102444800000
  if (timestamp >= threshold) {
    return Math.floor(timestamp / 1000)
  } else {
    return timestamp
  }
}

export async function signatureToActivity(
  signature: SignatureDetails | undefined,
  formatNumber: FormatNumberFunctionType,
): Promise<Activity | undefined> {
  if (!signature) {
    return undefined
  }
  switch (signature.type) {
    case SignatureType.SIGN_UNISWAPX_ORDER:
    case SignatureType.SIGN_UNISWAPX_V2_ORDER:
    case SignatureType.SIGN_LIMIT: {
      // Only returns Activity items for orders that don't have an on-chain counterpart
      if (isOnChainOrder(signature.status)) {
        return undefined
      }

      const { title, statusMessage, status } =
        signature.type === SignatureType.SIGN_LIMIT
          ? LimitOrderTextTable[signature.status]
          : OrderTextTable[signature.status]

      return {
        hash: signature.orderHash,
        chainId: signature.chainId,
        title,
        status,
        offchainOrderDetails: signature,
        timestamp: convertToSecTimestamp(signature.addedTime),
        from: signature.offerer,
        statusMessage,
        prefixIconSrc: UniswapXBolt,
        ...(await parseSwap(signature.swapInfo, signature.chainId, formatNumber)),
      }
    }
    default:
      return undefined
  }
}

export function useLocalActivities(account: string): ActivityMap {
  const allTransactions = useMultichainTransactions()
  const allSignatures = useAllSignatures()
  const tokens = useAllTokensMultichain()
  const { formatNumber } = useFormatter()

  const { data } = useQuery({
    queryKey: ['localActivities', account],
    queryFn: async () => {
      const transactions = Object.values(allTransactions)
        .filter(([transaction]) => transaction.from === account)
        .map(([transaction, chainId]) => transactionToActivity(transaction, chainId, formatNumber, tokens))
      const signatures = Object.values(allSignatures)
        .filter((signature) => signature.offerer === account)
        .map((signature) => signatureToActivity(signature, formatNumber))

      return (await Promise.all([...transactions, ...signatures])).reduce((acc, activity) => {
        if (activity) {
          acc[activity.hash] = activity
        }
        return acc
      }, {} as ActivityMap)
    },
  })

  return data ?? {}
}
