import { defineChain } from 'viem'
import { chainConfig } from 'viem/op-stack'

// Latest viem has this chain, however, newer package version clashes with current setup
// For this reason this and future chains could be defined in this folder.
export const anime = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 69000,
  name: 'Anime',
  network: 'anime',
  nativeCurrency: {
    decimals: 18,
    name: 'ANIME',
    symbol: 'ANIME',
  },
  rpcUrls: {
    default: { http: [''] }, // WIP
  },
  blockExplorers: {
    default: {
      name: 'Animechain Explorer',
      url: 'https://explorer-animechain-39xf6m45e3.t.conduit.xyz',
    },
  },
  testnet: false,
  contracts: {
    multicall3: {
      address: '0x1bA2deD5Df9b3dd3d474282C00c96A8ee07Bfb74',
    },
  },
})
