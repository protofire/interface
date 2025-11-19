import DAODarkMode from 'assets/png/DAO-dark-mode.png'
import DAOLightMode from 'assets/png/DAO-light-mode.png'
import { ReactComponent as CompanyIcon } from 'assets/svg/protofire.svg'
import { MenuItem, useMenuContent } from 'components/NavBar/CompanyMenu/Content'
import { MenuLink } from 'components/NavBar/CompanyMenu/MenuDropdown'
import { useTabsContent } from 'components/NavBar/Tabs/TabsContent'
import deprecatedStyled, { useTheme } from 'lib/styled-components'
import { Discord, Github, Twitter } from 'pages/Landing/components/Icons'
import { Wiggle } from 'pages/Landing/components/animations'
import { useMemo } from 'react'
import { Anchor, Flex, Separator, Text, useIsDarkMode } from 'ui/src'
import { iconSizes } from 'ui/src/theme'
import { useTranslation } from 'uniswap/src/i18n'

const SOCIAL_ICONS_SIZE = `${iconSizes.icon32}px`

const SocialIcon = deprecatedStyled(Wiggle)`
  flex: 0;
  fill: ${(props) => props.theme.neutral1};
  cursor: pointer;
  transition: fill;
  transition-duration: 0.2s;
  &:hover {
    fill: ${(props) => props.$hoverColor};
  }
`

const DAOLogo = deprecatedStyled.img`
  height: 48px;
  width: auto;
  cursor: pointer;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.8;
  }
`

export function Socials({ iconSize }: { iconSize?: string }) {
  return (
    <Flex row gap="$spacing24" maxHeight={iconSize} alignItems="flex-start">
      <SocialIcon $hoverColor="#5c7f7a">
        <Anchor href="https://x.com/stable" target="_blank">
          <Twitter size={iconSize} fill="inherit" />
        </Anchor>
      </SocialIcon>
      <SocialIcon $hoverColor="#5c7f7a">
        <Anchor href="https://discord.com/invite/stablexyz" target="_blank">
          <Discord size={iconSize} fill="inherit" />
        </Anchor>
      </SocialIcon>
    </Flex>
  )
}

function FooterSection({ title, items }: { title: string; items: MenuItem[] }) {
  const theme = useTheme()
  return (
    <Flex width={130} $md={{ width: '100%' }} flexGrow={0} flexShrink={1} flexBasis="auto" gap={10}>
      <Text variant="body1">{title}</Text>
      {items.map((item, index) => (
        <MenuLink
          key={`footer_${title}_${index}}`}
          label={item.label}
          href={item.href}
          internal={item.internal}
          overflow={item.overflow}
          $hoverColor={theme.neutral1}
        />
      ))}
    </Flex>
  )
}

export function Footer() {
  const { t } = useTranslation()
  const isDarkMode = useIsDarkMode()
  //UPDATE: currently not usign NFTs link
  const tabsContent = useTabsContent({ includeNftsLink: false })
  const appSectionItems: MenuItem[] = useMemo(() => {
    return tabsContent.map((tab) => ({
      label: tab.title,
      href: tab.href,
      internal: true,
    }))
  }, [tabsContent])
  const sections = useMenuContent()
  // const brandAssets = {
  //   label: t('common.brandAssets'),
  //   href: 'https://github.com/Uniswap/brand-assets/raw/main/Uniswap%20Brand%20Assets.zip',
  //   internal: false,
  // }

  return (
    <Flex maxWidth="100vw" width="100%" gap="$spacing24" pt="$none" px="$spacing48" pb={40} $lg={{ px: '$spacing40' }}>
      <Flex row $md={{ flexDirection: 'column' }} justifyContent="space-between" gap="$spacing32">
        <Flex height="100%" gap="$spacing60">
          <Flex $md={{ display: 'none' }} flexDirection="column" gap="$spacing16">
            <Socials iconSize={SOCIAL_ICONS_SIZE} />
            {/* <Anchor href="https://gov.uniswap.org/t/rfc-deploy-uniswap-v3-on-shape/25163" target="_blank">
              <DAOLogo src={isDarkMode ? DAODarkMode : DAOLightMode} alt="DAO Logo" />
            </Anchor> */}
          </Flex>
        </Flex>
        <Flex row $md={{ flexDirection: 'column' }} height="100%" gap="$spacing16">
          <Flex row gap="$spacing16" justifyContent="space-between" $md={{ width: 'auto' }}>
            <FooterSection title={t('common.app')} items={appSectionItems} />
            {/* <FooterSection title={sections[0].title} items={[...sections[0].items, brandAssets]} /> */}
            <FooterSection title={sections[0].title} items={sections[0].items} />
          </Flex>
          <Flex row gap="$spacing16" $md={{ width: 'auto' }}>
            {/* <FooterSection title={sections[1].title} items={sections[1].items} /> */}
            <FooterSection title={sections[2].title} items={sections[2].items} />
          </Flex>
        </Flex>
        {/* <Flex $md={{ display: 'flex' }} display="none" flexDirection="column" gap="$spacing16">
          <Socials iconSize={SOCIAL_ICONS_SIZE} />
          <Anchor href="https://gov.uniswap.org/t/rfc-deploy-uniswap-v3-on-shape/25163" target="_blank">
            <DAOLogo src={isDarkMode ? DAODarkMode : DAOLightMode} alt="DAO Logo" />
          </Anchor>
        </Flex> */}
      </Flex>
      <Separator />
      <Flex
        row
        alignItems="center"
        $md={{ flexDirection: 'column', alignItems: 'flex-start' }}
        width="100%"
        justifyContent="space-between"
      >
        <Text variant="body3">2025 StableSwap</Text>
        <Anchor style={{ textDecoration: 'none' }} href="https://protofire.io" target="_blank">
          <Text variant="body3" style={{ display: 'flex', alignItems: 'center' }}>
            Supported by <CompanyIcon style={{ marginLeft: 4, marginRight: 4 }} />
          </Text>
        </Anchor>
        {/* <Flex row alignItems="center" gap="$spacing16">
          <Anchor textDecorationLine="none" href="https://uniswap.org/trademark" target="_blank">
            <PolicyLink>{t('common.trademarkPolicy')}</PolicyLink>
          </Anchor>
          <PolicyLink href="/privacy">{t('common.privacyPolicy')}</PolicyLink>
        </Flex> */}
      </Flex>
    </Flex>
  )
}
