import type { GasStrategy } from '@universe/api'
import { convertGasFeeToDisplayValue } from 'uniswap/src/features/gas/hooks'
import type { TransactionSettings } from 'uniswap/src/features/transactions/components/settings/types'
import { WRAP_FALLBACK_GAS_LIMIT_IN_GWEI } from 'uniswap/src/features/transactions/swap/review/services/swapTxAndGasInfoService/constants'
import type { EVMSwapInstructionsService } from 'uniswap/src/features/transactions/swap/review/services/swapTxAndGasInfoService/evm/evmSwapInstructionsService'
import { createGetEVMSwapTransactionRequestInfo } from 'uniswap/src/features/transactions/swap/review/services/swapTxAndGasInfoService/evm/utils'
import type { SwapTxAndGasInfoService } from 'uniswap/src/features/transactions/swap/review/services/swapTxAndGasInfoService/swapTxAndGasInfoService'
import {
  getWrapTxAndGasInfo,
  processWrapResponse,
} from 'uniswap/src/features/transactions/swap/review/services/swapTxAndGasInfoService/utils'
import type { UnwrapTrade, WrapTrade } from 'uniswap/src/features/transactions/swap/types/trade'

export function createWrapTxAndGasInfoService(ctx: {
  instructionService: EVMSwapInstructionsService
  gasStrategy: GasStrategy
  transactionSettings: TransactionSettings
  v4SwapEnabled: boolean
}): SwapTxAndGasInfoService<WrapTrade | UnwrapTrade> {
  const getEVMSwapTransactionRequestInfo = createGetEVMSwapTransactionRequestInfo(ctx)

  const service: SwapTxAndGasInfoService<WrapTrade | UnwrapTrade> = {
    async getSwapTxAndGasInfo(params) {
      const { trade } = params
      const quote = trade.quote.quote as Record<string, unknown>
      const methodParams = quote.methodParameters as { calldata: string; value: string; to: string } | undefined

      // If the wrap quote includes methodParameters, build txRequest directly
      // without round-tripping through /v1/swap
      if (methodParams?.calldata && methodParams?.to) {
        const chainId = (quote.chainId as number) ?? trade.quote.quote.chainId
        const wrapTxRequest = {
          to: methodParams.to,
          data: methodParams.calldata,
          value: methodParams.value ?? '0x00',
          chainId,
        }
        const gasFeeValue = quote.gasFee as string | undefined
        const gasFeeResult = {
          value: gasFeeValue,
          displayValue: convertGasFeeToDisplayValue(gasFeeValue, ctx.gasStrategy),
          isLoading: false,
          error: null,
        }

        const gasUseEstimate = quote.gasUseEstimate as string | undefined
        const quoteGasPrice = quote.gasPrice as string | undefined
        const quoteMaxFeePerGas = quote.maxFeePerGas as string | undefined
        const quoteMaxPriorityFeePerGas = quote.maxPriorityFeePerGas as string | undefined

        const fallbackGasParams: Record<string, string> = {}
        if (gasUseEstimate) {
          fallbackGasParams.gasLimit = gasUseEstimate
        } else {
          fallbackGasParams.gasLimit = WRAP_FALLBACK_GAS_LIMIT_IN_GWEI.toString()
        }
        if (quoteMaxFeePerGas && quoteMaxPriorityFeePerGas) {
          fallbackGasParams.maxFeePerGas = quoteMaxFeePerGas
          fallbackGasParams.maxPriorityFeePerGas = quoteMaxPriorityFeePerGas
        } else if (quoteGasPrice) {
          fallbackGasParams.gasPrice = quoteGasPrice
        }

        const swapTxInfo = processWrapResponse({ gasFeeResult, wrapTxRequest, fallbackGasParams })
        return getWrapTxAndGasInfo({ ...params, swapTxInfo })
      }

      // Fallback: use the full instruction service (e.g., if no methodParameters)
      const swapTxInfo = await getEVMSwapTransactionRequestInfo(params)
      return getWrapTxAndGasInfo({ ...params, swapTxInfo })
    },
  }

  return service
}
