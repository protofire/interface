// Testnets
const ABSTRACT_LIST = getTokenListApiURL('abstract-testnet')
const REDSTONE_GARNET_LIST = getTokenListApiURL('garnet')
// For faster load using URL with specified chainID param
const ZERO_LIST = getTokenListApiURL('zero')
const CYBER_LIST = getTokenListApiURL('cyber')
const BOB_LIST = getLegacyTokenListApiURL('60808') // legacy URL
const SHAPE_LIST = getTokenListApiURL('shape')
const INK_LIST = getTokenListApiURL('ink')
const REDSTONE_LIST = getTokenListApiURL('redstone')
const ABSTRACT_MAINNET_LIST = getTokenListApiURL('abstract')
const ANIME_TESTNET = getTokenListApiURL('anime-testnet')
const ANIME_LIST = getTokenListApiURL('anime')
const MODE_LIST = getTokenListApiURL('mode')

export const DEFAULT_INACTIVE_LIST_URLS: string[] = []
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [
  SHAPE_LIST,
]
export const DEFAULT_LIST_OF_LISTS: string[] = [...DEFAULT_ACTIVE_LIST_URLS]

function getTokenListApiURL(slug: string) {
  return `https://api-${slug}.replace.domain/tokenlist/v1`
}

function getLegacyTokenListApiURL(chainId: string) {
  return `https://api.relay.link/tokenlist?chainId=${chainId}`
}
