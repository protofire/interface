const EISEN_API_BASE_URL = 'https://hiker.hetz-01.eisenfinance.com/public/v1'

export const EISEN_API_ENDPOINTS = {
  QUOTE: `${EISEN_API_BASE_URL}/quote`,
  PRICES: `${EISEN_API_BASE_URL}/prices`,
  TOKENS: `${EISEN_API_BASE_URL}/tokens`,
  DEXS: `${EISEN_API_BASE_URL}/dexs`,
} as const

export const EISEN_API_HEADERS = {
  'X-EISEN-KEY': process.env.REACT_APP_EISEN_API_KEY || '',
} as const

