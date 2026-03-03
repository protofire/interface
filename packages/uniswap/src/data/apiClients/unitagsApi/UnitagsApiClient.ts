import {
  createFetchClient,
  createUnitagsApiClient,
  getCloudflareApiBaseUrl,
  provideSessionService,
  TrafficFlows,
} from '@universe/api'
import { getConfig } from '@universe/config'
import { getIsSessionServiceEnabled } from '@universe/gating'
import { uniswapUrls } from 'uniswap/src/constants/urls'
import { isDevEnv } from 'utilities/src/environment/env'

type Client = ReturnType<typeof createUnitagsApiClient>

function createClient(): Client {
  if (isDevEnv()) {
    const empty = () => Promise.resolve({} as never)
    return {
      fetchUsername: empty,
      fetchAddress: empty,
      fetchUnitagsByAddresses: empty,
      fetchClaimEligibility: empty,
      claimUnitag: empty,
      updateUnitagMetadata: empty,
      changeUnitag: empty,
      deleteUnitag: empty,
      getUnitagAvatarUploadUrl: empty,
    }
  }

  const UnitagsApiFetchClient = createFetchClient({
    baseUrl: getConfig().unitagsApiUrlOverride || `${getCloudflareApiBaseUrl(TrafficFlows.Unitags)}/v2/unitags`,
    getSessionService: () =>
      provideSessionService({ getBaseUrl: () => uniswapUrls.apiBaseUrlV2, getIsSessionServiceEnabled }),
  })

  return createUnitagsApiClient({ fetchClient: UnitagsApiFetchClient })
}

export const UnitagsApiClient = createClient()
