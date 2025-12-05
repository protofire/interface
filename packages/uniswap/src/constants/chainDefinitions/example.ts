import { defineChain } from 'viem'

export const example = /*#__PURE__*/ defineChain({
  id: 0, // chainId
  name: 'Network Name',
  network: 'network-short-name',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: [''] },
  },
  blockExplorers: {
    default: {
      name: 'Block Explorer',
      url: '',
    },
  },
  testnet: false,
  contracts: {
    multicall3: {
      address: '0x0000000000000000000000000000000000000000',
    },
  },
})
