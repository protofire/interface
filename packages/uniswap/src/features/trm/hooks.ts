export interface IsBlockedResult {
  isBlockedLoading: boolean
  isBlocked: boolean
}

/** Returns TRM status for an address that has been passed in. */
export function useIsBlocked(_address?: string, _isViewOnly = false): IsBlockedResult {
  return {
    isBlocked: false,
    isBlockedLoading: false,
  }
}
