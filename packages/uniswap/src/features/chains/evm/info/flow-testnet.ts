import { Token } from '@uniswap/sdk-core'
import { GraphQLApi } from '@universe/api'
import { FLOW_LOGO } from 'ui/src/assets'
import { DEFAULT_NATIVE_ADDRESS_LEGACY, DEFAULT_RETRY_OPTIONS } from 'uniswap/src/features/chains/evm/rpc'
import { buildChainTokens } from 'uniswap/src/features/chains/evm/tokens'
import { GENERIC_L2_GAS_CONFIG } from 'uniswap/src/features/chains/gasDefaults'
import {
  GqlChainId,
  NetworkLayer,
  RPCType,
  UniverseChainId,
  UniverseChainInfo,
} from 'uniswap/src/features/chains/types'
import { Platform } from 'uniswap/src/features/platforms/types/Platform'
import { ElementName } from 'uniswap/src/features/telemetry/constants'

const tokens = buildChainTokens({
  stables: {
    PYUSD0: new Token(UniverseChainId.FlowTestnet, '0x5e65b6B04fbA51D95409712978Cb91E99d93aE73', 6, 'USDCf', 'USDCf'),
  },
})

export const FLOW_TESTNET_CHAIN_INFO = {
  id: UniverseChainId.FlowTestnet,
  name: 'Flow EVM Testnet',
  testnet: true,
  platform: Platform.EVM,
  assetRepoNetworkName: undefined,
  backendChain: {
    chain: GraphQLApi.Chain.Flow as GqlChainId,
    backendSupported: true,
    nativeTokenBackendAddress: undefined,
  },
  blockPerMainnetEpochForChainId: 1,
  blockWaitMsBeforeWarning: undefined,
  bridge: undefined,
  docs: 'https://docs.onflow.org/',
  elementName: ElementName.ChainFlowTestnet,
  explorer: {
    name: 'Flowdiver',
    url: 'https://testnet.flowdiver.io/',
  },
  interfaceName: 'flow-testnet',
  label: 'Flow Testnet',
  logo: FLOW_LOGO,
  nativeCurrency: {
    name: 'Flow',
    symbol: 'FLOW',
    decimals: 18,
    address: DEFAULT_NATIVE_ADDRESS_LEGACY,
    logo: FLOW_LOGO,
  },
  networkLayer: NetworkLayer.L1,
  pendingTransactionsRetryOptions: DEFAULT_RETRY_OPTIONS,
  rpcUrls: {
    [RPCType.Public]: { http: ['https://testnet.evm.nodes.onflow.org'] },
    [RPCType.Default]: { http: ['https://testnet.evm.nodes.onflow.org'] },
    [RPCType.Interface]: { http: ['https://testnet.evm.nodes.onflow.org'] },
    [RPCType.Fallback]: { http: ['https://testnet.evm.nodes.onflow.org'] },
  },
  tokens,
  statusPage: undefined,
  supportsV4: true,
  supportsNFTs: false,
  urlParam: 'flow_testnet',
  wrappedNativeCurrency: {
    name: 'Wrapped Flow',
    symbol: 'WFLOW',
    decimals: 18,
    address: '0xd3bF53DAC106A0290B0483EcBC89d40FcC961f3e',
  },
  gasConfig: GENERIC_L2_GAS_CONFIG,
  tradingApiPollingIntervalMs: 1500,
} as const satisfies UniverseChainInfo
