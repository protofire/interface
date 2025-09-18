import { isBetaEnv, isProdEnv } from 'utilities/src/environment'

function isAppUniswapOrg(): boolean {
  //FIXME: update with real host
  return true // hostname === 'app.futurehost.xyz'
}

function isAppUniswapStagingOrg(): boolean {
  //FIXME: update with real host
  return true // hostname === 'app.futurehost.xyz'
}

export function isBrowserRouterEnabled(): boolean {
  if (isProdEnv()) {
    if (
      isAppUniswapOrg() ||
      isAppUniswapStagingOrg() ||
      isLocalhost(window.location) // cypress tests
    ) {
      return true
    }
    return false // production builds *not* served through our domains or localhost, eg IPFS
  }
  return true // local dev builds
}

function isLocalhost({ hostname }: { hostname: string }): boolean {
  return hostname === 'localhost'
}

export function isRemoteReportingEnabled(): boolean {
  // Disable in e2e test environments
  if (isBetaEnv() && !isAppUniswapStagingOrg()) {
    return false
  }
  if (isProdEnv() && !isAppUniswapOrg()) {
    return false
  }
  return process.env.REACT_APP_SENTRY_ENABLED === 'true'
}
