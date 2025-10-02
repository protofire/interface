import { isProdEnv } from 'utilities/src/environment'

export const getInfoV2Link = (chainId: string | number) => {
  switch (chainId) {
    case 69000:
      return 'https://v2-info-anime.sakuraswap.com'
    default:
      return 'https://v2-info.sakuraswap.com'
  }
}

export const getInfoV2Domain = () => isProdEnv() ? 'https://info.sakuraswap.com' : 'https://info.staging.sakuraswap.com'
