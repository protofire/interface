import HolidayUniIcon from 'components/Logo/HolidayUniIcon'
import { SVGProps } from 'components/Logo/UniIcon'
import styled from 'lib/styled-components'

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 37 37"
      fill="none"
      onClick={onClick}
      cursor="pointer"
    >
      <defs></defs>
      <circle fill="#000" stroke="#fff" strokeMiterlimit="10" strokeWidth="3" cx="18" cy="18" r="16.5" />
    </svg>
  )
}

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

export const NavIcon = ({ clickable, onClick, ...props }: NavIconProps) => (
  <Container clickable={clickable}>
    {HolidayUniIcon(props) !== null ? <HolidayUniIcon {...props} /> : <Logo onClick={onClick} />}
  </Container>
)
