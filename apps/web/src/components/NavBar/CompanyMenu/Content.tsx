import { useTranslation } from 'uniswap/src/i18n'

export interface MenuItem {
  label: string
  href: string
  internal?: boolean
  overflow?: boolean
  closeMenu?: () => void
  blank?: boolean
}

export interface MenuSection {
  title: string
  items: MenuItem[]
  closeMenu?: () => void
}

export const useMenuContent = (): MenuSection[] => {
  const { t } = useTranslation()

  return [
    {
      title: 'Help',
      items: [
        { label: 'Contact Support', href: 'https://swap-support.protofire.io/' },
        { label: 'Deployed Contracts', href: '/deployments' },
      ],
    },
    {
      title: t('common.company'),
      items: [{ label: 'Shape', href: 'https://shape.network/' }],
    },
    {
      title: 'Terms',
      items: [
        { label: 'Terms and Conditions', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
      ],
    },
    // {
    //   title: t('common.protocol'),
    //   items: [
    //     { label: t('common.vote'), href: 'https://vote.uniswapfoundation.org' },
    //     { label: t('common.governance'), href: 'https://uniswap.org/governance' },
    //     { label: t('common.developers'), href: 'https://uniswap.org/developers' },
    //   ],
    // },
    // {
    //   title: t('common.needHelp'),
    //   items: [
    //     { label: t('common.helpCenter'), href: 'https://support.uniswap.org/hc/en-us' },
    //     { label: t('common.contactUs.button'), href: 'https://support.uniswap.org/hc/en-us/requests/new' },
    //   ],
    // },
  ]
}
