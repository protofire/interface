import { uniswapUrls } from 'uniswap/src/constants/urls'
import { createApiClient } from 'uniswap/src/data/apiClients/createApiClient'
import {
  UnitagAddressRequest,
  UnitagAddressResponse,
  UnitagClaimEligibilityRequest,
  UnitagClaimEligibilityResponse,
  UnitagUsernameRequest,
  UnitagUsernameResponse,
} from 'uniswap/src/features/unitags/types'

export const UNITAGS_API_CACHE_KEY = 'UnitagsApi'

const UnitagsApiClient = createApiClient({
  baseUrl: uniswapUrls.unitagsApiUrl,
})

export async function fetchUsername(params: UnitagUsernameRequest): Promise<UnitagUsernameResponse> {
  // TODO: Remove Unitags implementation
  return Promise.resolve({ available: false, requiresEnsMatch: false })
}

export async function fetchAddress(params: UnitagAddressRequest): Promise<UnitagAddressResponse> {
  // TODO: Remove Unitags implementation
  return Promise.resolve({})
}

export async function fetchClaimEligibility(
  params: UnitagClaimEligibilityRequest,
): Promise<UnitagClaimEligibilityResponse> {
  // TODO: Remove Unitags implementation
  return Promise.resolve({ canClaim: false })
}
