import { FeatureFlags, useFeatureFlag } from '@universe/gating'
import { LP_INCENTIVES_SUPPORTED_CHAIN_IDS } from 'components/LpIncentives/constants'
import { useAccount } from 'hooks/useAccount'

export function useIsLpIncentivesEnabled(): boolean {
  const { chainId } = useAccount()
  const featureEnabled = useFeatureFlag(FeatureFlags.LpIncentives)
  return featureEnabled && LP_INCENTIVES_SUPPORTED_CHAIN_IDS.has(chainId ?? 0)
}
