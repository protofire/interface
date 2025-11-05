import { Currency, Token } from '@uniswap/sdk-core'
import Modal from 'components/Modal'
import { useState } from 'react'
import { SearchInput } from 'components/SearchModal/styled'
import styled from 'lib/styled-components'
import { useEisenTokens } from './useEisenTokens'
import { FLOW_CHAIN_ID } from './mockTokenData'
import { useSwapAndLimitContext } from 'state/swap/useSwapContext'

const ModalContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  flex: 1 1;
  position: relative;
`

const HeaderSection = styled.div`
  padding: 16px 20px 0 20px;
  flex-shrink: 0;
`

const ModalTitle = styled.div`
  font-size: 20px;
  font-weight: 535;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.neutral1};
`

const SearchSection = styled.div`
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.surface3};
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
`

const TokenItem = styled.button<{ $selected: boolean; $disabled: boolean }>`
  background: ${({ $selected, theme }) => ($selected ? theme.surface2 : 'transparent')};
  border: none;
  border-radius: 0;
  padding: 4px 20px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr);
  grid-gap: 16px;
  align-items: center;
  width: 100%;
  text-align: left;
  transition: background 0.15s;
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
  height: 60px;
  box-sizing: border-box;
  
  &:hover {
    ${({ $disabled, theme }) => !$disabled && `
      background-color: ${theme.deprecated_hoverDefault};
    `}
  }
`

const TokenIcon = styled.div<{ $logoUrl?: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme, $logoUrl }) => $logoUrl ? 'transparent' : theme.accent1};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
  font-size: 16px;
  font-weight: 535;
  overflow: hidden;
  ${({ $logoUrl }) => $logoUrl && `
    background-image: url(${$logoUrl});
    background-size: cover;
    background-position: center;
  `}
`

const TokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  overflow: hidden;
`

const TokenName = styled.div`
  font-size: 16px;
  font-weight: 535;
  color: ${({ theme }) => theme.neutral1};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TokenSymbol = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.neutral2};
  font-weight: 485;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 535;
  margin-bottom: 8px;
  margin-top: 8px;
  color: ${({ theme }) => theme.neutral2};
`

const NoResults = styled.div`
  color: ${({ theme }) => theme.neutral2};
  font-weight: 485;
`

const ScrollableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  
  /* Thin scrollbar styling - overlay mode */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.surface3} transparent;
  
  &::-webkit-scrollbar {
    width: 4px;
    background: transparent;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.surface3};
    border-radius: 8px;
  }
`

interface MockTokenSelectModalProps {
  isOpen: boolean
  onDismiss: () => void
  onCurrencySelect: (currency: Currency) => void
  selectedCurrency?: Currency | null
  otherCurrency?: Currency | null
}

export function MockTokenSelectModal({
  isOpen,
  onDismiss,
  onCurrencySelect,
  selectedCurrency,
  otherCurrency,
}: MockTokenSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const context = useSwapAndLimitContext() as any
  const chainId = context?.chainId || FLOW_CHAIN_ID
  
  // Fetch tokens from Eisen API
  const { tokens: allTokens, loading } = useEisenTokens(chainId)
  
  // Filter tokens based on search query
  const filteredTokens = allTokens.filter((token) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      token.name.toLowerCase().includes(query) ||
      token.symbol.toLowerCase().includes(query) ||
      token.coinKey.toLowerCase().includes(query) ||
      token.address.toLowerCase().includes(query)
    )
  })
  
  const handleSelectToken = (token: any) => {
    // Import the function dynamically to avoid circular dependencies
    import('./mockTokenData').then(({ mockTokenToToken }) => {
      const currency = mockTokenToToken(token)
      onCurrencySelect(currency)
      onDismiss()
    })
  }
  
  const handleDismiss = () => {
    setSearchQuery('')
    onDismiss()
  }
  
  return (
    <Modal isOpen={isOpen} onDismiss={handleDismiss} height="90vh" maxHeight={650} maxWidth={420}>
      <ModalContentWrapper>
        <HeaderSection>
          <ModalTitle>
            Select a token
            <button onClick={handleDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: 'inherit' }}>
              ×
            </button>
          </ModalTitle>
        </HeaderSection>
        
        <SearchSection>
          <SearchInput
            type="text"
            placeholder="Search name or paste address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
        </SearchSection>
        
        <ScrollableContainer>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              Loading tokens...
            </div>
          ) : filteredTokens.length === 0 ? (
            <NoResults style={{ textAlign: 'center', padding: '40px 20px' }}>
              No tokens found
            </NoResults>
          ) : (
            <>
              <div style={{ padding: '8px 20px', marginBottom: '8px' }}>
                <SectionTitle>Popular tokens</SectionTitle>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '20px' }}>
                {filteredTokens.map((token) => {
                  // Create a temporary token for comparison using mockTokenToToken
                  const { mockTokenToToken } = require('./mockTokenData')
                  const tempToken = mockTokenToToken(token)
                  const isSelected = !!selectedCurrency?.equals(tempToken)
                  const isOther = !!otherCurrency?.equals(tempToken)
                  const disabled = isSelected || isOther

                  // Use token icon if available, otherwise show first letter
                  const hasIcon = !!token.icon
                  const iconContent = hasIcon ? null : token.symbol.charAt(0)

                  return (
                    <TokenItem
                      key={token.address}
                      onClick={() => handleSelectToken(token)}
                      disabled={!!disabled}
                      $selected={isSelected}
                      $disabled={!!disabled}
                    >
                      <TokenIcon $logoUrl={token.icon}>
                        {iconContent}
                      </TokenIcon>
                      <TokenInfo>
                        <TokenName>{token.name}</TokenName>
                        <TokenSymbol>{token.symbol}</TokenSymbol>
                      </TokenInfo>
                    </TokenItem>
                  )
                })}
              </div>
            </>
          )}
        </ScrollableContainer>
      </ModalContentWrapper>
    </Modal>
  )
}

