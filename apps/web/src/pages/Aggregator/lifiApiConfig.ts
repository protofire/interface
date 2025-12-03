const LIFI_API_BASE_URL = 'https://li.quest/v1'

export const LIFI_API_ENDPOINTS = {
  QUOTE: `${LIFI_API_BASE_URL}/quote`,
} as const

export const LIFI_API_HEADERS = {
  // 'x-lifi-api-key': process.env.REACT_APP_LIFI_API_KEY || '',
} as const

