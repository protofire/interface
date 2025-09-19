import styled from 'lib/styled-components'
import { useState } from 'react'
import { X } from 'react-feather'
import { BREAKPOINTS } from 'theme'
import { ThemedText } from 'theme/components'
import { Z_INDEX } from 'theme/zIndex'

const BannerWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  background-color: ${({ theme }) => theme.surface1};
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.surface3};
  z-index: ${Z_INDEX.fixed};
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
`

const BannerContents = styled.div`
  max-width: ${({ theme }) => `${theme.maxWidth}px`};
  width: 100%;
  display: flex;

  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
    flex-direction: column;
  }
`

const BannerTextWrapper = styled(ThemedText.BodySecondary)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media only screen and (max-width: ${BREAKPOINTS.md}px) {
    @supports (-webkit-line-clamp: 2) {
      white-space: initial;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }

  @media only screen and (max-width: ${BREAKPOINTS.sm}px) {
    @supports (-webkit-line-clamp: 3) {
      white-space: initial;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
  }
`

const CloseButton = styled.button`
  cursor: pointer;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.neutral1};
`

const bannerText =
  'This interface is still in the development phase and used only for internal testing purposes. The banner will appear in local or staging environment'

export function InDevelopmentBanner() {
  const [show, setShow] = useState(true)
  return show ? (
    <BannerWrapper>
      <BannerContents style={{ alignItems: 'center', justifyContent: 'center' }}>
        <BannerTextWrapper lineHeight="24px">{bannerText}</BannerTextWrapper>
      </BannerContents>
      <CloseButton onClick={() => setShow(false)}>
        <X size={24} />
      </CloseButton>
    </BannerWrapper>
  ) : (
    <></>
  )
}
