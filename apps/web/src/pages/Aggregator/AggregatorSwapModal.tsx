import { Currency } from '@uniswap/sdk-core'
import { AutoColumn } from 'components/Column'
import { SwapModal } from 'components/ConfirmSwapModal/Modal'
import { SwapHead } from 'components/ConfirmSwapModal/Head'
import { ConfirmModalState } from 'components/ConfirmSwapModal'
import { SwapModalHeaderAmount } from 'components/swap/SwapModalHeaderAmount'
import { Field } from 'components/swap/constants'
import Column from 'components/Column'
import Row from 'components/Row'
import { LoadingIndicatorOverlay, AnimatedEntranceConfirmationIcon, AnimatedEntranceSubmittedIcon, LogoContainer } from 'components/AccountDrawer/MiniPortfolio/Activity/Logos'
import { ThemedText } from 'theme/components'
import { Trans, t } from 'uniswap/src/i18n'
import styled from 'lib/styled-components'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { useIsTransactionPending, useIsTransactionConfirmed } from 'state/transactions/hooks'
import { useFormatter } from 'utils/formatNumbers'
import { useAccount } from 'hooks/useAccount'
import { UniverseChainId } from 'uniswap/src/types/chains'
import SwapError, { PendingModalError } from 'components/ConfirmSwapModal/Error'
import { DialogButtonType, DialogContent } from 'components/Dialog/Dialog'
import AlertTriangleFilled from 'components/Icons/AlertTriangleFilled'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { PortfolioLogo } from 'components/AccountDrawer/MiniPortfolio/PortfolioLogo'

const Container = styled.div<{ $height?: string; $padding?: string }>`
  height: ${({ $height }) => $height ?? ''};
  padding: ${({ $padding }) => $padding ?? ''};
`

const HeaderContainer = styled(Column)<{ $disabled?: boolean }>`
  ${({ $disabled }) => $disabled && `opacity: 0.5;`}
  padding: 0 32px;
  overflow: visible;
  align-items: center;
  margin: 48px 0 8px;
`

const PreviewContainer = styled(AutoColumn)`
  margin-top: 0px;
  padding: 12px 12px 0px 12px;
`

interface AggregatorSwapModalProps {
  isOpen: boolean
  onDismiss: () => void
  inputCurrency: Currency | null
  outputCurrency: Currency | null
  inputAmount: string
  outputAmount: string
  inputLogoURI?: string
  outputLogoURI?: string
  txHash?: string
  error?: Error | null
  attemptingTxn: boolean
}

export function AggregatorSwapModal({
  isOpen,
  onDismiss,
  inputCurrency,
  outputCurrency,
  inputAmount,
  outputAmount,
  inputLogoURI,
  outputLogoURI,
  txHash,
  error,
  attemptingTxn,
}: AggregatorSwapModalProps) {
  const { chainId } = useAccount()
  const isTransactionPending = useIsTransactionPending(txHash)
  const isTransactionConfirmed = useIsTransactionConfirmed(txHash)

  // Create CurrencyAmount objects for display
  const inputAmountObj = inputCurrency && inputAmount
    ? CurrencyAmount.fromRawAmount(inputCurrency, inputAmount)
    : null
  const outputAmountObj = outputCurrency && outputAmount
    ? CurrencyAmount.fromRawAmount(outputCurrency, outputAmount)
    : null

  const { formatReviewSwapCurrencyAmount } = useFormatter()

  // Determine modal state
  const hasError = Boolean(error)
  const swapPending = isTransactionPending && !isTransactionConfirmed
  const swapConfirmed = isTransactionConfirmed
  const showSuccess = swapConfirmed || (chainId !== UniverseChainId.Mainnet && swapPending)
  const showSubmitted = swapPending && !swapConfirmed && chainId === UniverseChainId.Mainnet

  // Determine title
  const getTitle = () => {
    if (hasError) {
      return t('common.swap.failed')
    }
    if (swapPending) {
      return t('swap.submitted')
    }
    if (swapConfirmed) {
      return t('swap.success')
    }
    return t('swap.confirmSwap')
  }

  if (!isOpen || !inputCurrency || !outputCurrency || !inputAmountObj || !outputAmountObj) {
    return null
  }

  return (
    <SwapModal confirmModalState={ConfirmModalState.PENDING_CONFIRMATION} onDismiss={onDismiss}>
      {/* Head section */}
      <Container $height="24px" $padding="6px 12px 4px 12px">
        <SwapHead
          onDismiss={onDismiss}
          isLimitTrade={false}
          confirmModalState={ConfirmModalState.PENDING_CONFIRMATION}
        />
      </Container>

      {/* Preview section - show swap details */}
      <PreviewContainer>
        <Column gap="lg">
          <Row align="center" justify="space-between" gap="md">
            <Column gap="xs">
              <ThemedText.BodySecondary>
                <Trans i18nKey="common.sell.label" />
              </ThemedText.BodySecondary>
              <ThemedText.HeadlineLarge>
                {formatReviewSwapCurrencyAmount(inputAmountObj)} {inputCurrency?.symbol}
              </ThemedText.HeadlineLarge>
            </Column>
            {inputLogoURI ? (
              <PortfolioLogo
                currencies={inputCurrency ? [inputCurrency] : []}
                chainId={chainId || UniverseChainId.Mainnet}
                size={36}
                overwriteImages={inputLogoURI}
              />
            ) : (
              <CurrencyLogo currency={inputCurrency} size={36} />
            )}
          </Row>
          <Row align="center" justify="space-between" gap="md">
            <Column gap="xs">
              <ThemedText.BodySecondary>
                <Trans i18nKey="common.buy.label" />
              </ThemedText.BodySecondary>
              <ThemedText.HeadlineLarge>
                {formatReviewSwapCurrencyAmount(outputAmountObj)} {outputCurrency?.symbol}
              </ThemedText.HeadlineLarge>
            </Column>
            {outputLogoURI ? (
              <PortfolioLogo
                currencies={outputCurrency ? [outputCurrency] : []}
                chainId={chainId || UniverseChainId.Mainnet}
                size={36}
                overwriteImages={outputLogoURI}
              />
            ) : (
              <CurrencyLogo currency={outputCurrency} size={36} />
            )}
          </Row>
        </Column>
      </PreviewContainer>

      {/* Error state */}
      {hasError && (
        <Container $padding="16px">
          <DialogContent
            isVisible={true}
            icon={<AlertTriangleFilled data-testid="swap-modal-failure-icon" size="24px" />}
            title={<Trans i18nKey="common.swap.failed" />}
            description={<Trans i18nKey="swap.fail.message" />}
            buttonsConfig={{
              left: {
                type: DialogButtonType.Primary,
                title: <Trans i18nKey="common.close" />,
                onClick: onDismiss,
              },
            }}
            onCancel={onDismiss}
          />
        </Container>
      )}

      {/* Pending/Success state */}
      {!hasError && (
        <Container>
          <HeaderContainer gap="md" $disabled={swapPending && !swapConfirmed}>
            <LogoContainer>
              {showSuccess && <AnimatedEntranceConfirmationIcon />}
              {showSubmitted && <AnimatedEntranceSubmittedIcon />}
              {!showSuccess && !showSubmitted && <LoadingIndicatorOverlay />}
            </LogoContainer>
            <ThemedText.SubHeader width="100%" textAlign="center" data-testid="swap-modal-title">
              {getTitle()}
            </ThemedText.SubHeader>
            {/* Display while waiting for user to confirm in wallet */}
            {!swapPending && !swapConfirmed && attemptingTxn && (
              <Row justify="center" marginTop="32px" minHeight="24px">
                <ThemedText.BodySmall color="neutral2">
                  <Trans i18nKey="common.proceedInWallet" />
                </ThemedText.BodySmall>
              </Row>
            )}
          </HeaderContainer>
        </Container>
      )}
    </SwapModal>
  )
}

