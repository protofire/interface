# New Chain Integration: Interface (Web App)

## Overview

Add a new EVM chain to the Uniswap web interface. This is typically the **last** repo to integrate — ensure `sdks/`, `smart-order-router/`, `routing-api/`, and `uniswap-gateway/` changes are done first.

## Prerequisites

Gather these values before starting:

```
CHAIN_ID=<numeric>                  # e.g. 545
CHAIN_NAME=<name>                   # e.g. FlowTestnet (PascalCase for enum)
CHAIN_SLUG=<slug>                   # e.g. flow-testnet (kebab-case)
CHAIN_URL_PARAM=<param>             # e.g. flow_testnet (snake_case for URL params)
CHAIN_DISPLAY_NAME=<name>           # e.g. "Flow EVM Testnet" (human-readable)
NATIVE_SYMBOL=<symbol>              # e.g. FLOW
NATIVE_NAME=<name>                  # e.g. Flow
NATIVE_DECIMALS=<decimals>          # e.g. 18
WRAPPED_NATIVE_ADDRESS=<addr>       # e.g. 0xd3bF53DAC106A0290B0483EcBC89d40FcC961f3e
WRAPPED_NATIVE_SYMBOL=<symbol>      # e.g. WFLOW
RPC_URL=<url>                       # e.g. https://testnet.evm.nodes.onflow.org
BLOCK_EXPLORER_URL=<url>            # e.g. https://testnet.flowdiver.io
BLOCK_EXPLORER_NAME=<name>          # e.g. Flowdiver
IS_TESTNET=<true|false>
NETWORK_LAYER=<L1|L2>

# Contract addresses:
V2_FACTORY=<addr>
V2_ROUTER=<addr>
V3_FACTORY=<addr>
V3_NFT_POSITION_MANAGER=<addr>
V3_MULTICALL=<addr>
V4_POSITION_MANAGER=<addr>          # optional

# Stablecoin(s):
USDC_ADDRESS=<addr>
USDC_DECIMALS=<number>
USDC_SYMBOL=<symbol>                # e.g. USDCf

# GraphQL backend chain name:
GRAPHQL_CHAIN=<name>                # e.g. Chain.Flow (from GraphQL schema)

# Subgraph URL (if available):
V3_SUBGRAPH_URL=<url|empty>

# Logo asset:
CHAIN_LOGO_FILE=<filename>          # e.g. flow-logo.png (place in assets)
```

## Steps

### 1. Add chain to UniverseChainId enum

**File:** `packages/uniswap/src/features/chains/types.ts`

```ts
// Add to UniverseChainId enum:
ChainName = CHAIN_ID,
```

### 2. Create chain info file

**File:** `packages/uniswap/src/features/chains/evm/info/CHAIN_SLUG.ts`

Create a new file with the full `UniverseChainInfo` object:

```ts
import { UniverseChainId } from '../../types'
import { UniverseChainInfo } from '../../types'

export const CHAIN_NAME_CHAIN_INFO: UniverseChainInfo = {
  id: UniverseChainId.ChainName,
  sdkId: CHAIN_ID,
  name: 'CHAIN_DISPLAY_NAME',
  testnet: IS_TESTNET,
  logo: CHAIN_LOGO,                          // imported from ui assets
  nativeCurrency: {
    name: 'NATIVE_NAME',
    symbol: 'NATIVE_SYMBOL',
    decimals: NATIVE_DECIMALS,
    address: '0x0000000000000000000000000000000000000000',
  },
  wrappedNativeCurrency: {
    name: 'Wrapped NATIVE_NAME',
    symbol: 'WRAPPED_NATIVE_SYMBOL',
    decimals: NATIVE_DECIMALS,
    address: 'WRAPPED_NATIVE_ADDRESS',
  },
  rpcUrls: {
    default: { http: ['RPC_URL'] },
    appOnly: { http: ['RPC_URL'] },
  },
  explorer: {
    name: 'BLOCK_EXPLORER_NAME',
    url: 'BLOCK_EXPLORER_URL',
    apiUrl: '',                               // leave empty if no API
  },
  networkLayer: NetworkLayer.NETWORK_LAYER,
  backendChain: {
    chain: GraphQLApi.Chain.GRAPHQL_CHAIN,
    isSecondaryChain: false,
  },
  subgraphs: {
    v3: 'V3_SUBGRAPH_URL',
  },
  supportsV4: true,                           // set false if no V4
  supportsNFTs: false,                        // typically false for new chains
  urlParam: 'CHAIN_URL_PARAM',
  interfaceName: 'CHAIN_SLUG',
  color: '#00EF8B',                           // chain brand color
}
```

### 3. Register chain info

**File:** `packages/uniswap/src/features/chains/chainInfo.ts`

```ts
// Import chain info:
import { CHAIN_NAME_CHAIN_INFO } from './evm/info/CHAIN_SLUG'

// Add to ORDERED_CHAINS array:
UniverseChainId.ChainName,

// Add to UNIVERSE_CHAIN_INFO:
[UniverseChainId.ChainName]: CHAIN_NAME_CHAIN_INFO,
```

### 4. Add chain to WEB_SUPPORTED_CHAIN_IDS

Check the chain info utilities to ensure the new chain appears in the web-supported list. If testnet, it may need `testnet: true` and a testnet mode toggle.

### 5. Define tokens

**File:** `packages/uniswap/src/constants/tokens.ts`

```ts
// Add stablecoin:
export const USDC_CHAIN_NAME = new Token(
  CHAIN_ID,
  'USDC_ADDRESS',
  USDC_DECIMALS,
  'USDC_SYMBOL',
  'USD Coin'
)

// Add wrapped native to WRAPPED_NATIVE_CURRENCY:
[UniverseChainId.ChainName]: new Token(
  CHAIN_ID,
  'WRAPPED_NATIVE_ADDRESS',
  NATIVE_DECIMALS,
  'WRAPPED_NATIVE_SYMBOL',
  'Wrapped NATIVE_NAME'
),
```

### 6. Create contract address overrides

**File:** `apps/web/src/constants/flowAddresses.ts` (name after your chain)

The interface uses SDK address maps by default, but some chains need local overrides (e.g., when SDK patches haven't propagated). Create a file that extends the SDK address maps:

```ts
import { SUPPORTED_CHAINS_WITH_ADDRESSES } from './addresses'

// Override address maps for your chain:
export const EXTENDED_V2_FACTORY_ADDRESSES = { ...V2_FACTORY_ADDRESSES, [CHAIN_ID]: 'V2_FACTORY' }
export const EXTENDED_V3_FACTORY_ADDRESSES = { ...V3_CORE_FACTORY_ADDRESSES, [CHAIN_ID]: 'V3_FACTORY' }
export const EXTENDED_MULTICALL_ADDRESSES = { ...MULTICALL_ADDRESSES, [CHAIN_ID]: 'V3_MULTICALL' }
export const EXTENDED_NFT_MANAGER_ADDRESSES = { ...NONFUNGIBLE_POSITION_MANAGER_ADDRESSES, [CHAIN_ID]: 'V3_NFT_POSITION_MANAGER' }
```

Then update all import sites in `apps/web/src/` to use your extended maps instead of the SDK originals. Key files:
- `apps/web/src/constants/addresses.ts`
- Components that reference V2/V3/V4 factory, router, or position manager addresses

### 7. Add logo assets

**File:** `packages/ui/src/assets/logos/png/CHAIN_LOGO_FILE`

Add the chain logo PNG file (recommended: 256x256, transparent background).

**File:** `packages/ui/src/assets/index.ts`

```ts
export { default as CHAIN_NAME_LOGO } from './logos/png/CHAIN_LOGO_FILE'
```

### 8. Add block explorer logos

**File:** `packages/uniswap/src/features/chains/logos.tsx`

```ts
// In BLOCK_EXPLORER_LOGOS_LIGHT:
[UniverseChainId.ChainName]: BlockExplorer,  // or custom SVG component

// In BLOCK_EXPLORER_LOGOS_DARK:
[UniverseChainId.ChainName]: BlockExplorer,
```

### 9. Add GraphQL chain mapping utilities

**File:** `packages/uniswap/src/features/chains/utils.ts`

```ts
// In fromGraphQLChain():
case GraphQLApi.Chain.GRAPHQL_CHAIN:
  return UniverseChainId.ChainName

// In fromUniswapWebAppLink():
case 'CHAIN_URL_PARAM':
  return UniverseChainId.ChainName

// In toUniswapWebAppLink():
case UniverseChainId.ChainName:
  return 'CHAIN_URL_PARAM'
```

### 10. Add telemetry element name

**File:** `packages/uniswap/src/features/telemetry/constants/trace/element.ts`

```ts
// Add to ElementName enum:
ChainChainName = 'chain-CHAIN_SLUG',
```

### 11. Add RPC chain mapping

**File:** `packages/uniswap/src/features/chains/evm/rpc.ts`

```ts
// In getQuicknodeChainId():
case UniverseChainId.ChainName:
  return 'CHAIN_SLUG'
```

### 12. Update Content Security Policy

**File:** `apps/web/public/dev-csp.json`

Add the chain's RPC URL to the CSP allowlist:

```json
"connect-src": [
  "RPC_URL"
]
```

### 13. Add routing bases

**File:** `packages/uniswap/src/constants/routing.ts`

```ts
// In COMMON_BASES (import the stablecoin at the top):
[UniverseChainId.ChainName]: [
  nativeOnChain(UniverseChainId.ChainName),
  WRAPPED_NATIVE_CURRENCY[UniverseChainId.ChainName],
  USDC_CHAIN_NAME,
],
```

### 14. Update GraphQL schema (if backend doesn't have chain yet)

**File:** `packages/api/src/clients/graphql/schema.graphql`

If the backend GraphQL schema doesn't include your chain yet:

```graphql
enum Chain {
  # ... existing chains ...
  CHAIN_NAME
}
```

Then regenerate types: `yarn graphql:generate`

### 15. Configure local development environment

**File:** `apps/web/.env.local`

Point the API endpoints to your local gateway:

```
REACT_APP_TRADING_API_URL=http://localhost:3001
```

For local dev without Uniswap backend services, you may need to bypass:
- **Amplitude** — analytics (won't affect functionality)
- **Statsig** — feature flags (may need fallback defaults)
- **TRM** — compliance screening (bypass for testnet)

### 16. Build and verify

```bash
cd interface
yarn install
yarn build:web
```

## Files Changed (summary)

| File | Change |
|------|--------|
| `packages/uniswap/src/features/chains/types.ts` | UniverseChainId enum entry |
| `packages/uniswap/src/features/chains/evm/info/CHAIN_SLUG.ts` | Chain info file (NEW) |
| `packages/uniswap/src/features/chains/chainInfo.ts` | ORDERED_CHAINS + UNIVERSE_CHAIN_INFO |
| `packages/uniswap/src/constants/tokens.ts` | Stablecoin + WRAPPED_NATIVE_CURRENCY |
| `packages/uniswap/src/constants/routing.ts` | COMMON_BASES entry |
| `packages/uniswap/src/features/chains/utils.ts` | GraphQL ↔ chain ID mapping functions |
| `packages/uniswap/src/features/chains/evm/rpc.ts` | RPC chain ID mapping |
| `packages/uniswap/src/features/chains/logos.tsx` | Block explorer logos |
| `packages/uniswap/src/features/telemetry/constants/trace/element.ts` | Telemetry element name |
| `packages/ui/src/assets/logos/png/CHAIN_LOGO_FILE` | Logo asset (NEW) |
| `packages/ui/src/assets/index.ts` | Logo export |
| `apps/web/src/constants/flowAddresses.ts` | Contract address overrides (NEW) |
| `apps/web/public/dev-csp.json` | CSP allowlist for RPC URL |
| `packages/api/src/clients/graphql/schema.graphql` | GraphQL chain enum (if needed) |
| `apps/web/.env.local` | Local dev API URLs |

## Validation

- `yarn build:web` passes
- New chain appears in chain selector (enable testnet mode if testnet)
- Token list loads for the new chain
- Swap quote works (native → stablecoin)
- Block explorer links are correct
- Chain logo renders in chain selector and swap interface
- Wallet connects and can switch to the new chain

## Note on SDK Patches

If the interface can't update its SDK dependencies directly, apply patches using `patch-package` to add the new `ChainId` enum. Check `patches/` directory for examples. The interface may need patches for:
- `@uniswap/sdk-core` — ChainId enum + addresses
- `@uniswap/universal-router-sdk` — CHAIN_CONFIGS entry
- `@uniswap/smart-order-router` — chain support arrays
