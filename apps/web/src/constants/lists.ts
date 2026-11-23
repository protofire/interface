const DEFAULT_TOKEN_LIST =
  'https://raw.githubusercontent.com/protofire/token-list/refs/heads/main/networks/abstract.json'

const ZERO_LIST = 'https://raw.githubusercontent.com/protofire/token-list/refs/heads/main/networks/zero.json'

const ANIME_LIST = 'https://raw.githubusercontent.com/protofire/token-list/refs/heads/main/networks/anime.json'

const FLOW_LIST = 'https://assets.swap.w3us.site/networks/flow.json'

const FLOW_TESTNET_LIST = 'https://assets.swap.w3us.site/networks/flow-testnet.json'

export const DEFAULT_INACTIVE_LIST_URLS: string[] = []
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [
  DEFAULT_TOKEN_LIST,
  ZERO_LIST,
  ANIME_LIST,
  FLOW_LIST,
  FLOW_TESTNET_LIST,
]
export const DEFAULT_LIST_OF_LISTS: string[] = [DEFAULT_TOKEN_LIST, ZERO_LIST, ANIME_LIST, FLOW_LIST, FLOW_TESTNET_LIST]
