import { useState, useEffect, useMemo } from 'react'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'
import { useTokenAllowance, useUpdateTokenAllowance } from 'hooks/useTokenAllowance'
import { useAccount } from 'hooks/useAccount'
import { useTransactionAdder, useIsTransactionPending } from 'state/transactions/hooks'
import { ApproveTransactionInfo } from 'state/transactions/types'

// Token approval hook for aggregator swaps

export interface ApprovalState {
  needsApproval: boolean
  isApproving: boolean
  approvalPending: boolean
  approve: () => Promise<void>
  error: string | null
}

// Extended approval info with token metadata for better display
interface ExtendedApproveTransactionInfo extends ApproveTransactionInfo {
  tokenSymbol?: string
  tokenLogoURI?: string
}

export function useTokenApproval(
  token: Token | null,
  spender: string | null,
  amount: string | null,
  logoURI?: string
): ApprovalState {
  const account = useAccount()
  const addTransaction = useTransactionAdder()
  const [isApproving, setIsApproving] = useState(false)
  const [approvalTxHash, setApprovalTxHash] = useState<string | undefined>(undefined)
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

  // Check if approval transaction is pending
  const approvalPending = useIsTransactionPending(approvalTxHash)

  const approve = async () => {
    if (!amountToApprove || !spender) return

    setIsApproving(true)
    setError(null)
    setApprovalTxHash(undefined)

    try {
      const { response, info } = await updateTokenAllowance()
      // Extend approval info with token symbol and logoURI for better display in history
      const extendedInfo: ExtendedApproveTransactionInfo = {
        ...info,
        tokenSymbol: token?.symbol,
        tokenLogoURI: logoURI || (token as any)?.logoURI, // Use provided logoURI or from token list
      }
      // Add transaction to the transaction list so it can be tracked
      addTransaction(response, extendedInfo as any)
      // Store the transaction hash to track pending status
      setApprovalTxHash(response.hash)
    } catch (err) {
      console.error('Approval failed:', err)
      setError(err instanceof Error ? err.message : 'Approval failed')
      setApprovalTxHash(undefined)
    } finally {
      setIsApproving(false)
    }
  }

  // Reset approvalTxHash when approval is no longer needed (transaction confirmed)
  useEffect(() => {
    if (!needsApproval && approvalTxHash && !approvalPending) {
      setApprovalTxHash(undefined)
    }
  }, [needsApproval, approvalTxHash, approvalPending])

  return {
    needsApproval,
    isApproving,
    approvalPending,
    approve,
    error,
  }
}
