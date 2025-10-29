import { Currency } from '@uniswap/sdk-core'
import { useState, forwardRef, useEffect } from 'react'
import { MockTokenSelectModal } from './MockTokenSelectModal'
import styled from 'lib/styled-components'
import { ChevronDown } from 'react-feather'
import { useEisenTokens } from './useEisenTokens'
import { FLOW_CHAIN_ID } from './mockTokenData'
import { useSwapAndLimitContext } from 'state/swap/useSwapContext'
import useCurrencyBalance from 'lib/hooks/useCurrencyBalance'
import { useAccount } from 'hooks/useAccount'

const InputPanelWrapper = styled.div`
  background: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.surface3};
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`

const Label = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.neutral2};
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const MaxButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.accent1};
  cursor: pointer;
  font-size: 12px;
  font-weight: 535;
  padding: 0;
  &:hover {
    opacity: 0.8;
  }
`

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 36px;
  font-weight: 485;
  background: transparent;
  color: ${({ theme }) => theme.neutral1};
  
  &::placeholder {
    color: ${({ theme }) => theme.neutral3};
  }
  
  &:disabled {
    opacity: 0.5;
  }
`

const CurrencyButton = styled.button<{ $disabled?: boolean }>`
  border: none;
  outline: none;
  background: ${({ theme, $disabled }) => $disabled ? theme.surface2 : '#E6F7E6'};
  border: 1px solid ${({ theme, $disabled }) => $disabled ? theme.surface3 : '#E6F7E6'};
  border-radius: 16px;
  padding: 8px 12px;
  height: 48px;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 535;
  color: ${({ theme, $disabled }) => $disabled ? theme.neutral3 : '#4CAF50'};
  transition: all 0.2s;
  
  &:hover {
    ${({ $disabled, theme }) => !$disabled && `
      background: #C8E6C9;
    `}
  }
`

const TokenIcon = styled.div<{ $logoUrl?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $logoUrl }) => $logoUrl ? 'transparent' : '#66CC66'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  overflow: hidden;
  ${({ $logoUrl }) => $logoUrl && `
    background-image: url(${$logoUrl});
    background-size: cover;
    background-position: center;
  `}
`

const TokenSymbol = styled.span`
  font-weight: 535;
  color: ${({ theme }) => theme.neutral1};
`

const DropdownIcon = styled(ChevronDown)<{ $selected: boolean }>`
  color: ${({ theme }) => theme.neutral2};
  transition: transform 0.2s;
`

const BottomRow = styled.div`
  margin-top: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.neutral2};
  display: flex;
  align-items: center;
  gap: 8px;
`

const BalanceLabel = styled.span`
  color: ${({ theme }) => theme.neutral2};
`

const FiatValue = styled.span`
  color: ${({ theme }) => theme.neutral3};
  font-size: 12px;
`

interface AggregatorCurrencyInputPanelProps {
  label: string
  value: string
  onUserInput: (value: string) => void
  onCurrencySelect: (currency: Currency) => void
  currency: Currency | null
  otherCurrency?: Currency | null
  disabled?: boolean
  showMaxButton?: boolean
  onMax?: () => void
  fiatValue?: any
}

// Helper to get logoURI from currency address using Eisen tokens
function useTokenLogoUri(currency: Currency | null): string | undefined {
  const context = useSwapAndLimitContext() as any
  const chainId = context?.chainId || FLOW_CHAIN_ID
  const { tokens } = useEisenTokens(chainId)
  const [logoUri, setLogoUri] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!currency) {
      setLogoUri(undefined)
      return
    }

    // Check if currency is a Token (has address)
    const isNative = currency.isNative
    const address = 'address' in currency ? currency.address : null

    // For native currency
    if (isNative) {
      setLogoUri('https://raw.githubusercontent.com/EisenFinance/assets/main/assets/icons/chains/flow/flow.png')
      return
    }
    
    // Find the token in the Eisen API tokens list
    if (address) {
      const token = tokens.find(t => t.address.toLowerCase() === address.toLowerCase())
      if (token && token.icon) {
        setLogoUri(token.icon)
      } else {
        setLogoUri(undefined)
      }
    } else {
      setLogoUri(undefined)
    }
  }, [currency, tokens])

  return logoUri
}

export const AggregatorCurrencyInputPanel = forwardRef<HTMLInputElement, AggregatorCurrencyInputPanelProps>(
  (
    {
      label,
      value,
      onUserInput,
      onCurrencySelect,
      currency,
      otherCurrency,
      disabled = false,
      showMaxButton = false,
      onMax,
      fiatValue,
    },
    ref,
  ) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const logoUri = useTokenLogoUri(currency)
    const account = useAccount()
    
    // Fetch real balance for the currency
    const balance = useCurrencyBalance(account.address, currency ?? undefined)

    const handleModalDismiss = () => {
      setIsModalOpen(false)
    }

    const handleCurrencySelect = (selectedCurrency: Currency) => {
      onCurrencySelect(selectedCurrency)
    }

    const tokenIconContent = currency && currency.symbol 
      ? (logoUri ? null : currency.symbol.charAt(0).toUpperCase())
      : null

    return (
      <InputPanelWrapper>
        <Label>
          <span>{label}</span>
          {showMaxButton && <MaxButton onClick={onMax}>MAX</MaxButton>}
        </Label>

        <InputRow>
          <Input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onUserInput(e.target.value)}
            placeholder="0"
            disabled={disabled}
          />

          <CurrencyButton onClick={() => setIsModalOpen(true)} disabled={disabled} $disabled={disabled}>
            {currency && currency.symbol ? (
              <>
                <TokenIcon $logoUrl={logoUri}>{tokenIconContent}</TokenIcon>
                <TokenSymbol>{currency.symbol}</TokenSymbol>
                <DropdownIcon size={16} $selected={true} />
              </>
            ) : (
              <>
                <span style={{ color: '#66CC66', fontWeight: 535 }}>Select token</span>
                <DropdownIcon size={16} $selected={false} color="#66CC66" />
              </>
            )}
          </CurrencyButton>
        </InputRow>

        <BottomRow style={{ justifyContent: 'flex-end', marginTop: '4px' }}>
          {currency && (
            <BalanceLabel>
              Balance: {balance ? balance.toSignificant(6) : '0'} {currency.symbol}
            </BalanceLabel>
          )}
          {fiatValue && <FiatValue>{fiatValue}</FiatValue>}
        </BottomRow>

        <MockTokenSelectModal
          isOpen={isModalOpen}
          onDismiss={handleModalDismiss}
          onCurrencySelect={handleCurrencySelect}
          selectedCurrency={currency}
          otherCurrency={otherCurrency}
        />
      </InputPanelWrapper>
    )
  },
)

