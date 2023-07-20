import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import { ExternalLink, ThemedText } from 'theme'

const StyledLink = styled(ExternalLink)`
  font-weight: 600;
  color: ${({ theme }) => theme.textSecondary};
`

const LastUpdatedText = styled.span`
  color: ${({ theme }) => theme.textTertiary};
`

const LAST_UPDATED_DATE = '11.17.22'

export default function PrivacyPolicyNotice() {
  return (
    <ThemedText.Caption color="textSecondary">
      <Trans>By connecting a wallet, you agree to Protofire&apos;</Trans>{' '}
      <StyledLink href="https://www.notion.so/Terms-of-Service-452ba9ee953e460983ed7e5558dc0397">
        <Trans>Terms of Service</Trans>{' '}
      </StyledLink>
      <Trans>and consent to its</Trans>{' '}
      <StyledLink href="https://harmonyone.notion.site/Privacy-Policy-3a2eef1087c14a5a84eec272ceb76f70?pvs=4">
        <Trans>Privacy Policy.</Trans>
      </StyledLink>
      <LastUpdatedText>
        {' ('}
        <Trans>Last Updated</Trans>
        {/* {` ${LAST_UPDATED_DATE})`} */}
        {` 7.19.23)`}

      </LastUpdatedText>
    </ThemedText.Caption>
  )
}
