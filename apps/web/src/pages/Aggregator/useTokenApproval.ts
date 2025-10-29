import { useState, useEffect, useMemo } from 'react'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { useTokenAllowance, useUpdateTokenAllowance } from 'hooks/useTokenAllowance'
import { useAccount } from 'hooks/useAccount'

// Token approval hook for aggregator swaps

export interface ApprovalState {
  needsApproval: boolean
  isApproving: boolean
  approve: () => Promise<void>
  error: string | null
}

export function useTokenApproval(
  token: Token | null,
  spender: string | null,
  amount: string | null
): ApprovalState {
  const account = useAccount()
  const [isApproving, setIsApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Convert amount string to CurrencyAmount for the allowance check
  const amountToApprove = useMemo(() => {
    if (!token || !amount) return undefined
    try {
      return CurrencyAmount.fromRawAmount(token, amount)
    } catch {
      return undefined
    }
  }, [token, amount])

  // Check current allowance - this checks if user has approved the spender (router) to spend their tokens
  const { tokenAllowance, isSyncing } = useTokenAllowance(
    token ?? undefined,
    account.address, // owner (user's address)
    spender ?? undefined // spender (router contract address)
  )

  // Hook for updating allowance
  const updateTokenAllowance = useUpdateTokenAllowance(
    amountToApprove,
    spender ?? ''
  )

  // Determine if approval is needed
  // If user hasn't approved the router to spend enough tokens, we need approval
  const needsApproval = useMemo(() => {
    if (!amountToApprove || !tokenAllowance || !spender) return false
    return tokenAllowance.lessThan(amountToApprove)
  }, [amountToApprove, tokenAllowance, spender])

  const approve = async () => {
    if (!amountToApprove || !spender) return

    setIsApproving(true)
    setError(null)

    try {
      await updateTokenAllowance()
    } catch (err) {
      console.error('Approval failed:', err)
      setError(err instanceof Error ? err.message : 'Approval failed')
    } finally {
      setIsApproving(false)
    }
  }

  return {
    needsApproval,
    isApproving,
    approve,
    error,
  }
}
