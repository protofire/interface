import styled from 'styled-components'

import { ReactComponent as DiscordI } from './images/discord.svg'
import { ReactComponent as GithubI } from './images/github.svg'
import { ReactComponent as TwitterI } from './images/twitter-safe.svg'
import { ReactComponent as ExternalLinkI } from './images/external-link.svg'

export const DiscordIcon = styled(DiscordI)<{ size?: number; fill?: string }>`
  height: ${({ size }) => (size ? size + 'px' : '32px')};
  width: ${({ size }) => (size ? size + 'px' : '32px')};
  fill: ${({ fill }) => fill ?? '#98A1C0'};
  opacity: 1;
`

export const TwitterIcon = styled(TwitterI)<{ size?: number; fill?: string }>`
  height: ${({ size }) => (size ? size + 'px' : '32px')};
  width: ${({ size }) => (size ? size + 'px' : '32px')};
  fill: ${({ fill }) => fill ?? '#98A1C0'};
  opacity: 1;
`

export const GithubIcon = styled(GithubI)<{ size?: number; fill?: string }>`
  height: ${({ size }) => (size ? size + 'px' : '32px')};
  width: ${({ size }) => (size ? size + 'px' : '32px')};
  fill: ${({ fill }) => fill ?? '#98A1C0'};
  opacity: 1;
`

export const ExternalLinkIcon = styled(ExternalLinkI)<{
  size?: number
}>`
  height: ${({ size }) => (size ? size + 'px' : '32px')};
  width: ${({ size }) => (size ? size + 'px' : '32px')};
  fill: ${({ theme }) => theme.accent1};
  opacity: 1;
`
