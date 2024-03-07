import { BaseVariant, FeatureFlag, useBaseFlag } from '../index'

export function useSendEnabledFlag(): BaseVariant {
  return useBaseFlag(FeatureFlag.sendEnabled)
}

export function useSendEnabled(): boolean {
  // return useSendEnabledFlag() === BaseVariant.Enabled
  // TODO: re-enable once supported
  return false
}
