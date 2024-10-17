import styled from 'styled-components'

const StyledParagraph = styled.p`
  padding: 16px;
  border-radius: 16px;
  background-color: #7a421c;
  font-size: 1.1em;
`

export default function DeprecationWarningBanner() {
  return (
    <StyledParagraph>
      Support for Zora Sepolia will be available until October 31st, and this interface will be discontinued.
    </StyledParagraph>
  )
}
