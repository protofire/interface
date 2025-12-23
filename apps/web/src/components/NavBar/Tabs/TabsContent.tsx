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
    {
      title: t('common.trade'),
      href: '/swap',
      isActive: pathname.startsWith('/swap') || pathname.startsWith('/limit') || pathname.startsWith('/send'),
      items: [
        {
          label: t('common.swap'),
          icon: <SwapV2 fill={theme.neutral2} />,
          quickKey: 'U',
          href: '/swap',
          internal: true,
        },
        ...(forkConfig.uniSpecificFeaturesEnabled
          ? [
              {
                label: t('swap.limit'),
                icon: <Limit fill={theme.neutral2} />,
                quickKey: 'L',
                href: '/limit',
                internal: true,
              },
            ]
          : []),
        {
          label: t('common.send.button'),
          icon: <Send fill={theme.neutral2} />,
          quickKey: 'E',
          href: '/send',
          internal: true,
        },
        ...(forAggregatorEnabled && forkConfig.uniSpecificFeaturesEnabled
          ? [
              {
                label: t('common.buy.label'),
                icon: <CreditCardIcon fill={theme.neutral2} />,
                quickKey: 'B',
                href: '/buy',
                internal: true,
              },
            ]
          : []),
      ],
    },
    {
      title: t('common.explore'),
      href: `https://info.zircuit-swap.w3us.site/#/${UNIVERSE_CHAIN_INFO[chainId as UniverseChainId].urlParam}`,
      isActive: pathname.startsWith('/explore') || pathname.startsWith('/nfts'),
      icon: <ExternalLink size="$icon.16" color="$neutral2" />,
      internal: false,
      items: [
        {
          label: 'V3 Analytics',
          quickKey: 'T',
          href: `https://info.zircuit-swap.w3us.site/#/${UNIVERSE_CHAIN_INFO[chainId as UniverseChainId].urlParam}`,
          internal: false,
        },
        {
          label: 'V2 Analytics',
          quickKey: 'P',
          href: 'https://v2-info.zircuit-swap.w3us.site',
          internal: false,
        },
      ],
    },
    {
      title: t('common.pool'),
      href: '/pool',
      isActive: pathname.startsWith('/pool'),
      items: [
        { label: t('nav.tabs.viewPosition'), quickKey: 'V', href: '/pool', internal: true },
        {
          label: t('nav.tabs.createPosition'),
          quickKey: 'V',
          href: '/add',
          internal: true,
        },
      ],
    },
    ...(!areTabsVisible && props?.includeNftsLink
      ? [
          {
            title: t('common.nfts'),
            href: '/nfts',
          },
        ]
      : []),
  ]
}
