import { ReactComponent as Logo } from 'assets/svg/logo.svg'
import useCopyClipboard from 'hooks/useCopyClipboard'
import styled, { useTheme } from 'lib/styled-components'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Copy } from 'react-feather'
import { BREAKPOINTS } from 'theme'
import { colors } from 'theme/colors'
import { ExternalLink, ThemedText } from 'theme/components'

type Mode = 'light' | 'dark'

const ACCENT_COLORS = {
  light: {
    accent1: { name: 'Accent 1', hex: colors.accent1_light },
    accent2: { name: 'Accent 2', hex: colors.accent2_light },
    accent3: { name: 'Accent 3', hex: colors.accent3_light },
  },
  dark: {
    accent1: { name: 'Accent 1', hex: colors.accent1_dark },
    accent2: { name: 'Accent 2', hex: colors.accent2_dark },
    accent3: { name: 'Accent 3', hex: colors.accent3_dark },
  },
} as const

function extractFontName(fontFamily: string): string | null {
  const match = fontFamily.match(/['"]?([^,'"]+)['"]?/i)
  return match ? match[1].trim() : null
}

function getGoogleFontsUrl(fontName: string): string {
  const normalizedName = fontName.replace(/\s+/g, '+')
  return `https://fonts.google.com/specimen/${normalizedName}`
}

function useFontsFromTheme() {
  const theme = useTheme()

  return useMemo(() => {
    const fonts = (theme as any).fonts || {}
    const fontSet = new Set<string>()
    const fontMap = new Map<string, string>()

    Object.values(fonts).forEach((fontFamily) => {
      if (typeof fontFamily === 'string') {
        const fontName = extractFontName(fontFamily)
        if (fontName) {
          const displayName = fontName.toLowerCase() === 'inherit' ? 'Inter' : fontName
          const actualFamily =
            fontName.toLowerCase() === 'inherit'
              ? "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
              : fontFamily

          if (!fontSet.has(displayName)) {
            fontSet.add(displayName)
            fontMap.set(displayName, actualFamily)
          }
        }
      }
    })

    if ((theme as any).text?.heading?.fontFamily) {
      const headingFontFamily = (theme as any).text.heading.fontFamily
      if (typeof headingFontFamily === 'string') {
        const headingFont = extractFontName(headingFontFamily)
        if (headingFont) {
          const displayName = headingFont.toLowerCase() === 'inherit' ? 'Inter' : headingFont
          const actualFamily =
            headingFont.toLowerCase() === 'inherit'
              ? "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
              : headingFontFamily

          if (!fontSet.has(displayName)) {
            fontSet.add(displayName)
            fontMap.set(displayName, actualFamily)
          }
        }
      }
    }

    return Array.from(fontSet).map((name) => ({
      name,
      family: fontMap.get(name) || `${name}, sans-serif`,
      sample: "Let's Swap!",
      googleFontsUrl: getGoogleFontsUrl(name),
    }))
  }, [theme])
}

const LOGOS = [
  {
    title: 'Without Text',
    component: <Logo width={100} height={100} />,
    svgPath: '/assets/svg/logo.svg',
  },
] as const

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 32px 40px;
  max-width: 2000px;
  margin: 0 auto;

  @media (max-width: ${BREAKPOINTS.md}px) {
    gap: 24px;
    padding: 24px 20px;
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    gap: 20px;
    padding: 16px 12px;
  }
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const SectionTitle = styled(ThemedText.HeadlineLarge)`
  margin-bottom: 0;
`

const ColorsGridContainer = styled.div`
  position: relative;
  min-height: 200px;
`

const ColorsGrid = styled.div<{ $isVisible: boolean }>`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transform: ${({ $isVisible }) => ($isVisible ? 'translateY(0)' : 'translateY(8px)')};
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
  position: ${({ $isVisible }) => ($isVisible ? 'relative' : 'absolute')};
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: ${({ $isVisible }) => ($isVisible ? 'auto' : 'none')};

  @media (max-width: ${BREAKPOINTS.md}px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.surface3};
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`

const ColorCard = Card

const ColorIndicator = styled.div<{ color: string }>`
  width: 100%;
  height: 100px;
  background-color: ${({ color }) => color};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.surface3};
`

const ColorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const ColorHex = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Courier New', monospace;
  color: ${({ theme }) => theme.neutral2};
  font-size: 13px;
`

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`

const TabButton = styled.button<{ $isActive: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: ${({ theme, $isActive }) => ($isActive ? theme.surface2 : 'transparent')};
  color: ${({ theme, $isActive }) => ($isActive ? theme.neutral1 : theme.neutral2)};
  font-size: 14px;
  font-weight: ${({ $isActive }) => ($isActive ? 600 : 400)};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $isActive }) => ($isActive ? theme.surface2 : theme.surface3)};
    color: ${({ theme }) => theme.neutral1};
  }
`

const LogosGrid = styled.div<{ $itemCount: number }>`
  display: grid;
  grid-template-columns: ${({ $itemCount }) => ($itemCount === 1 ? '1fr' : 'repeat(2, 1fr)')};
  gap: 16px;

  @media (max-width: ${BREAKPOINTS.md}px) {
    grid-template-columns: 1fr;
  }
`

const FontsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: ${BREAKPOINTS.md}px) {
    grid-template-columns: 1fr;
  }
`

const FontCard = Card

const CardTitle = styled(ThemedText.HeadlineSmall)`
  font-weight: 600;
`

const ColorName = CardTitle
const FontName = CardTitle
const LogoTitle = CardTitle

const FontSample = styled.div<{ fontFamily: string }>`
  font-family: ${({ fontFamily }) => fontFamily};
  font-size: 24px;
  color: ${({ theme }) => theme.neutral1};
  padding: 12px 0;
`

const LogoContainer = styled(Card)`
  padding: 20px;
  align-items: center;
`

const LogoDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: ${({ theme }) => theme.surface2};
  border-radius: 8px;
  width: 100%;
  height: 100px;
  min-height: 100px;
`

const LogoActions = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  justify-content: center;
`

const CopySvgButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.surface2};
  border: 1px solid ${({ theme }) => theme.surface3};
  border-radius: 6px;
  cursor: pointer;
  color: ${({ theme }) => theme.neutral1};
  font-size: 13px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.surface3};
    border-color: ${({ theme }) => theme.accent1};
  }
`

const CopyIconWrapper = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: ${({ theme }) => theme.neutral2};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.accent1};
  }
`

function CopyButton({ onCopy, isCopied }: { onCopy: () => void; isCopied: boolean }) {
  return (
    <CopyIconWrapper onClick={onCopy} type="button">
      {isCopied ? <Check size={16} /> : <Copy size={16} />}
    </CopyIconWrapper>
  )
}

function ColorHexWithCopy({ hex }: { hex: string }) {
  const [isCopied, copy] = useCopyClipboard()

  return (
    <ColorHex>
      {hex}
      <CopyButton onCopy={() => copy(hex)} isCopied={isCopied} />
    </ColorHex>
  )
}

function LogoWithCopy({
  title,
  logoComponent,
  svgPath,
}: {
  title: string
  logoComponent: React.ReactNode
  svgPath?: string
}) {
  const [isCopied, copy] = useCopyClipboard()
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const logoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (svgPath) {
      fetch(svgPath)
        .then((res) => res.text())
        .then((text) => {
          if (
            text.trim().startsWith('<svg') ||
            text.trim().startsWith('<?xml') ||
            text.trim().startsWith('<!DOCTYPE svg')
          ) {
            setSvgContent(text)
          } else {
            setSvgContent(null)
          }
        })
        .catch(() => {
          setSvgContent(null)
        })
    }
  }, [svgPath])

  const handleCopy = useCallback(() => {
    if (svgContent && (svgContent.trim().startsWith('<svg') || svgContent.trim().startsWith('<?xml'))) {
      copy(svgContent)
    } else if (logoRef.current) {
      const svgElement = logoRef.current.querySelector('svg')
      if (svgElement) {
        const clonedSvg = svgElement.cloneNode(true) as SVGElement
        const serializer = new XMLSerializer()
        const svgString = serializer.serializeToString(clonedSvg)
        copy(svgString)
      }
    }
  }, [svgContent, copy])

  return (
    <LogoContainer>
      <LogoTitle>{title}</LogoTitle>
      <LogoDisplay ref={logoRef}>{logoComponent}</LogoDisplay>
      <LogoActions>
        <CopySvgButton onClick={handleCopy} type="button">
          {isCopied ? <Check size={16} /> : <Copy size={16} />}
          {isCopied ? 'Copied!' : 'Copy SVG'}
        </CopySvgButton>
      </LogoActions>
    </LogoContainer>
  )
}

function ColorCardContent({ color }: { color: { name: string; hex: string } }) {
  return (
    <>
      <ColorIndicator color={color.hex} />
      <ColorInfo>
        <ColorName>{color.name}</ColorName>
        <ColorHexWithCopy hex={color.hex} />
      </ColorInfo>
    </>
  )
}

function ModeTabs({ activeMode, onModeChange }: { activeMode: Mode; onModeChange: (mode: Mode) => void }) {
  return (
    <TabsContainer>
      <TabButton $isActive={activeMode === 'light'} onClick={() => onModeChange('light')} type="button">
        Light Mode
      </TabButton>
      <TabButton $isActive={activeMode === 'dark'} onClick={() => onModeChange('dark')} type="button">
        Dark Mode
      </TabButton>
    </TabsContainer>
  )
}

function ColorsSection() {
  const [activeMode, setActiveMode] = useState<Mode>('light')

  return (
    <Section>
      <SectionTitle>Colors</SectionTitle>
      <ModeTabs activeMode={activeMode} onModeChange={setActiveMode} />
      <ColorsGridContainer>
        <ColorsGrid $isVisible={activeMode === 'light'}>
          {Object.values(ACCENT_COLORS.light).map((color) => (
            <ColorCard key={color.name}>
              <ColorCardContent color={color} />
            </ColorCard>
          ))}
        </ColorsGrid>
        <ColorsGrid $isVisible={activeMode === 'dark'}>
          {Object.values(ACCENT_COLORS.dark).map((color) => (
            <ColorCard key={color.name}>
              <ColorCardContent color={color} />
            </ColorCard>
          ))}
        </ColorsGrid>
      </ColorsGridContainer>
    </Section>
  )
}

function LogosSectionComponent() {
  return (
    <Section>
      <SectionTitle>Logos</SectionTitle>
      <LogosGrid $itemCount={LOGOS.length}>
        {LOGOS.map((logo) => (
          <LogoWithCopy key={logo.title} title={logo.title} logoComponent={logo.component} svgPath={logo.svgPath} />
        ))}
      </LogosGrid>
    </Section>
  )
}

function FontsSectionComponent() {
  const fonts = useFontsFromTheme()

  if (fonts.length === 0) {
    return null
  }

  return (
    <Section>
      <SectionTitle>Fonts</SectionTitle>
      <FontsGrid>
        {fonts.map((font) => (
          <FontCard key={font.name}>
            <FontName>{font.name}</FontName>
            <FontSample fontFamily={font.family}>{font.sample}</FontSample>
            <ExternalLink href={font.googleFontsUrl}>Check on Google Fonts</ExternalLink>
          </FontCard>
        ))}
      </FontsGrid>
    </Section>
  )
}

export default function BrandKit() {
  return (
    <PageWrapper>
      <ColorsSection />
      <LogosSectionComponent />
      <FontsSectionComponent />
    </PageWrapper>
  )
}
