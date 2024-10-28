// Lists we use as fallbacks on chains that our backend doesn't support
const COINGECKO_AVAX_LIST = 'https://tokens.coingecko.com/avalanche/all.json'
const ABSTRACT_LISt = 'https://api.testnets.relay.link/tokenlist?chainId=11124'

export const DEFAULT_INACTIVE_LIST_URLS: string[] = [COINGECKO_AVAX_LIST]
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [ABSTRACT_LISt]
export const DEFAULT_LIST_OF_LISTS: string[] = [...DEFAULT_ACTIVE_LIST_URLS]
