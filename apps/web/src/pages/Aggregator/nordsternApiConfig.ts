const NORDSTERN_API_BASE_URL = 'https://api.nordstern.finance/aggregator'

export const NORDSTERN_API_ENDPOINTS = {
  QUOTE: (chainId: number) => `${NORDSTERN_API_BASE_URL}/${chainId}`,
} as const

export const NORDSTERN_ROUTER_ADDRESSES: Record<number, string> = {
  747: '0xC87De04e2EC1F4282dFF2933A2D58199f688fC3d',
}

export function getNordsternRouterAddress(chainId: number): string | undefined {
  return NORDSTERN_ROUTER_ADDRESSES[chainId]
}

