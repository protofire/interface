import deprecatedStyled from 'lib/styled-components'

const StyledParagraph = deprecatedStyled.p`
  padding: 16px;
  border-radius: 16px;
  font-size: 1.1em;
  background-color: ${({ theme }) => theme.critical2};
`

export function DeprecationWarningBanner() {
  return (
    <StyledParagraph>
      Support for Zero Mainnet will be available until July 31st. Read more at:{' '}
      <a href="https://x.com/zerodotnetwork/status/2057529610628128917">
        https://x.com/zerodotnetwork/status/205...917
      </a>
    </StyledParagraph>
  )
}
