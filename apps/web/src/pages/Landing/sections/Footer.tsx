import { ReactComponent as AddChainButton } from 'assets/svg/add-chain-button.svg'
import { ReactComponent as CompanyIcon } from 'assets/svg/protofire.svg'
import { MenuItem, useMenuContent } from 'components/NavBar/CompanyMenu/Content'
import { MenuLink } from 'components/NavBar/CompanyMenu/MenuDropdown'
import { useTabsContent } from 'components/NavBar/Tabs/TabsContent'
import deprecatedStyled, { useTheme } from 'lib/styled-components'
import { Github, Medium, Twitter } from 'pages/Landing/components/Icons'
import { Wiggle } from 'pages/Landing/components/animations'
import { ADD_NEW_CHAIN_URL } from 'pages/Migration/constants'
import { useMemo } from 'react'
// import { useTogglePrivacyPolicy } from 'state/application/hooks'
import { Anchor, Flex, Separator, Text } from 'ui/src'
import { iconSizes } from 'ui/src/theme'
import { useTranslation } from 'uniswap/src/i18n'
const SOCIAL_ICONS_SIZE = `${iconSizes.icon32}px`

const SocialIcon = deprecatedStyled(Wiggle)`
  flex: 0;
  fill: ${(props) => props.theme.socials};
  cursor: pointer;
  transition: fill;
  transition-duration: 0.2s;
  &:hover {
    fill: ${(props) => props.$hoverColor};
  }
`
// const PolicyLink = styled(Text, {
//   variant: 'body3',
//   animation: '100ms',
//   color: '$neutral2',
//   cursor: 'pointer',
//   hoverStyle: { color: '$neutral1' },
// })

export function Socials({ iconSize }: { iconSize?: string }) {
  return (
    <Flex row gap="$spacing24" maxHeight={iconSize} alignItems="flex-start">
      <SocialIcon color="6B3841" $hoverColor="#DE6579">
        <Anchor href="https://x.com/protofire" target="_blank">
          <Twitter size={iconSize} fill="inherit" />
        </Anchor>
      </SocialIcon>
      <SocialIcon $hoverColor="#DE6579">
        <Anchor href="https://github.com/protofire" target="_blank">
          <Github size={iconSize} fill="inherit" />
        </Anchor>
      </SocialIcon>

      <SocialIcon $hoverColor="#DE6579">
        <Anchor href="https://medium.com/@Protofire_io" target="_blank">
          <Medium size={iconSize} fill="inherit" />
        </Anchor>
      </SocialIcon>
    </Flex>
  )
}

function FooterSection({ title, items }: { title: string; items: MenuItem[] }) {
  const theme = useTheme()
  return (
    <Flex width={130} $md={{ width: '100%' }} flexGrow={0} flexShrink={1} flexBasis="auto" gap={10}>
      <Text variant="body1" color={theme.socials} style={{ fontFamily: "'Dosis', sans-serif" }}>
        {title}
      </Text>
      {items.map((item, index) => (
        <MenuLink
          key={`footer_${title}_${index}}`}
          label={item.label}
          href={item.href}
          internal={item.internal}
          overflow={item.overflow}
          $hoverColor={theme.neutral1}
          $color={theme.socials}
        />
      ))}
    </Flex>
  )
}

export function Footer() {
  const { t } = useTranslation()
  const tabsContent = useTabsContent({ includeNftsLink: false })
  const appSectionItems: MenuItem[] = useMemo(() => {
    return tabsContent.map((tab) => ({
      label: tab.title,
      href: tab.href,
      internal: true,
    }))
  }, [tabsContent])
  const sections = useMenuContent()
  const theme = useTheme()
  return (
    <Flex maxWidth="100%" width="100%" gap="$spacing24" pt="$none" px="$spacing48" pb={40} $lg={{ px: '$spacing40' }}>
      <Flex row $md={{ flexDirection: 'column' }} justifyContent="space-between" gap="$spacing32">
        <Flex height="100%" gap="$spacing60">
          <Flex $md={{ display: 'none' }}>
            <Socials iconSize={SOCIAL_ICONS_SIZE} />
            <span style={{ marginTop: 16, color: theme.socials, fontFamily: "'Dosis', sans-serif" }}>
              Powered by Uniswap V3 & Approved by Uniswap DAO{' '}
            </span>
          </Flex>
        </Flex>
        <Flex row $md={{ flexDirection: 'column' }} height="100%" gap="$spacing16">
          <Flex row gap="$spacing16" justifyContent="space-between" $md={{ width: 'auto' }}>
            <FooterSection title={t('common.app')} items={appSectionItems} />
            <FooterSection title={sections[0].title} items={sections[0].items} />
            <FooterSection title={sections[2].title} items={sections[2].items} />
          </Flex>
        </Flex>
        <Flex $md={{ display: 'flex' }} display="none">
          <Socials iconSize={SOCIAL_ICONS_SIZE} />
        </Flex>
      </Flex>
      <Separator />
      <Flex
        row
        alignItems="center"
        $md={{ flexDirection: 'column', alignItems: 'flex-start' }}
        width="100%"
        justifyContent="space-between"
      >
        <span style={{ color: theme.socials, fontFamily: "'Dosis', sans-serif" }}>2025 Sakura Swap</span>

        <Anchor href={ADD_NEW_CHAIN_URL} target="_blank" style={{ textDecoration: 'none' }}>
          <AddChainButton
            width="160"
            height="50"
            style={{
              cursor: 'pointer',
            }}
          />
        </Anchor>

        <Anchor style={{ textDecoration: 'none', color: theme.socials }} href="https://protofire.io" target="_blank">
          <span style={{ display: 'flex', alignItems: 'center', fontFamily: "'Dosis', sans-serif" }}>
            Supported by <CompanyIcon style={{ marginLeft: 4, marginRight: 4 }} />
          </span>
        </Anchor>
      </Flex>
    </Flex>
  )
}
