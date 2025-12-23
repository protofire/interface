import Navbar from 'components/NavBar/index'
import { InDevelopmentBanner } from 'components/TopLevelBanners/InDevelopmentBanner'
import { MobileAppPromoBanner, useMobileAppPromoBannerEligible } from 'components/TopLevelBanners/MobileAppPromoBanner'
import { UkBanner, useRenderUkBanner } from 'components/TopLevelBanners/UkBanner'
import styled from 'lib/styled-components'
import { GRID_AREAS } from 'pages/App/utils/shared'
import { memo } from 'react'
import { NAV_HEIGHT } from 'theme'
import { Z_INDEX } from 'theme/zIndex'
import { isAppUniswapStagingOrg, isLocalhost } from 'utils/env'

const AppHeader = styled.div`
  grid-area: ${GRID_AREAS.HEADER};
  width: 100vw;
  position: -webkit-sticky;
  position: sticky;
  top: 0px;
  z-index: ${Z_INDEX.sticky};
`
const Banners = styled.div`
  position: relative;
  z-index: ${Z_INDEX.sticky};
`
const NavOnScroll = styled.div<{ $hide: boolean; $transparent?: boolean }>`
  width: 100%;
  transition: transform ${({ theme }) => theme.transition.duration.slow};
  background-color: ${({ theme, $transparent }) => !$transparent && theme.surface1};
  border-bottom: ${({ theme, $transparent }) => !$transparent && `1px solid ${theme.surface3}`};
  ${({ $hide }) => $hide && `transform: translateY(-${NAV_HEIGHT}px);`}
`

export const Header = memo(function Header() {
  const renderUkBanner = useRenderUkBanner()
  const extensionEligible = useMobileAppPromoBannerEligible()

  return (
    <AppHeader id="AppHeader">
      <Banners>
        {extensionEligible && <MobileAppPromoBanner />}
        {renderUkBanner && <UkBanner />}
        {(isAppUniswapStagingOrg(window.location) || isLocalhost(window.location)) && <InDevelopmentBanner />}
      </Banners>
      <NavOnScroll $hide={false} $transparent={false}>
        <Navbar />
      </NavOnScroll>
    </AppHeader>
  )
})
