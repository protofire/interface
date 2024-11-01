import HolidayUniIcon from 'components/Logo/HolidayUniIcon'
import { SVGProps } from 'components/Logo/UniIcon'
import styled from 'lib/styled-components'

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="22"
      viewBox="0 0 141 127"
      fill="none"
      onClick={onClick}
      cursor="pointer"
    >
      <path d="M138.024 111.005L74.0034 73.9804V0L138.024 37.0245V111.005Z" fill="#80D8FF" />
      <path d="M9.91211 111.005L74.001 73.9804V0L9.91211 37.0245V111.005Z" fill="#7ACFFF" />
      <path
        d="M74.001 111.005L138.021 73.9808L74.001 37.0249L9.91211 73.9808L74.001 111.005Z"
        fill="url(#paint0_linear_401_13)"
      />
      <path opacity="0.3" d="M74.001 147.961L9.91211 111.005V37.0249L74.001 73.9808V147.961Z" fill="#E4F0FE" />
      <path d="M9.91211 111.004L74.001 147.96V111.004L9.91211 73.9797V111.004Z" fill="url(#paint1_linear_401_13)" />
      <path opacity="0.3" d="M74.0034 147.961L138.024 111.005V37.0249L74.0034 73.9808V147.961Z" fill="#D0E6FF" />
      <path d="M138.024 111.004L74.0034 147.96V111.004L138.024 73.9797V111.004Z" fill="url(#paint2_linear_401_13)" />
      <path opacity="0.3" d="M74.001 73.9804L138.021 37.0245L74.001 0L9.91211 37.0245L74.001 73.9804Z" fill="white" />
      <defs>
        <linearGradient
          id="paint0_linear_401_13"
          x1="12.3091"
          y1="87.7931"
          x2="137.355"
          y2="59.8427"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C132CE" />
          <stop offset="1" stopColor="#425AFA" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_401_13"
          x1="34.5456"
          y1="86.3782"
          x2="52.9892"
          y2="147.733"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#425AFA" />
          <stop offset="0.16" stopColor="#5A52F2" />
          <stop offset="0.55" stopColor="#9241DE" />
          <stop offset="0.84" stopColor="#6E56CF" />
          <stop offset="1" stopColor="#C132CE" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_401_13"
          x1="85.3258"
          y1="136.381"
          x2="126.183"
          y2="86.2497"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C132CE" />
          <stop offset="0.1" stopColor="#AB39D6" />
          <stop offset="0.28" stopColor="#8545E3" />
          <stop offset="0.47" stopColor="#684EED" />
          <stop offset="0.65" stopColor="#5355F4" />
          <stop offset="0.83" stopColor="#4659F9" />
          <stop offset="1" stopColor="#425AFA" />
        </linearGradient>
      </defs>
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
