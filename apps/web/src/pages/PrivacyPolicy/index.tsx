import styled from 'lib/styled-components'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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

const POLICY_LINK = 'https://raw.githubusercontent.com/protofire/swap-legal/refs/heads/main/privacy.md'

const SwapPrivacyPolicy = () => {
  const [content, setContent] = useState<string>('')

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(POLICY_LINK)
        const text = await response.text()
        const processedText = text.replace('\\[Insert Date\\]', EFFECTIVE_DATE)
        setContent(processedText)
      } catch (error) {
        setContent('Failed to load privacy')
      }
    }
    fetchContent()
  }, [])

  return <main>{content ? <ReactMarkdown source={content} /> : <>Loading privacy policy...</>}</main>
}
export default function PrivacyPolicy() {
  return (
    <PageWrapper>
      <SwapPrivacyPolicy />
    </PageWrapper>
  )
}
