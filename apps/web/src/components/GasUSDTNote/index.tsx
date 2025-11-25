import { AutoColumn } from 'components/Column'
import { useAccount } from 'hooks/useAccount'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'
import { useCurrencyBalance } from 'state/connection/hooks'
import { useSwapAndLimitContext } from 'state/swap/useSwapContext'
import { ThemedText } from 'theme/components'
import { Trans } from 'uniswap/src/i18n'
import { NumberType, useFormatter } from 'utils/formatNumbers'
import { useNavigate } from 'react-router-dom'
import styled from 'lib/styled-components'

const NoteWrapper = styled(AutoColumn)`
  margin-top: 12px;
  padding: 12px;
  background-color: ${({ theme }) => theme.surface2};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surface3};
`

const WrapLink = styled.span`
  color: ${({ theme }) => theme.accent1};
  cursor: pointer;
  text-decoration: underline;
  font-weight: 535;

  &:hover {
    opacity: 0.8;
  }
`

export function GasUSDTNote() {
  const account = useAccount()
  const { chainId } = useSwapAndLimitContext()
  const nativeCurrency = useNativeCurrency(chainId)
  const nativeBalance = useCurrencyBalance(account.address, nativeCurrency)
  const { formatCurrencyAmount } = useFormatter()
  const navigate = useNavigate()

  // Only show if user is connected and has native currency balance
  if (!account.isConnected || !nativeBalance || nativeBalance.equalTo(0)) {
    return null
  }

  const handleWrapClick = () => {
    navigate('/wrap')
  }

  const formattedBalance = formatCurrencyAmount({
    amount: nativeBalance,
    type: NumberType.TokenNonTx,
  })

  return (
    <NoteWrapper gap="xs">
      <ThemedText.BodySmall color="neutral2" lineHeight="20px">
        <Trans
          i18nKey="swap.gasUSDT.detected"
          values={{
            balance: formattedBalance,
            symbol: nativeCurrency.symbol,
          }}
          components={{
            wrapLink: <WrapLink onClick={handleWrapClick}>Wrap</WrapLink>,
          }}
        />
      </ThemedText.BodySmall>
    </NoteWrapper>
  )
}

