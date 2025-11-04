import { SmallButtonPrimary } from 'components/Button'
import { LightCard } from 'components/Card'
import styled, { useTheme } from 'lib/styled-components'
import { ExternalLink as ExternalLinkIcon } from 'react-feather'
import { ExternalLink } from 'theme/components'
import { isProdEnv } from 'utilities/src/environment'

const chainLinkStyle = {
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '14px',
  borderRadius: '12px',
  backgroundColor: '#fff',
  transition: 'all 0.2s ease',
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${({ theme }) => theme.neutral2};
`

const PageWrapper = styled(Container)`
  flex: 1;
  justify-content: center;
  gap: 50px;
  padding-top: 24px;
  padding-bottom: 48px;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    justify-content: space-between;
    padding-top: 32px;
    padding-bottom: 64px;
  }
`

const isProd = isProdEnv()
const domain = isProd ? 'https://sakuraswap.com/' : 'https://staging.sakuraswap.com/'
const SakuraSwapChains = [
  { name: 'Abstract', icon: '/images/logos/Abstract_Logo.png', url: `${domain}swap?chain=abstract` },
  { name: 'Anime', icon: '/images/logos/Anime_Logo.png', url: `${domain}swap?chain=anime` },
  { name: 'Zero', icon: '/images/logos/Zero_Logo.png', url: `${domain}swap?chain=zero` },
]

const StandaloneChains = [
  { name: 'Shape', icon: '/images/logos/Shape_Logo.png', url: 'https://shapeswap.xyz' },
  { name: 'Harmony', icon: '/images/logos/Harmony_Logo.png', url: 'https://swap.harmony.one' },
  { name: 'More coming soon', icon: '/images/logos/New_Chain.svg', url: '', disabled: true },
]

const SupportChains = [
  { name: 'Add a new chain', icon: '/images/256x256_App_Icon_Pink.svg', url: 'https://integration-form.protofire.io/' },
  { name: 'About Protofire', icon: '/images/logos/Protofire_Logo.png', url: 'https://protofire.io' },
]

const ExternalMigrationChains = [
  {
    name: 'Zora',
    icon: '/images/logos/Zora_Logo.png',
    oldUrl: 'https://swap.zora.energy',
    newUrl: 'https://app.uniswap.org/swap?chain=zora',
  },
]

interface ChainLinkProps {
  chain: { name: string; icon: string; url: string; disabled?: boolean }
  showExternalIcon?: boolean
}

function ChainLink({ chain, showExternalIcon = false }: ChainLinkProps) {
  const theme = useTheme()

  const linkStyle = {
    ...chainLinkStyle,
    backgroundColor: theme.surface2,
    cursor: chain.disabled ? 'default' : 'pointer',
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'translateY(-2px)'
    e.currentTarget.style.backgroundColor = theme.surface1Hovered
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'translateY(0)'
    e.currentTarget.style.backgroundColor = theme.surface2
  }

  const content = (
    <>
      <img src={chain.icon} alt={`${chain.name} logo`} style={{ width: '28px', height: '28px', flexShrink: 0 }} />
      <span style={{ color: theme.neutral1, fontWeight: '600', fontSize: '1rem', textAlign: 'left', flex: 1 }}>
        {chain.name}
      </span>
      {showExternalIcon && <ExternalLinkIcon size={16} style={{ color: theme.neutral2, flexShrink: 0 }} />}
    </>
  )

  if (showExternalIcon) {
    return (
      <ExternalLink href={chain.url} style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {content}
      </ExternalLink>
    )
  }

  return (
    <a href={chain.url} style={linkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {content}
    </a>
  )
}

interface ChainCardProps {
  title: string
  titleColor: string
  backgroundColor: string
  chains: Array<{ name: string; icon: string; url: string; disabled?: boolean }>
  showExternalIcon?: boolean
  description?: string
}

function ChainCard({
  title,
  titleColor,
  backgroundColor,
  chains,
  showExternalIcon = false,
  description,
}: ChainCardProps) {
  const theme = useTheme()

  return (
    <div
      style={{
        backgroundColor,
        borderRadius: '16px',
        padding: '4px 24px 24px 24px',
        flex: '1',
        minWidth: '280px',
        maxWidth: '100%',
        textAlign: 'center',
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: titleColor }}>{title}</h2>
      </div>
      {description && (
        <p style={{ fontSize: '1rem', color: theme.neutral2, marginBottom: '16px', lineHeight: '1.5' }}>
          {description}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {chains.map((chain) => (
          <ChainLink key={chain.name} chain={chain} showExternalIcon={showExternalIcon && !chain.disabled} />
        ))}
      </div>
    </div>
  )
}

export default function MigrationPage() {
  const theme = useTheme()

  return (
    <PageWrapper>
      <LightCard $borderRadius="24px" style={{ textAlign: 'center', maxWidth: '1200px', padding: '48px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: theme.neutral1 }}>
          New UI for Reservoir Swap supported chains
        </h1>
        <p
          style={{
            fontSize: '1.1rem',
            lineHeight: '1.6',
            marginBottom: '1rem',
            color: theme.neutral1,
            maxWidth: '800px',
            margin: '0 auto 1rem',
          }}
        >
          With a focus on building a cross-chain payments system, Relay (former Reservoir) has officially wound down
          Reservoir Swap - <span style={{ fontWeight: 'bold', color: theme.neutral2 }}>https://swap.reservoir.tools</span>, handing over
          support for most chains to Protofire.
        </p>

        <p
          style={{
            fontSize: '1rem',
            marginBottom: '2rem',
            color: theme.accent1,
            maxWidth: '800px',
            margin: '0 auto 2rem',
            fontWeight: 'bold',
          }}
        >
          You can swap and manage your positions via the following Protofire supported interfaces:
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '3rem',
            width: '100%',
          }}
        >
          <ChainCard
            title="Sakura Swap"
            titleColor={theme.accent1}
            backgroundColor={`${theme.accent1}15`}
            chains={SakuraSwapChains}
          />

          <ChainCard
            title="Standalone"
            titleColor="#4C82FB"
            backgroundColor="#4C82FB15"
            chains={StandaloneChains}
            showExternalIcon
          />

          <ChainCard
            title="Don't see your chain?"
            titleColor={theme.neutral2}
            backgroundColor={`${theme.neutral3}15`}
            chains={SupportChains}
            showExternalIcon
            description="Request deployment for your EVM Network!"
          />
        </div>

        <div style={{ marginBottom: '2rem', paddingTop: '2rem', borderTop: `1px solid ${theme.surface2}` }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.neutral1, marginBottom: '0.5rem' }}>
            Previous Standalone Deployments
          </h2>
          <p style={{ fontSize: '1rem', color: theme.neutral2, marginBottom: '1.5rem' }}>
            Chains that have been migrated to external interfaces
          </p>
        </div>
        <div
          style={{
            backgroundColor: `${theme.neutral3}15`,
            borderRadius: '16px',
            padding: '16px 24px 24px 24px',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto 3rem',
            textAlign: 'center',
          }}
        >
          {ExternalMigrationChains.map((chain) => (
            <div key={chain.name}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  marginBottom: '16px',
                }}
              >
                <img src={chain.icon} alt="Zora" style={{ width: '56px', height: '56px', borderRadius: '12px' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme.neutral1 }}>{chain.name}</h3>
              </div>
              <p style={{ fontSize: '1.1rem', color: theme.neutral1, marginBottom: '24px', lineHeight: '1.6' }}>
                Interface for Zora network{' '}
                <span style={{ color: theme.neutral2, fontWeight: 'bold' }}>{chain.oldUrl}</span> is no longer
                available. <br />
                You can swap in Zora network using the official Uniswap interface.
              </p>
              <ExternalLink href={chain.newUrl}>
                <SmallButtonPrimary as="span" width="auto" style={{ gap: '8px', display: 'inline-flex' }}>
                  Swap Zora Here
                  <ExternalLinkIcon size={18} />
                </SmallButtonPrimary>
              </ExternalLink>
            </div>
          ))}
        </div>
      </LightCard>
    </PageWrapper>
  )
}
