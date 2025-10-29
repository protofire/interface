import { Currency } from '@uniswap/sdk-core'
import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
import { Field } from 'components/swap/constants'
import { PageWrapper, SwapWrapper } from 'components/swap/styled'
import { useSupportedChainId } from 'constants/chains'
import { useScreenSize } from 'hooks/screenSize'
import { useAccount } from 'hooks/useAccount'
import { useIsDarkMode } from 'theme/components/ThemeToggle'
import { Flex } from 'ui/src'
import { InterfaceChainId } from 'uniswap/src/types/chains'
import { SwapTab } from 'uniswap/src/types/screens/interface'
import { AggregatorForm } from './AggregatorForm'
import { AggregatorContextProvider } from './AggregatorContext'

interface AggregatorPageProps {
  className?: string
}

export default function AggregatorPage({ className }: AggregatorPageProps) {
  const isDark = useIsDarkMode()
  const screenSize = useScreenSize()
  const isUnsupportedConnectedChain = useSupportedChainId(useAccount().chainId) === undefined
  const shouldDisableTokenInputs = false // For aggregator, we don't need to disable

  return (
    <AggregatorContextProvider>
      <PageWrapper>
        <SwapWrapper isDark={isDark} className={className} id="aggregator-page">
          <Flex width="100%">
            <AggregatorForm disableTokenInputs={shouldDisableTokenInputs} />
          </Flex>
          <NetworkAlert />
        </SwapWrapper>
      </PageWrapper>
    </AggregatorContextProvider>
  )
}

