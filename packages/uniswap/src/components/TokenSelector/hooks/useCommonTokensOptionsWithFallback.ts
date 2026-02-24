import { GqlResult } from '@universe/api'
import { useMemo } from 'react'
import { TokenOption } from 'uniswap/src/components/lists/items/types'
import { useCommonTokensOptions } from 'uniswap/src/components/TokenSelector/hooks/useCommonTokensOptions'
import { useCurrencies } from 'uniswap/src/components/TokenSelector/hooks/useCurrencies'
import {
  currencyInfosToTokenOptions,
  useCurrencyInfosToTokenOptions,
} from 'uniswap/src/components/TokenSelector/hooks/useCurrencyInfosToTokenOptions'
import { COMMON_BASES } from 'uniswap/src/constants/routing'
import { UniverseChainId } from 'uniswap/src/features/chains/types'
import { currencyId } from 'uniswap/src/utils/currencyId'

export function useCommonTokensOptionsWithFallback({
  evmAddress,
  svmAddress,
  chainFilter,
}: {
  evmAddress: Address | undefined
  svmAddress: Address | undefined
  chainFilter: UniverseChainId | null
}): GqlResult<TokenOption[] | undefined> {
  const { data, error, refetch, loading } = useCommonTokensOptions({ evmAddress, svmAddress, chainFilter })
  const commonBases = chainFilter ? currencyInfosToTokenOptions(COMMON_BASES[chainFilter]) : undefined
  const commonBasesCurrencyIds = useMemo(
    () => commonBases?.map((token) => currencyId(token.currencyInfo.currency)).filter(Boolean) ?? [],
    [commonBases],
  )
  const { data: commonBasesCurrencies } = useCurrencies(commonBasesCurrencyIds)
  const commonBasesTokenOptions = useCurrencyInfosToTokenOptions({
    currencyInfos: commonBasesCurrencies,
    portfolioBalancesById: {},
  })

  const shouldFallback = (!data || data.length === 0) && commonBases?.length
  // Use backend-resolved tokens if available, otherwise fall back to the static COMMON_BASES directly.
  // This handles chains where the backend doesn't support token resolution (e.g. Flow Testnet).
  const fallbackData = commonBasesTokenOptions?.length ? commonBasesTokenOptions : commonBases

  return useMemo(
    () => ({
      data: shouldFallback ? fallbackData : data,
      error: shouldFallback ? undefined : error,
      refetch,
      loading,
    }),
    [fallbackData, data, error, loading, refetch, shouldFallback],
  )
}
