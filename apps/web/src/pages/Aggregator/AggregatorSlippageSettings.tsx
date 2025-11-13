import { Percent } from '@uniswap/sdk-core'
import Expand from 'components/Expand'
import QuestionHelper from 'components/QuestionHelper'
import Row, { RowBetween } from 'components/Row'
import { Input, InputContainer } from 'components/Settings/Input'
import styled from 'lib/styled-components'
import { useState, useEffect } from 'react'
import { CautionTriangle, ThemedText } from 'theme/components'
import { Text } from 'ui/src'
import { Trans } from 'uniswap/src/i18n'
import { useFormatter } from 'utils/formatNumbers'

enum SlippageError {
  InvalidInput = 'InvalidInput',
}

const Option = styled(Row)<{ isActive: boolean }>`
  width: auto;
  cursor: pointer;
  padding: 6px 12px;
  text-align: center;
  gap: 4px;
  border-radius: 12px;
  background: ${({ isActive, theme }) => (isActive ? (theme.darkMode ? theme.accent2 : theme.surface3) : 'transparent')};
  pointer-events: ${({ isActive }) => isActive && 'none'};
`

const Switch = styled(Row)`
  width: auto;
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.surface3};
  border-radius: 16px;
`

const NUMBER_WITH_MAX_FOUR_DECIMAL_PLACES = /^(?:\d*\.\d{0,4}|\d+)$/
const MIN_SLIPPAGE = 0.0001
const MAX_SLIPPAGE = 1
const MINIMUM_RECOMMENDED_SLIPPAGE = 0.0005 // 0.05%
const MAXIMUM_RECOMMENDED_SLIPPAGE = 0.1 // 10%

function useFormatPercentInput() {
  const { formatPercent } = useFormatter()

  return (slippage: Percent) => formatPercent(slippage).slice(0, -1) // remove % sign
}

// Convert decimal slippage (0.005 = 0.5%) to Percent for display
// The Percent object stores as fraction: 0.5% = Percent(5, 10000) = 0.0005
// But we store as decimal: 0.5% = 0.005
// So we need: decimal 0.005 -> Percent(5, 10000) for display
function decimalToPercent(decimal: number): Percent {
  // Convert decimal (0.005) to percentage (0.5), then to Percent fraction (5/10000)
  const percentage = decimal * 100 // 0.005 -> 0.5
  return new Percent(Math.floor(percentage * 100), 10000) // 0.5 -> 50/10000 = 5/10000
}

interface AggregatorSlippageSettingsProps {
  slippage: number // Decimal value (0.005 = 0.5%)
  onSlippageChange: (slippage: number) => void
  autoSlippage?: number // Default auto slippage value (0.005)
}

export function AggregatorSlippageSettings({
  slippage,
  onSlippageChange,
  autoSlippage = 0.005,
}: AggregatorSlippageSettingsProps) {
  const { formatPercent } = useFormatter()
  const formatPercentInput = useFormatPercentInput()

  // Convert decimal to Percent for display
  const slippagePercent = decimalToPercent(slippage)
  const autoSlippagePercent = decimalToPercent(autoSlippage)

  // Track if we're in auto mode (using default value)
  // Also track if user has explicitly switched to custom mode
  const [isCustomMode, setIsCustomMode] = useState(false)
  const isAuto = !isCustomMode && Math.abs(slippage - autoSlippage) < 0.0001

  // Format input value - show percentage without % sign
  const formatSlippageInput = (value: number): string => {
    const percent = decimalToPercent(value)
    return formatPercentInput(percent)
  }

  const defaultSlippageInputValue = isAuto ? '' : formatSlippageInput(slippage)

  const [slippageInput, setSlippageInput] = useState(defaultSlippageInputValue)
  const [slippageError, setSlippageError] = useState<SlippageError | false>(false)

  // If user has previously entered a custom slippage, we want to show the settings expanded by default.
  const [isOpen, setIsOpen] = useState(!isAuto)

  // Update input when slippage changes externally
  useEffect(() => {
    if (isAuto) {
      setSlippageInput('')
    } else {
      setSlippageInput(formatSlippageInput(slippage))
    }
  }, [slippage, isAuto])

  const parseSlippageInput = (value: string) => {
    // Do not allow non-numerical characters in the input field or more than four decimals
    if (value.length > 0 && !NUMBER_WITH_MAX_FOUR_DECIMAL_PLACES.test(value)) {
      return
    }

    setSlippageInput(value)
    setSlippageError(false)

    // If the input is empty, set the slippage to auto (default)
    if (value.length === 0) {
      onSlippageChange(autoSlippage)
      return
    }

    if (value === '.') {
      return
    }

    // Parse user input and set the slippage if valid, error otherwise
    try {
      const parsed = parseFloat(value)
      if (isNaN(parsed)) {
        setSlippageError(SlippageError.InvalidInput)
        return
      }

      // Convert percentage input to decimal (e.g., 0.5% -> 0.005)
      const decimalValue = parsed / 100

      if (decimalValue < MIN_SLIPPAGE) {
        onSlippageChange(MIN_SLIPPAGE)
        setSlippageError(SlippageError.InvalidInput)
      } else if (decimalValue > MAX_SLIPPAGE) {
        onSlippageChange(MAX_SLIPPAGE)
        setSlippageError(SlippageError.InvalidInput)
      } else {
        onSlippageChange(decimalValue)
      }
    } catch (e) {
      setSlippageError(SlippageError.InvalidInput)
    }
  }

  const tooLow = slippage < MINIMUM_RECOMMENDED_SLIPPAGE && slippage >= MIN_SLIPPAGE
  const tooHigh = slippage > MAXIMUM_RECOMMENDED_SLIPPAGE && slippage <= MAX_SLIPPAGE

  return (
    <Expand
      testId="aggregator-max-slippage-settings"
      padding="6px 0px"
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      header={
        <Row width="auto">
          <ThemedText.BodyPrimary>
            <Trans i18nKey="settings.maxSlippage" />
          </ThemedText.BodyPrimary>
          <QuestionHelper text={<Trans i18nKey="swap.settings.transactionRevertPrice" />} />
        </Row>
      }
      button={
        <ThemedText.BodyPrimary>
          {isAuto ? (
            <Trans i18nKey="common.automatic" />
          ) : (
            formatPercent(slippagePercent)
          )}
        </ThemedText.BodyPrimary>
      }
    >
      <RowBetween gap="md">
        <Switch>
          <Option
            onClick={() => {
              // Reset the input field when switching to auto
              setIsCustomMode(false)
              setSlippageInput('')
              onSlippageChange(autoSlippage)
            }}
            isActive={isAuto}
          >
            <ThemedText.BodyPrimary>
              <Trans i18nKey="common.automatic" />
            </ThemedText.BodyPrimary>
          </Option>
          <Option
            onClick={() => {
              // When switching to custom slippage, switch to custom mode
              setIsCustomMode(true)
              // Use current slippage value or auto if in auto mode
              const valueToUse = isAuto ? autoSlippage : slippage
              onSlippageChange(valueToUse)
              // Ensure the input field is populated with the current value
              setSlippageInput(formatSlippageInput(valueToUse))
            }}
            isActive={!isAuto}
          >
            <ThemedText.BodyPrimary>
              <Trans i18nKey="common.custom" />
            </ThemedText.BodyPrimary>
          </Option>
        </Switch>
        <InputContainer gap="md" error={!!slippageError}>
          <Input
            data-testid="aggregator-slippage-input"
            placeholder={formatPercentInput(autoSlippagePercent)}
            value={slippageInput}
            onChange={(e) => parseSlippageInput(e.target.value)}
            onBlur={() => {
              // When the input field is blurred, reset the input field to the current value
              if (isAuto) {
                setSlippageInput('')
              } else {
                setSlippageInput(formatSlippageInput(slippage))
              }
              setSlippageError(false)
            }}
          />
          <Text variant="body1" color={slippageError ? '$statusCritical' : '$neutral1'}>
            %
          </Text>
        </InputContainer>
      </RowBetween>
      {tooLow || tooHigh ? (
        <RowBetween gap="md">
          <CautionTriangle />
          <ThemedText.BodySmall color="deprecated_accentWarning">
            {tooLow ? (
              <Trans
                i18nKey="swap.slippageBelow.warning"
                values={{ amt: formatPercent(decimalToPercent(MINIMUM_RECOMMENDED_SLIPPAGE)) }}
              />
            ) : (
              <Trans i18nKey="swap.frontrun.warning" />
            )}
          </ThemedText.BodySmall>
        </RowBetween>
      ) : null}
    </Expand>
  )
}

