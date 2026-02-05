import { defineChain } from 'viem'
import { chainConfig } from 'viem/op-stack'

// Latest viem has this chain, however, newer package version clashes with current setup
// For this reason this and future chains could be defined in this folder.
export const stable = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 988,
  name: 'STABLE',
  network: 'stable',
  nativeCurrency: {
    decimals: 18,
    name: 'USD₮0',
    symbol: 'USD₮0',
  },
  rpcUrls: {
    default: { http: ['https://rpc.stable.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'STABLE Explorer',
      url: 'https://stablescan.xyz',
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0x208099D6E8a107aD485CD1374A6EC5Abd98c7F11',
    },
  },
})
