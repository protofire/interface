import { useState, useEffect } from 'react'

interface EisenDexsResponse {
  result: {
    [chainId: string]: string[]
  }
}

/**
 * Fetches supported DEXs from Eisen API
 */
export function useEisenDexs(chainId: number) {
  const [dexs, setDexs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDexs = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `https://hiker.hetz-01.eisenfinance.com/public/v1/dexs?chainId=${chainId}`,
          {
            headers: {
              'X-EISEN-KEY': process.env.REACT_APP_EISEN_API_KEY || '',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch DEXs: ${response.statusText}`)
        }

        const data: EisenDexsResponse = await response.json()
        const chainDexs = data.result?.[chainId.toString()] || []
        setDexs(chainDexs)
      } catch (err) {
        console.error('Error fetching DEXs from Eisen API:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch DEXs')
        setDexs([])
      } finally {
        setLoading(false)
      }
    }

    if (chainId) {
      fetchDexs()
    }
  }, [chainId])

  return {
    dexs,
    loading,
    error,
  }
}

