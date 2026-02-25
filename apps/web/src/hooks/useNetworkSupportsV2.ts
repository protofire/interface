import { V2_ROUTER_ADDRESSES } from '@uniswap/sdk-core'
import { useAccount } from 'hooks/useAccount'
import { UniverseChainId } from 'uniswap/src/features/chains/types'

/**
 * @deprecated when v2 pools are enabled on chains supported through sdk-core
 */
export const SUPPORTED_V2POOL_CHAIN_IDS = [
  ...Object.keys(V2_ROUTER_ADDRESSES).map((chainId) => parseInt(chainId)),
  UniverseChainId.FlowTestnet,
]

export function useNetworkSupportsV2() {
  const { chainId } = useAccount()

  return chainId && SUPPORTED_V2POOL_CHAIN_IDS.includes(chainId)
}
