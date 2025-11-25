import { defineChain } from 'viem'
import { chainConfig } from 'viem/op-stack'

// Latest viem has this chain, however, newer package version clashes with current setup
// For this reason this and future chains could be defined in this folder.
export const stableTestnet = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 2201,
  name: 'STABLE Testnet',
  network: 'stable-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'gUSDT',
    symbol: 'gUSDT',
  },
  rpcUrls: {
    default: { http: [''] }, // TODO: Add RPC URL
  },
  blockExplorers: {
    default: {
      name: 'STABLE Testnet Explorer',
      url: 'https://testnet.stablescan.xyz/'
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0x3041eB141Bf4091FC55fa5ad0E53a66dc17c058d',
    },
  },
})

