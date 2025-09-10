import { InterfacePageName } from '@uniswap/analytics-events'
import { ReactComponent as SakuraIcon } from 'assets/svg/sakura.svg'
import { SmallButtonPrimary } from 'components/Button'
import { useIsMobile } from 'hooks/screenSize'
import styled from 'lib/styled-components'
import { Link } from 'react-router-dom'
import { ThemedText } from 'theme/components'
import Trace from 'uniswap/src/features/telemetry/Trace'
import { Trans } from 'uniswap/src/i18n'

// const Image = styled.img`
//   max-width: 510px;
//   width: 100%;
//   padding: 0 75px;
// `

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Header = styled(Container)`
  gap: 30px;
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

export default function NotFound() {
  const isMobile = useIsMobile()

  const Title = isMobile ? ThemedText.LargeHeader : ThemedText.Hero
  const Paragraph = isMobile ? ThemedText.HeadlineMedium : ThemedText.HeadlineLarge

  return (
    <PageWrapper>
      <Trace logImpression page={InterfacePageName.NOT_FOUND}>
        <Header>
          <Container>
            <Title>404</Title>
            <Paragraph color="neutral2">
              <Trans i18nKey="common.pageNotFound" />
            </Paragraph>
          </Container>
          <SakuraIcon />
        </Header>
        <SmallButtonPrimary as={Link} to="/">
          <Trans i18nKey="notFound.oops" />
        </SmallButtonPrimary>
      </Trace>
    </PageWrapper>
  )
}
