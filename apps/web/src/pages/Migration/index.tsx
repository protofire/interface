import styled, { createGlobalStyle } from 'lib/styled-components'

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
  html, body {
    background-image: none !important;
    background-color: ${({ theme }) => theme.background} !important;
  }
`

export default function PrivacyPolicy() {
  return (
    <PageWrapper>
      <PageBackgroundReset />
      <Container>
        <h1>Site Migration in Progress</h1>
        <p>
          We're migrating to a new and improved platform. During this transition,
          some features may be temporarily unavailable. Thank you for your patience
          as we work to enhance your experience.
        </p>

        <h2>Supported Networks</h2>
        <ul>
          <li>Ethereum Mainnet</li>
          <li>Polygon</li>
          <li>Arbitrum</li>
          <li>Optimism</li>
          <li>Base</li>
          <li>BNB Chain</li>
          <li>Avalanche</li>
        </ul>

        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris.
        </p>
      </Container>
    </PageWrapper>
  )
}
