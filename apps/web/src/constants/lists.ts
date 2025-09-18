// Testnets
// For faster load using URL with specified chainID param
const SHAPE_LIST = 'https://raw.githubusercontent.com/protofire/token-list/refs/heads/main/tokenList.json'

export const DEFAULT_INACTIVE_LIST_URLS: string[] = []
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [
  SHAPE_LIST,
]
export const DEFAULT_LIST_OF_LISTS: string[] = [...DEFAULT_ACTIVE_LIST_URLS]
