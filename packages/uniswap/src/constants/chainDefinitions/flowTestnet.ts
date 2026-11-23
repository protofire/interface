import { defineChain } from 'viem'

export const flowTestnet = /*#__PURE__*/ defineChain({
  id: 545,
  name: 'Flow EVM Testnet',
  network: 'flow-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'FLOW',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: { http: ['https://testnet.evm.nodes.onflow.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Flow EVM Testnet Explorer',
      url: 'https://evm-testnet.flowscan.io/',
    },
  },
  testnet: true,
  contracts: {
    multicall3: {
      address: '0x3b1b14aec3C7617D41C02d622D5312B3209Bfa98',
    },
  },
})
