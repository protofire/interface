import styled from 'lib/styled-components'
import { AggregatorType } from './aggregatorTypes'

const SelectorContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  margin-bottom: 12px;
`

const AggregatorButton = styled.button<{ $active: boolean; $available: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.accent1 : theme.surface3)};
  border-radius: 8px;
  background: ${({ theme, $active }) => ($active ? theme.accent2 : theme.surface1)};
  color: ${({ theme, $active }) => ($active ? theme.accent1 : theme.neutral2)};
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 535 : 485)};
  cursor: ${({ $available }) => ($available ? 'pointer' : 'not-allowed')};
  opacity: ${({ $available }) => ($available ? 1 : 0.5)};
  transition: all 0.2s;

  &:hover {
    ${({ $available, theme, $active }) =>
      $available &&
      `
      border-color: ${theme.accent1};
      background: ${$active ? theme.accent2 : theme.surface2};
    `}
  }
`

const Badge = styled.span`
  margin-left: 4px;
  padding: 2px 6px;
  background: ${({ theme }) => theme.accent1};
  color: ${({ theme }) => theme.white};
  border-radius: 4px;
  font-size: 10px;
  font-weight: 535;
`

interface AggregatorSelectorProps {
  selectedAggregator: AggregatorType | null
  availableAggregators: AggregatorType[]
  bestAggregator: AggregatorType | null
  onSelect: (aggregator: AggregatorType) => void
}

export function AggregatorSelector({
  selectedAggregator,
  availableAggregators,
  bestAggregator,
  onSelect,
}: AggregatorSelectorProps) {
  return (
    <SelectorContainer>
      {Object.values(AggregatorType).map((aggregator) => {
        const isAvailable = availableAggregators.includes(aggregator)
        const isSelected = selectedAggregator === aggregator
        const isBest = bestAggregator === aggregator

        return (
          <AggregatorButton
            key={aggregator}
            $active={isSelected}
            $available={isAvailable}
            onClick={() => isAvailable && onSelect(aggregator)}
            disabled={!isAvailable}
          >
            {aggregator}
            {isBest && <Badge>Best</Badge>}
          </AggregatorButton>
        )
      })}
    </SelectorContainer>
  )
}

