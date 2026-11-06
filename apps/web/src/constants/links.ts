import { UNIVERSE_CHAIN_INFO } from 'uniswap/src/constants/chains'
import { UniverseChainId } from 'uniswap/src/types/chains'
import { isProdEnv } from 'utilities/src/environment'

export const getInfoV2Link = (chainId: string | number) => {
  const isProd = isProdEnv()
  switch (chainId) {
    case UniverseChainId.Anime:
      return isProd ? 'https://v2-info-anime.sakuraswap.com' : 'https://v2-info-anime.staging.sakuraswap.com'
    case UniverseChainId.Zero:
      return isProd ? 'https://v2-info-zero.sakuraswap.com' : 'https://v2-info-zero.staging.sakuraswap.com'
    case UniverseChainId.SHAPE:
      return 'https://v2-info.shapeswap.xyz'
    case UniverseChainId.FlowMainnet:
    case UniverseChainId.FlowTestnet:
      return isProd ? 'https://v2-info.flowswap.io' : 'https://v2-info.staging.flowswap.io'
    default:
      return isProd ? 'https://v2-info.sakuraswap.com' : 'https://v2-info.staging.sakuraswap.com'
  }
}

export const getInfoV3Link = (chainId: UniverseChainId) => {
  const isProd = isProdEnv()
  const urlParam = UNIVERSE_CHAIN_INFO[chainId].urlParam
  switch (chainId) {
    case UniverseChainId.SHAPE:
      return 'https://info.shapeswap.xyz/home'
    case UniverseChainId.FlowMainnet:
    case UniverseChainId.FlowTestnet:
      return isProd ? `https://info.flowswap.io/#/${urlParam}` : `https://info.staging.flowswap.io/#/${urlParam}`
    default:
      return isProd ? `https://info.sakuraswap.com/#/${urlParam}` : `https://info.staging.sakuraswap.com/#/${urlParam}`
  }
}
