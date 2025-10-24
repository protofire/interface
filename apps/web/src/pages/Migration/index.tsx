import { SmallButtonPrimary } from 'components/Button'
import styled, { createGlobalStyle } from 'lib/styled-components'
import { Link } from 'react-router-dom'
import { ListItem } from 'tamagui'
import { isProdEnv } from "utilities/src/environment"

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

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    justify-content: space-between;
    padding-top: 64px;
  }
`

const PageBackgroundReset = createGlobalStyle`
  html, body #root {
    background-color: rgba(0, 0, 0, 0.7) !important;
  }
`

const isProd = isProdEnv()
const domain = isProd ? 'https://sakuraswap.com/' : 'https://staging.sakuraswap.com/'
const SupportedChainList = [
  { name: 'Abstract', icon: '/images/logos/Abstract_Logo.png', url: `${domain}swap?chain=abstract` },
  { name: 'Anime', icon: '/images/logos/Anime_Logo.png', url: `${domain}swap?chain=anime` },
  { name: 'Zero', icon: '/images/logos/Zero_Logo.png', url: `${domain}swap?chain=zero` },
]

export default function PrivacyPolicy() {
  return (
    <PageWrapper>
      <PageBackgroundReset />
      <Container style={{ maxWidth: '800px', textAlign: 'center' }}>
        <h1>New UI for Reservoir Swap supported chains</h1>
        <p>
          With a focus on building a cross-chain payments system, Relay (former Reservoir) has officially wound down
          Reservoir Swap, handing over support for most chains to Protofire as part of Sakura Swap or standalone
          Frontends.
        </p>

        <p>You can continue LP&apos;ing, managing your positions and swapping via the following interfaces:</p>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
          {SupportedChainList.map((chain) => (
            <a
              key={chain.name}
              href={chain.url}
              target="_blank"
              rel="noreferrer noopener"
              style={{ textDecoration: 'none' }}
            >
              <ListItem
                key={chain.name}
                href={chain.url}
                target="_blank"
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  width: '150px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                hoverStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)',
                }}
              >
                <img src={chain.icon} alt={`${chain.name} logo`} style={{ width: '40px', height: '40px' }} />
                <span style={{ marginTop: '10px', color: '#FFFFFF', fontWeight: 'bold' }}>{chain.name}</span>
              </ListItem>
            </a>
          ))}
        </div>

        <p>Want support for your chain?</p>
        <SmallButtonPrimary as={Link} to="https://swap-support.protofire.io/" target="_blank">
          Add a new chain
        </SmallButtonPrimary>
      </Container>
    </PageWrapper>
  )
}
