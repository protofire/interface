import { MenuItem } from 'components/NavBar/CompanyMenu/Content'
import { useTabsVisible } from 'components/NavBar/ScreenSizes'
import { useTheme } from 'lib/styled-components'
import { useLocation } from 'react-router-dom'
import { useSwapAndLimitContext } from 'state/swap/useSwapContext'
import { ExternalLink } from 'ui/src/components/icons'
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
  return [
    {
      title: 'Liquidity',
      href: `https://liquidity.flow.com/`,
      icon: <ExternalLink size="$icon.16" color="$neutral2" />,
      internal: false,
    },
    {
      title: 'Bridge',
      href: `https://bridge.flow.com`,
      icon: <ExternalLink size="$icon.16" color="$neutral2" />,
      internal: false,
    },
  ]
}