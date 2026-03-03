import {
  MULTICALL_ADDRESSES as SDK_MULTICALL,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES as SDK_NFT_MANAGER,
  V2_FACTORY_ADDRESSES as SDK_V2_FACTORY,
  V2_ROUTER_ADDRESSES as SDK_V2_ROUTER,
  V3_CORE_FACTORY_ADDRESSES as SDK_V3_FACTORY,
} from '@uniswap/sdk-core'
import { UniverseChainId } from 'uniswap/src/features/chains/types'

/**
 * Extended address maps that include Flow testnet (545).
 * The upstream SDK doesn't know about Flow, so we add it here.
 */

export const V2_FACTORY_ADDRESSES: Record<number, string> = {
  ...SDK_V2_FACTORY,
  [UniverseChainId.FlowTestnet]: '0x7d726261FB76B264fc20eA1f19D900D760136566',
}

export const V2_ROUTER_ADDRESSES: Record<number, string> = {
  ...SDK_V2_ROUTER,
  [UniverseChainId.FlowTestnet]: '0x524E1291c109BE27FDE48De97cAf0B3c0F02A68f',
}

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

/** V4 address overrides for Flow Testnet */
export const V4_POSITION_MANAGER_ADDRESSES: Record<number, string> = {
  [UniverseChainId.FlowTestnet]: '0xaa618Ba21AD873Ecab1Eb3B42096B6A9a97b30f9',
}
