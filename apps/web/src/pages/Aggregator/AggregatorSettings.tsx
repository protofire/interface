import { Scrim } from 'components/AccountDrawer'
import Column, { AutoColumn } from 'components/Column'
import Row, { RowBetween } from 'components/Row'
import MenuButton from 'components/Settings/MenuButton'
import { useIsMobile } from 'hooks/screenSize'
import useDisableScrolling from 'hooks/useDisableScrolling'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import styled from 'lib/styled-components'
import { Portal } from 'nft/components/common/Portal'
import { useCallback, useMemo, useRef } from 'react'
import { X } from 'react-feather'
import { useCloseModal, useModalIsOpen, useToggleSettingsMenu } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { Divider, ThemedText } from 'theme/components'
import { Z_INDEX } from 'theme/zIndex'
import { Trans } from 'uniswap/src/i18n'
import QuestionHelper from 'components/QuestionHelper'
import { AggregatorSlippageSettings } from './AggregatorSlippageSettings'

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

export type OrderType = 'CHEAPEST' | 'FASTEST'

interface AggregatorSettingsProps {
  order: OrderType
  slippage: number
  onOrderChange: (order: OrderType) => void
  onSlippageChange: (slippage: number) => void
  compact?: boolean
}

export function AggregatorSettings({
  order,
  slippage,
  onOrderChange,
  onSlippageChange,
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
        </AutoColumn>
      </>
    ),
    [order, slippage, onOrderChange, onSlippageChange],
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

