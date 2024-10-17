import styled from 'styled-components'

const StyledParagraph = styled.p`
  padding: 16px;
  border-radius: 16px;
  background-color: #7a421c;
  font-size: 1.1em;
`

export default function TokenWarningBanner() {
  return (
    <StyledParagraph>
      Please be aware that Zora Network does not have a native token and Zora Labs has not endorsed or approved any
      third party tokens purporting to be associated with Zora or Zora Network. Exercise caution with respect to any
      tokens that use Zora imagery or branding.
    </StyledParagraph>
  )
}
