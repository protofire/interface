import { defineChain } from 'viem'

export const flow = /*#__PURE__*/ defineChain({
  id: 747,
  name: 'Flow EVM',
  network: 'flow',
  nativeCurrency: {
    decimals: 18,
    name: 'FLOW',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: { http: ['https://mainnet.evm.nodes.onflow.org'] },
  },
  blockExplorers: {
    default: {
      name: 'FlowScan',
      url: 'https://evm.flowscan.io',
    },
  },
  testnet: false,
  contracts: {
    multicall3: {
      address: '0x8B5eB800B8d9cF702ff3DD0047ac31bBD411B82a',
    },
  },
})
