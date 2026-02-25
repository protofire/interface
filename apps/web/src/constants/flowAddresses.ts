import {
  MULTICALL_ADDRESSES as SDK_MULTICALL,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES as SDK_NFT_MANAGER,
  V3_CORE_FACTORY_ADDRESSES as SDK_V3_FACTORY,
} from '@uniswap/sdk-core'
import { UniverseChainId } from 'uniswap/src/features/chains/types'

/**
 * Extended address maps that include Flow testnet (545).
 * The upstream SDK doesn't know about Flow, so we add it here.
 */

export const V3_CORE_FACTORY_ADDRESSES: Record<number, string> = {
  ...SDK_V3_FACTORY,
  [UniverseChainId.FlowTestnet]: '0x92657b195e22b69E4779BBD09Fa3CD46F0CF8e39',
}

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: Record<number, string> = {
  ...SDK_NFT_MANAGER,
  [UniverseChainId.FlowTestnet]: '0x8b9F96390EC35d5859937c7c5D68Ff6D5CFC312f',
}

export const MULTICALL_ADDRESSES: Record<number, string> = {
  ...SDK_MULTICALL,
  [UniverseChainId.FlowTestnet]: '0x02b9B840CDCEe84510a02cc85f351CAaD41f46CE',
}
