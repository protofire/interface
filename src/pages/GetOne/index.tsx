import { PageWrapper } from 'components/swap/styleds'
import styled from 'styled-components/macro'

const IframeWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;

  iframe {
    border: none;
    border-radius: 32px;
  }
`

export default function GetOne() {
  return (
    <PageWrapper>
      <IframeWrapper>
        <iframe
          title="Iframe Example"
          src="https://simpleswap.io/widget/62d3bc7d-58e0-4815-87da-36fa3bd878ac"
          id="simpleswap-frame"
          name="SimpleSwap Widget"
          width="528px"
          height="392px"
        />
      </IframeWrapper>
    </PageWrapper>
  )
}
