import { Currency } from '@uniswap/sdk-core'
import { Dispatch, SetStateAction, PropsWithChildren, useState, useMemo } from 'react'
import { UniverseChainId } from 'uniswap/src/types/chains'
import { SwapAndLimitContext, CurrencyState, SwapContext, SwapState, initialSwapState, EMPTY_DERIVED_SWAP_INFO } from 'state/swap/types'
import { SwapTab } from 'uniswap/src/types/screens/interface'
import { FLOW_CHAIN_ID, FLOW_TESTNET_CHAIN_ID } from './mockTokenData'

export function AggregatorContextProvider({ children }: PropsWithChildren) {
  const [chainId, setSelectedChainId] = useState<UniverseChainId | undefined>(FLOW_CHAIN_ID as UniverseChainId)
  const [isTestnet, setIsTestnet] = useState(false)

  // Update chainId when testnet mode changes
  const currentChainId = useMemo(() => {
    return isTestnet ? FLOW_TESTNET_CHAIN_ID : FLOW_CHAIN_ID
  }, [isTestnet])
  const [isUserSelectedToken, setIsUserSelectedToken] = useState(false)
  const [currentTab, setCurrentTab] = useState<SwapTab>(SwapTab.Swap)
  const [currencyState, setCurrencyState] = useState<CurrencyState>({
    inputCurrency: undefined,
    outputCurrency: undefined,
  })
  
  // Also provide swap state for components that need it
  const [swapState, setSwapState] = useState<SwapState>(initialSwapState)
  
  const swapAndLimitValue = useMemo(
    () => ({
      currencyState,
      setCurrencyState: setCurrencyState as Dispatch<SetStateAction<CurrencyState>>,
      prefilledState: {
        inputCurrency: undefined,
        outputCurrency: undefined,
      },
      setSelectedChainId: setSelectedChainId as Dispatch<SetStateAction<UniverseChainId | undefined | null>>,
      isUserSelectedToken,
      setIsUserSelectedToken: setIsUserSelectedToken as Dispatch<SetStateAction<boolean>>,
      currentTab,
      setCurrentTab: setCurrentTab as Dispatch<SetStateAction<SwapTab>>,
      chainId: currentChainId,
      initialChainId: currentChainId,
      multichainUXEnabled: false,
      isSwapAndLimitContext: false,
      isTestnet,
      setIsTestnet,
    }),
    [currentChainId, isUserSelectedToken, currentTab, currencyState, isTestnet]
  )
  
  const swapValue = useMemo(
    () => ({
      swapState,
      setSwapState,
      derivedSwapInfo: EMPTY_DERIVED_SWAP_INFO,
    }),
    [swapState]
  )

  return (
    <SwapAndLimitContext.Provider value={swapAndLimitValue}>
      <SwapContext.Provider value={swapValue}>{children}</SwapContext.Provider>
    </SwapAndLimitContext.Provider>
  )
}

