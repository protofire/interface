import { NetworkAlert } from 'components/NetworkAlert/NetworkAlert'
import { PageWrapper, SwapWrapper } from 'components/swap/styled'
import { useIsDarkMode } from 'theme/components/ThemeToggle'
import { Flex } from 'ui/src'
import { AggregatorForm } from './AggregatorForm'
import { AggregatorContextProvider } from './AggregatorContext'

interface AggregatorPageProps {
  className?: string
}

export default function AggregatorPage({ className }: AggregatorPageProps) {
  const isDark = useIsDarkMode()
  const shouldDisableTokenInputs = false

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

