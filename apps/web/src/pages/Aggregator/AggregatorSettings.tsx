import { Scrim } from 'components/AccountDrawer'
import Column, { AutoColumn } from 'components/Column'
import Row, { RowBetween } from 'components/Row'
import MenuButton from 'components/Settings/MenuButton'
import { useIsMobile } from 'hooks/screenSize'
import useDisableScrolling from 'hooks/useDisableScrolling'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import styled from 'lib/styled-components'
import { Portal } from 'nft/components/common/Portal'
import { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import { X } from 'react-feather'
import { useCloseModal, useModalIsOpen, useToggleSettingsMenu } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { Divider, ThemedText } from 'theme/components'
import { Z_INDEX } from 'theme/zIndex'
import { Trans } from 'uniswap/src/i18n'
import QuestionHelper from 'components/QuestionHelper'
import { AggregatorSlippageSettings } from './AggregatorSlippageSettings'
import { useEisenDexs } from './useEisenDexs'
import Expand from 'components/Expand'
import { ReactComponent as EisenLogo } from 'assets/svg/eisen.svg'
import { Flex, Text } from 'ui/src'

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.neutral1};
  cursor: pointer;
  height: 24px;
  padding: 0;
  width: 24px;
`

const Menu = styled.div`
  position: relative;
`

const MenuFlyout = styled(AutoColumn)`
  min-width: 20.125rem;
  background-color: ${({ theme }) => theme.surface1};
  border: 1px solid ${({ theme }) => theme.surface3};
  box-shadow:
    0px 0px 1px rgba(0, 0, 0, 0.01),
    0px 4px 8px rgba(0, 0, 0, 0.04),
    0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  position: absolute;
  top: 100%;
  margin-top: 10px;
  right: 0;
  z-index: 100;
  color: ${({ theme }) => theme.neutral1};
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
    min-width: 18.125rem;
  `};
  user-select: none;
  padding: 16px;
`

const MobileMenuContainer = styled(Row)`
  overflow: visible;
  position: fixed;
  height: 100%;
  top: 100vh;
  left: 0;
  right: 0;
  width: 100%;
  z-index: ${Z_INDEX.fixed};
`

const MobileMenuWrapper = styled(Column)<{ $open: boolean }>`
  height: min-content;
  width: 100%;
  padding: 8px 16px 24px;
  background-color: ${({ theme }) => theme.surface1};
  overflow: hidden;
  position: absolute;
  bottom: ${({ $open }) => ($open ? `100vh` : 0)};
  transition: bottom ${({ theme }) => theme.transition.duration.medium};
  border: ${({ theme }) => `1px solid ${theme.surface3}`};
  border-radius: 12px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
  font-size: 16px;
  box-shadow: unset;
  z-index: ${Z_INDEX.modal};
`

const MobileMenuHeader = styled(Row)`
  margin-bottom: 16px;
`

const Option = styled(Row)<{ isActive: boolean }>`
  width: auto;
  cursor: pointer;
  padding: 6px 12px;
  text-align: center;
  gap: 4px;
  border-radius: 12px;
  background: ${({ isActive, theme }) => (isActive ? theme.surface3 : 'transparent')};
  pointer-events: ${({ isActive }) => isActive && 'none'};
`

const Switch = styled(Row)`
  width: auto;
  padding: 4px;
  border: 1px solid ${({ theme }) => theme.surface3};
  border-radius: 16px;
`

const DexCheckbox = styled.div<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
`

const CheckboxInput = styled.input`
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: ${({ theme }) => theme.accent1};
  
  &:checked {
    accent-color: ${({ theme }) => theme.accent1};
  }
`

const DexList = styled(AutoColumn)`
  max-height: 200px;
  overflow-y: auto;
  padding: 8px 0;
  
  /* Remove scrollbar background */
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => theme.surface3} transparent;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.surface3};
    border-radius: 4px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background-color: ${({ theme }) => theme.surface4};
    background-clip: content-box;
  }
`

export type OrderType = 'CHEAPEST' | 'FASTEST'

interface AggregatorSettingsProps {
  order: OrderType
  slippage: number
  selectedDexs: string[]
  chainId: number
  onOrderChange: (order: OrderType) => void
  onSlippageChange: (slippage: number) => void
  onDexsChange: (dexs: string[]) => void
  compact?: boolean
}

export function AggregatorSettings({
  order,
  slippage,
  selectedDexs,
  chainId,
  onOrderChange,
  onSlippageChange,
  onDexsChange,
  compact = false,
}: AggregatorSettingsProps) {
  const toggleButtonNode = useRef<HTMLDivElement | null>(null)
  const menuNode = useRef<HTMLDivElement | null>(null)
  const isOpen = useModalIsOpen(ApplicationModal.SETTINGS)

  const closeModal = useCloseModal()
  const closeMenu = useCallback(() => closeModal(ApplicationModal.SETTINGS), [closeModal])
  const toggleMenu = useToggleSettingsMenu()

  const isMobile = useIsMobile()
  const isOpenMobile = isOpen && isMobile
  const isOpenDesktop = isOpen && !isMobile

  useOnClickOutside(menuNode, isOpenDesktop ? closeMenu : undefined, [toggleButtonNode])
  useDisableScrolling(isOpen)

  // Fetch available DEXs
  const { dexs, loading: dexsLoading } = useEisenDexs(chainId)
  
  // Track if we've initialized the DEX selection (to prevent re-initializing after user deselects)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Initialize selected DEXs when available DEXs are first loaded (preselect all)
  useEffect(() => {
    if (dexs.length > 0 && !hasInitialized) {
      onDexsChange([...dexs])
      setHasInitialized(true)
    }
  }, [dexs, hasInitialized, onDexsChange])

  const handleDexToggle = useCallback(
    (dex: string) => {
      const isSelected = selectedDexs.includes(dex)
      if (isSelected) {
        // Remove DEX from selection
        onDexsChange(selectedDexs.filter((d) => d !== dex))
      } else {
        // Add DEX to selection
        onDexsChange([...selectedDexs, dex])
      }
    },
    [selectedDexs, onDexsChange]
  )

  const handleSelectAll = useCallback(() => {
    if (dexs.length > 0) {
      onDexsChange([...dexs])
    }
  }, [dexs, onDexsChange])

  const handleDeselectAll = useCallback(() => {
    onDexsChange([])
  }, [onDexsChange])

  const allSelected = dexs.length > 0 && selectedDexs.length === dexs.length
  const hasDexs = dexs.length > 0

  const Settings = useMemo(
    () => (
      <>
        <AutoColumn gap="16px">
          <AggregatorSlippageSettings
            slippage={slippage}
            onSlippageChange={onSlippageChange}
            autoSlippage={0.005}
          />
          <Divider />
          <RowBetween>
            <Row width="auto">
              <ThemedText.BodyPrimary>
                Order Type
              </ThemedText.BodyPrimary>
              <QuestionHelper text="How to prioritize the results - Cheapest for best price, Fastest for quickest execution." />
            </Row>
            <Switch>
              <Option onClick={() => onOrderChange('CHEAPEST')} isActive={order === 'CHEAPEST'}>
                <ThemedText.BodyPrimary>Cheapest</ThemedText.BodyPrimary>
              </Option>
              <Option onClick={() => onOrderChange('FASTEST')} isActive={order === 'FASTEST'}>
                <ThemedText.BodyPrimary>Fastest</ThemedText.BodyPrimary>
              </Option>
            </Switch>
          </RowBetween>
          <Divider />
          <Expand
            testId="aggregator-dex-settings"
            padding="6px 0px"
            isOpen={true}
            onToggle={() => {}}
            header={
              <Row width="auto">
                <ThemedText.BodyPrimary>
                  DEX Selection
                </ThemedText.BodyPrimary>
                <QuestionHelper text="Select which DEXs to include in the swap search. WRAPPED_NATIVE will always be included for native token swaps." />
              </Row>
            }
            button={
              <ThemedText.BodyPrimary>
                {dexsLoading
                  ? 'Loading...'
                  : hasDexs
                  ? `${selectedDexs.length} of ${dexs.length} selected`
                  : 'No DEXs available'}
              </ThemedText.BodyPrimary>
            }
          >
            {hasDexs && (
              <>
                <RowBetween gap="md" style={{ marginBottom: '8px' }}>
                  <ThemedText.BodySmall
                    style={{ cursor: 'pointer', color: 'var(--accent1)' }}
                    onClick={allSelected ? handleDeselectAll : handleSelectAll}
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </ThemedText.BodySmall>
                </RowBetween>
                <DexList gap="4px">
                  {dexs.map((dex) => {
                    const isSelected = selectedDexs.includes(dex)
                    return (
                      <DexCheckbox
                        key={dex}
                        onClick={() => handleDexToggle(dex)}
                        disabled={false}
                      >
                        <CheckboxInput
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleDexToggle(dex)}
                          disabled={false}
                        />
                        <ThemedText.BodySmall>{dex}</ThemedText.BodySmall>
                      </DexCheckbox>
                    )
                  })}
                </DexList>
              </>
            )}
            {!hasDexs && !dexsLoading && (
              <ThemedText.BodySmall color="neutral2">
                No DEXs available for this chain
              </ThemedText.BodySmall>
            )}
          </Expand>
          <Divider />
          {/* Powered by Eisen */}
          <a
            href="https://eisenfinance.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', paddingTop: '8px' }}
          >
            <Flex
              alignItems="center"
              justifyContent="center"
              gap="$gap4"
              row
            >
              <Text variant="body3" color="$neutral2">
                Powered by
              </Text>
              <EisenLogo style={{ height: '16px', width: 'auto' }} />
            </Flex>
          </a>
        </AutoColumn>
      </>
    ),
    [
      order,
      slippage,
      selectedDexs,
      dexs,
      dexsLoading,
      hasDexs,
      allSelected,
      onOrderChange,
      onSlippageChange,
      handleDexToggle,
      handleSelectAll,
      handleDeselectAll,
    ],
  )

  return (
    <Menu ref={toggleButtonNode}>
      <MenuButton disabled={false} isActive={isOpen} compact={compact} onClick={toggleMenu} trade={undefined} />
      {isOpenDesktop && <MenuFlyout ref={menuNode}>{Settings}</MenuFlyout>}
      {isOpenMobile && (
        <Portal>
          <MobileMenuContainer data-testid="mobile-settings-menu" ref={menuNode}>
            <Scrim onClick={closeMenu} $open />
            <MobileMenuWrapper $open>
              <MobileMenuHeader padding="8px 0px 4px">
                <CloseButton data-testid="mobile-settings-close" onClick={closeMenu}>
                  <X size={24} />
                </CloseButton>
                <Row padding="0px 24px 0px 0px" justify="center">
                  <ThemedText.SubHeader>
                    <Trans i18nKey="common.settings" />
                  </ThemedText.SubHeader>
                </Row>
              </MobileMenuHeader>
              {Settings}
            </MobileMenuWrapper>
          </MobileMenuContainer>
        </Portal>
      )}
    </Menu>
  )
}

