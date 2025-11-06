import { CreditCardIcon } from 'components/Icons/CreditCard'
import { Limit } from 'components/Icons/Limit'
import { Send } from 'components/Icons/Send'
import { SwapV2 } from 'components/Icons/SwapV2'
import { MenuItem } from 'components/NavBar/CompanyMenu/Content'
import { useTabsVisible } from 'components/NavBar/ScreenSizes'
import forkConfig from 'forkConfig'
import { useTheme } from 'lib/styled-components'
import { useLocation } from 'react-router-dom'
import { useSwapAndLimitContext } from 'state/swap/useSwapContext'
import { ExternalLink } from 'ui/src/components/icons'
import { UNIVERSE_CHAIN_INFO } from 'uniswap/src/constants/chains'
import { FeatureFlags } from 'uniswap/src/features/gating/flags'
import { useFeatureFlag } from 'uniswap/src/features/gating/hooks'
import { useTranslation } from 'uniswap/src/i18n'
import { UniverseChainId } from 'uniswap/src/types/chains'

export type TabsSection = {
  title: string
  href: string
  isActive?: boolean
  items?: TabsItem[]
  closeMenu?: () => void
  internal?: boolean
  icon?: JSX.Element
}

export type TabsItem = MenuItem & {
  icon?: JSX.Element
  quickKey: string
}

export const useTabsContent = (props?: { includeNftsLink?: boolean }): TabsSection[] => {
  const { t } = useTranslation()
  const forAggregatorEnabled = useFeatureFlag(FeatureFlags.ForAggregator)
  const { pathname } = useLocation()
  const theme = useTheme()
  const areTabsVisible = useTabsVisible()
  const { chainId: universeChainId } = useSwapAndLimitContext()
  const chainId = universeChainId ? universeChainId : UniverseChainId.FlowMainnet
  return [
    // {
    //   title: t('common.trade'),
    //   href: '/aggregator',
    //   isActive: pathname.startsWith('/swap') || pathname.startsWith('/limit') || pathname.startsWith('/send')
    // },

  ]
}
