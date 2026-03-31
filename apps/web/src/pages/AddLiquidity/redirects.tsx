import { WRAPPED_NATIVE_CURRENCY, isEitherStableChain } from 'constants/tokens'
import { useAccount } from 'hooks/useAccount'
import AddLiquidity from 'pages/AddLiquidity/index'
import { Navigate, useParams } from 'react-router-dom'
import { USDT0_STABLE, USDT0_STABLE_TESTNET } from 'uniswap/src/constants/tokens'
import { UniverseChainId } from 'uniswap/src/types/chains'

function getStableDefaultCurrency(chainId: number): string {
  if (chainId === UniverseChainId.StableTestnet) {
    return USDT0_STABLE_TESTNET.address
  }
  return USDT0_STABLE.address
}

export default function AddLiquidityWithTokenRedirects() {
  const { currencyIdA, currencyIdB, feeAmount } = useParams<{
    currencyIdA: string
    currencyIdB: string
    feeAmount?: string
  }>()

  const { chainId } = useAccount()

  // On Stable chains, redirect ETH to USDT0
  if (chainId !== undefined && isEitherStableChain(chainId)) {
    const resolvedA = currencyIdA === 'ETH' ? getStableDefaultCurrency(chainId) : currencyIdA
    const resolvedB = currencyIdB === 'ETH' ? getStableDefaultCurrency(chainId) : currencyIdB

    if (resolvedA !== currencyIdA || resolvedB !== currencyIdB) {
      const parts = [resolvedA, resolvedB, feeAmount].filter(Boolean).join('/')
      return <Navigate to={`/add/${parts}`} replace />
    }
  }

  // prevent weth + eth
  const isETHOrWETHA =
    currencyIdA === 'ETH' || (chainId !== undefined && currencyIdA === WRAPPED_NATIVE_CURRENCY[chainId]?.address)
  const isETHOrWETHB =
    currencyIdB === 'ETH' || (chainId !== undefined && currencyIdB === WRAPPED_NATIVE_CURRENCY[chainId]?.address)

  if (
    currencyIdA &&
    currencyIdB &&
    (currencyIdA.toLowerCase() === currencyIdB.toLowerCase() || (isETHOrWETHA && isETHOrWETHB))
  ) {
    return <Navigate to={`/add/${currencyIdA}`} replace />
  }
  return <AddLiquidity />
}
