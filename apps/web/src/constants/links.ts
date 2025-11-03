import { isProdEnv } from 'utilities/src/environment'

export const getInfoV2Link = (chainId: string | number) => {
  const isProd = isProdEnv()
  switch (chainId) {
    case 69000:
      return isProd ? 'https://v2-info-anime.sakuraswap.com' : 'https://v2-info-anime.staging.sakuraswap.com'
    case 543210:
      return isProd ? 'https://v2-info-zero.sakuraswap.com' : 'https://v2-info-zero.staging.sakuraswap.com'
    default:
      return isProd ? 'https://v2-info.sakuraswap.com' : 'https://v2-info.staging.sakuraswap.com'
  }
}

export const getInfoV3Domain = () =>
  isProdEnv() ? 'https://info.sakuraswap.com' : 'https://info.staging.sakuraswap.com'
