import { isEitherStableChain } from 'constants/tokens'
import { useAccount } from 'hooks/useAccount'
import AddLiquidityV2 from 'pages/AddLiquidityV2/index'
import { Navigate, useParams } from 'react-router-dom'
import { USDT0_STABLE, USDT0_STABLE_TESTNET } from 'uniswap/src/constants/tokens'
import { UniverseChainId } from 'uniswap/src/types/chains'

function getStableDefaultCurrency(chainId: number): string {
  if (chainId === UniverseChainId.StableTestnet) {
    return USDT0_STABLE_TESTNET.address
  }
  return USDT0_STABLE.address
}

export default function AddLiquidityV2WithTokenRedirects() {
  const { currencyIdA, currencyIdB } = useParams<{ currencyIdA: string; currencyIdB: string }>()
  const { chainId } = useAccount()

  // On Stable chains, redirect ETH to USDT0
  if (chainId !== undefined && isEitherStableChain(chainId)) {
    const resolvedA = currencyIdA === 'ETH' ? getStableDefaultCurrency(chainId) : currencyIdA
    const resolvedB = currencyIdB === 'ETH' ? getStableDefaultCurrency(chainId) : currencyIdB

    if (resolvedA !== currencyIdA || resolvedB !== currencyIdB) {
      const parts = [resolvedA, resolvedB].filter(Boolean).join('/')
      return <Navigate to={`/add/v2/${parts}`} replace />
    }
  }

  if (currencyIdA && currencyIdB && currencyIdA.toLowerCase() === currencyIdB.toLowerCase()) {
    return <Navigate to={`/add/v2/${currencyIdA}`} replace />
  }

  return <AddLiquidityV2 />
}
