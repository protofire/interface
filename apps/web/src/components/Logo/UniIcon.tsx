import styled from 'styled-components'

import HolidayUniIcon from './HolidayUniIcon'

// ESLint reports `fill` is missing, whereas it exists on an SVGProps type
export type SVGProps = React.SVGProps<SVGSVGElement> & {
  fill?: string
  height?: string | number
  width?: string | number
  gradientId?: string
  clickable?: boolean
}

export const UniIcon = ({ clickable, ...props }: SVGProps) => (
  <Container clickable={clickable}>
    {HolidayUniIcon(props) !== null ? (
      <HolidayUniIcon {...props} />
    ) : (
      <svg width="40" height="40" viewBox="0 0 142 142" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M70.6155 141.23C31.6159 141.23 0.000473022 109.615 0.000473022 70.615C0.000473022 31.6154 31.6159 0 70.6155 0C109.615 0 141.23 31.6154 141.23 70.615C141.23 109.615 109.615 141.23 70.6155 141.23Z"
          fill="url(#paint0_radial_298_997)"
        />
        <defs>
          <radialGradient
            id="paint0_radial_298_997"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(102.676 37.9715) rotate(180) scale(119.284)"
          >
            <stop offset="0.00682297" stopColor="#F2CEFE" />
            <stop offset="0.1913" stopColor="#AFBAF1" />
            <stop offset="0.4982" stopColor="#4281D3" />
            <stop offset="0.666667" stopColor="#2E427D" />
            <stop offset="0.822917" stopColor="#230101" />
            <stop offset="1" stopColor="#8F6B40" />
          </radialGradient>
        </defs>
      </svg>
    )}
  </Container>
)

const Container = styled.div<{ clickable?: boolean }>`
  position: relative;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'auto')};
`
