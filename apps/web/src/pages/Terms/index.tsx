import styled, { createGlobalStyle } from 'lib/styled-components'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${({ theme }) => theme.neutral2};
`

const PageWrapper = styled(Container)`
  flex: 1;
  justify-content: center;
  gap: 50px;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    justify-content: space-between;
    padding-top: 64px;
  }
`
const EFFECTIVE_DATE = 'September 11, 2025.'

const TERMS_LINKS = 'https://raw.githubusercontent.com/protofire/swap-legal/refs/heads/main/terms.md'

const PageBackgroundReset = createGlobalStyle`
  html, body {
    background-image: none !important;
    background-color: ${({ theme }) => theme.background} !important;
  }
`

const SwapTerms = () => {
  const [content, setContent] = useState<string>('')

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(TERMS_LINKS)
        const text = await response.text()
        const processedText = text.replace('\\[Insert Date\\]', EFFECTIVE_DATE)
        setContent(processedText)
      } catch (error) {
        setContent('Failed to load privacy')
      }
    }
    fetchContent()
  }, [])

  return <main>{content ? <ReactMarkdown source={content} /> : <>Loading terms...</>}</main>
}
export default function Terms() {
  return (
    <PageWrapper>
      <PageBackgroundReset />
      <SwapTerms />
    </PageWrapper>
  )
}
