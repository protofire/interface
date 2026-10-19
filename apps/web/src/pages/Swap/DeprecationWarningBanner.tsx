import deprecatedStyled from 'lib/styled-components'
import { UniverseChainId } from 'uniswap/src/types/chains'

const StyledParagraph = deprecatedStyled.p`
  padding: 16px;
  border-radius: 16px;
  font-size: 1.1em;
  background-color: ${({ theme }) => theme.critical2};
`

interface SunsetNotice {
  message: string
  linkHref: string
  linkText: string
}

const ZERO_NOTICE: SunsetNotice = {
  message: 'Support for Zero Mainnet will be available until July 31st. Read more at:',
  linkHref: 'https://x.com/zerodotnetwork/status/2057529610628128917',
  linkText: 'https://x.com/zerodotnetwork/status/205...917',
}

const ABSTRACT_NOTICE: SunsetNotice = {
  message:
    'Abstract is winding down on December 15, 2026. This interface will be discontinued on that date. Please withdraw or move your funds before then.',
  linkHref: 'https://x.com/AbstractChain/status/2107554632675340420',
  linkText: 'Read the official announcement →',
}

const SUNSET_NOTICES: Partial<Record<UniverseChainId, SunsetNotice>> = {
  [UniverseChainId.Zero]: ZERO_NOTICE,
  [UniverseChainId.AbstractMainnet]: ABSTRACT_NOTICE,
  [UniverseChainId.AbstractTestnet]: ABSTRACT_NOTICE,
}

export function hasSunsetNotice(chainId?: number): boolean {
  return chainId !== undefined && chainId in SUNSET_NOTICES
}

export function DeprecationWarningBanner({ chainId }: { chainId?: number }) {
  const notice = chainId !== undefined ? SUNSET_NOTICES[chainId as UniverseChainId] : undefined
  if (!notice) {
    return null
  }
  return (
    <StyledParagraph>
      {notice.message} <a href={notice.linkHref}>{notice.linkText}</a>
    </StyledParagraph>
  )
}
