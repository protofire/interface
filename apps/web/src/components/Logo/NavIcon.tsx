import { SVGProps } from 'components/Logo/UniIcon'
import styled from 'lib/styled-components'
import { ReactComponent as StableLogo } from 'assets/svg/stable.svg'
import { ReactComponent as StableLogoDark } from 'assets/svg/stable-dark.svg'
import { useIsDarkMode } from 'theme/components/ThemeToggle'

const Container = styled.div<{ clickable?: boolean }>`
  position: relative;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'auto')};
  display: flex;
  justify-content: center;
  align-items: center;
`

type NavIconProps = SVGProps & {
  clickable?: boolean
  onClick?: () => void
}

export const NavIcon = ({ clickable, onClick }: NavIconProps) => {
  const darkmode = useIsDarkMode()
  return <Container clickable={clickable}>
    {darkmode ? <StableLogo width={20} height={20} onClick={onClick} /> : <StableLogoDark width={20} height={20} onClick={onClick} />}
  </Container>
}
