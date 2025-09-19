import { defineChain } from 'viem'
import { chainConfig } from 'viem/op-stack'

// Latest viem has this chain, however, newer package version clashes with current setup
// For this reason this and future chains could be defined in this folder.
export const abstract = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 2741,
  name: 'Abstract',
  network: 'abstract',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://api.mainnet.abs.xyz'] },
  },
  blockExplorers: {
    default: {
      name: 'Abstract Explorer',
      url: 'https://abscan.org/',
    },
  },
  testnet: false,
  contracts: {
    multicall3: {
      address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
    },
  },
})
