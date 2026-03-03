import { getOverrideAdapter, getStatsigEnvName, StatsigOptions } from '@universe/gating'
import { uniswapUrls } from 'uniswap/src/constants/urls'
import { isDevEnv } from 'utilities/src/environment/env'

export const statsigBaseConfig: StatsigOptions = {
  networkConfig: {
    api: uniswapUrls.statsigProxyUrl,
    preventAllNetworkTraffic: isDevEnv(),
  },
  environment: {
    tier: getStatsigEnvName(),
  },
  overrideAdapter: getOverrideAdapter(),
}
