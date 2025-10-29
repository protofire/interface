import { Currency, Token } from '@uniswap/sdk-core'
import Modal from 'components/Modal'
import { useState } from 'react'
import { SearchInput } from 'components/SearchModal/styled'
import styled from 'lib/styled-components'
import { useEisenTokens } from './useEisenTokens'
import { FLOW_CHAIN_ID } from './mockTokenData'
import { useSwapAndLimitContext } from 'state/swap/useSwapContext'

const ModalTitle = styled.div`
  font-size: 20px;
  font-weight: 535;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.neutral1};
`

const TokenItem = styled.button<{ $selected: boolean; $disabled: boolean }>`
  background: ${({ $selected, theme }) => ($selected ? theme.surface2 : 'transparent')};
  border: none;
  border-radius: 12px;
  padding: 12px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;
  transition: background 0.15s;
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
  
  &:hover {
    ${({ $disabled, theme }) => !$disabled && `
      background: ${theme.surface2};
    `}
  }
`

const TokenIcon = styled.div<{ $logoUrl?: string }>`
  width: 40px;
  height: 40px;
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
  flex: 1;
`

const TokenName = styled.div`
  font-size: 16px;
  font-weight: 535;
  color: ${({ theme }) => theme.neutral1};
`

const TokenSymbol = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.neutral2};
  font-weight: 485;
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
    <Modal isOpen={isOpen} onDismiss={handleDismiss} maxHeight={650} minHeight={600}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
        <div style={{ padding: '20px 20px 0 20px' }}>
          <ModalTitle>
            Select a token
            <button onClick={handleDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}>
              ×
            </button>
          </ModalTitle>
        </div>
        
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--surface3)' }}>
          <SearchInput
            type="text"
            placeholder="Search name or paste address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0px 20px 0px', minHeight: '450px' }}>
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
              <div style={{ padding: '0 20px', marginBottom: '8px' }}>
                <SectionTitle>Popular tokens</SectionTitle>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 20px 20px 20px' }}>
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
        </div>
        </div>
      </Modal>
    )
  }

