# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **Uniswap Labs front-end monorepo** — a Yarn workspaces + Turbo monorepo containing three apps and several shared packages.

- **Web** (`apps/web`): React 18 + CRA/Craco — [app.uniswap.org](https://app.uniswap.org)
- **Mobile** (`apps/mobile`): React Native + Expo — iOS/Android wallet
- **Extension** (`apps/extension`): Webpack browser extension — [wallet.uniswap.org](https://wallet.uniswap.org)
- **`packages/ui`**: Tamagui-based cross-platform UI component library
- **`packages/uniswap`**: Core protocol logic, GraphQL data layer, i18n, contract ABIs
- **`packages/wallet`**: Shared wallet state (Redux + Redux-Saga), key management, `redux-persist` migrations
- **`packages/utilities`**: Analytics (Amplitude, Sentry, Datadog), shared utility functions
- **`config/`**: Shared TypeScript configs and Jest presets

Node version: **18** (see `.nvmrc`). Package manager: **Yarn 3** (Berry).

## Common Commands

### Root (all workspaces via Turbo)
```bash
yarn g:build            # Build all workspaces
yarn g:lint             # Lint all workspaces
yarn g:lint:fix         # Lint + auto-fix
yarn g:test             # Test all workspaces
yarn g:typecheck        # TypeScript check all workspaces
yarn g:format           # Check formatting (Prettier)
yarn g:format:fix       # Auto-fix formatting
yarn g:prepare          # Run prepare step (generate ABIs, i18n types, GraphQL types, AJV validators)
yarn g:run-all-checks   # typecheck + lint + test + build + format + circular deps
yarn g:run-fast-checks  # Fast checks on changed files only
```

### Web App (`apps/web`)
```bash
yarn web start          # Dev server (localhost:3000)
yarn web build:production
yarn web test           # Jest
yarn web test:watch
yarn web lint
yarn web typecheck
```

### Mobile App (`apps/mobile`)
```bash
yarn mobile ios         # iOS Simulator (requires Mac + Xcode 15)
yarn mobile android
yarn mobile pod         # Install CocoaPods
```

### Extension (`apps/extension`)
```bash
yarn extension start              # Dev (loads from apps/extension/dev)
yarn extension start:absolute     # Dev with absolute path (Mac, for scantastic)
yarn extension build:production
yarn extension test
```

### Running a single test file
```bash
# From repo root:
yarn web test -- --testPathPattern="path/to/test"
yarn extension test -- --testPathPattern="path/to/test"
# Or from within the app directory:
yarn test -- --testPathPattern="path/to/test"
```

## Architecture & Key Concepts

### Build Pipeline (Turbo)
Turbo orchestrates task dependencies. The critical `prepare` step must run before `typecheck`, `build`, and `test`. It generates:
- Contract ABI TypeScript types (`packages/uniswap/src/abis/`)
- GraphQL types (`graphql:generate` → `src/**/types-and-hooks.ts`)
- i18n types (`uniswap#i18n:generate`)
- Trading API types (`uniswap#tradingapi:generate`)
- AJV validators for the web app (`@uniswap/interface#ajv`)

If TypeScript complains about missing generated types, run `yarn g:prepare` first.

### State Management
Redux + Redux Toolkit is used across all apps. Redux-Saga handles complex async flows (signing, chain interactions). `redux-persist` persists state between sessions.

**Critical**: When adding or removing **required** properties from Redux state in `packages/wallet`, you **must** write a migration:
1. Increment `MOBILE_STATE_VERSION` in `apps/mobile/src/app/migrations.ts` and/or `EXTENSION_STATE_VERSION` in `apps/extension/src/store/migrations.ts`
2. Add a migration function at the new version key in `migrations.ts`
3. Write tests in `migrations.test.ts`
4. Update `schema.ts` with the new schema shape

Optional property additions do **not** require migrations.

### Cross-Platform Code Sharing
The `packages/ui` Tamagui library and `packages/uniswap`/`packages/wallet` packages are shared between web, mobile, and extension. TypeScript path aliases (`ui/*`, `uniswap/*`, `wallet/*`, `utilities/*`) resolve to these packages — defined in `config/tsconfig/base.json`.

### GraphQL
Apollo Client 3 is used for GraphQL queries. Code generation is configured via `codegen.ts` in each package/app. Schema files are `schema.graphql`. Generated output goes to `src/**/types-and-hooks.ts` and `__generated__/` directories. `graphql:generate` is not cached in Turbo (always re-runs).

### Web App Specifics
- Create React App wrapped with Craco (`apps/web/craco.config.cjs`) for webpack customization
- SWC transpiler (faster than Babel) — config in `.swcrc`
- Cypress for E2E tests (`apps/web/cypress/`)
- ESLint enforces restricted imports (no styled-components in new code — Tamagui is the standard)
- Wagmi v2 + viem for wallet connections; ethers.js v5 also present

### Extension Loading (Dev)
After `yarn extension start`, load unpacked from `apps/extension/dev` in `chrome://extensions` with Developer mode on.

### Environment Variables
Full functionality requires env vars from 1Password:
- `yarn mobile env:local:download` — downloads `.env.defaults.local`
- `yarn extension env:local:download` — downloads extension env vars
- `yarn web i18n:download` — downloads translation files (requires 1Password signin)
