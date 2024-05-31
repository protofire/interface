import { t } from '@lingui/macro'

export interface MenuSection {
  title: string
  items: MenuItem[]
  closeMenu?: () => void
}

export interface MenuItem {
  label: string
  href: string
  internal?: boolean
  overflow?: boolean
  closeMenu?: () => void
}

export const menuContent: MenuSection[] = [
  {
    title: t`Swap on Zora Network`,
    items: [
      { label: t`Pool`, href: '/pool', internal: true, overflow: true },
      { label: t`Forked Protocol Docs`, href: 'https://docs.uniswap.org/' },
      { label: t`V2 (External)`, href: 'https://univ2.zora.energy/' },
      { label: t`Disclaimer`, href: '/disclaimer', internal: true },
      // { label: t`Vote`, href: '/vote', internal: true },
      // { label: t`Analytics`, href: 'https://info.swap-zora.protofire.io/' },
    ],
  },
  // {
  //   title: t`Forked Protocol`,
  //   items: [
  //     { label: t`Documentation`, href: 'https://docs.uniswap.org/' },
  //     // { label: t`About`, href: 'https://zora.co/about' },
  //     // { label: t`Uniswap Docs`, href: 'https://docs.uniswap.org/' },
  //   ],
  // },
  // {
  //   title: t`Protocol`,
  //   items: [
  //     { label: t`Governance`, href: 'https://uniswap.org/governance' },
  //     { label: t`Developers`, href: 'https://uniswap.org/developers' },
  //   ],
  // },
  // {
  //   title: t`Need help?`,
  //   items: [
  //     { label: t`Contact us`, href: 'https://support.uniswap.org/hc/en-us/requests/new' },
  //     { label: t`Help Center`, href: 'https://support.uniswap.org/hc/en-us' },
  //   ],
  // },
]
