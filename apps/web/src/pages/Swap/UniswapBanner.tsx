import { Link } from 'react-router-dom'
import styled from 'styled-components'

const StyledParagraph = styled.p`
  padding: 16px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.accent2};
  color: ${({ theme }) => theme.white};
  font-size: 1.2em;
`

export default function UniswapBanner() {
  return (
    <StyledParagraph>
      Zora Network is now available on the official Uniswap app! Please follow
      this{' '}
      <Link to="https://app.uniswap.org/swap?chain=zora" target="_self">
        link
      </Link>{' '}
      to swap directly on Uniswap.
    </StyledParagraph>
  )
}
