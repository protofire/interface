import UniswapXRouterLabel from 'components/RouterLabel/UniswapXRouterLabel'
import { DefaultTheme } from 'lib/styled-components'
import { QuoteMethod, SubmittableTrade } from 'state/routing/types'
import { isUniswapXTrade } from 'state/routing/utils'
import { ThemedText } from 'theme/components'

export default function RouterLabel({ trade, color }: { trade: SubmittableTrade; color?: keyof DefaultTheme }) {
  const interFont = { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif" }
  
  if (isUniswapXTrade(trade)) {
    return (
      <UniswapXRouterLabel>
        <ThemedText.BodySmall style={interFont}>Uniswap X</ThemedText.BodySmall>
      </UniswapXRouterLabel>
    )
  }

  if (trade.quoteMethod === QuoteMethod.CLIENT_SIDE_FALLBACK) {
    return <ThemedText.BodySmall color={color} style={interFont}>Swap Client</ThemedText.BodySmall>
  }

  return <ThemedText.BodySmall color={color} style={interFont}>Swap API</ThemedText.BodySmall>
}
