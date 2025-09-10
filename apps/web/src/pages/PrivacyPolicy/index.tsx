import styled from 'lib/styled-components'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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

export default function PrivacyPolicy() {
  return <PageWrapper>Privacy Policy</PageWrapper>
}
