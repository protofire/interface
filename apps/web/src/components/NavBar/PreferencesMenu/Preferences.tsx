import { PreferencesHeader } from 'components/NavBar/PreferencesMenu/Header'
import styled from 'lib/styled-components'
import { ThemeSelector } from 'theme/components/ThemeToggle'
import { Text } from 'ui/src'
import { Trans, t } from 'uniswap/src/i18n'

const Pref = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0px;
  gap: 12px;
`
type SettingItem = {
  label: string
  component: JSX.Element
}

export function PreferenceSettings({
  showHeader = true,
}: {
  showHeader?: boolean
}) {
  const items: SettingItem[] = [
    {
      label: t('themeToggle.theme'),
      component: <ThemeSelector compact />,
    }
  ]

  return (
    <>
      {showHeader && (
        <PreferencesHeader>
          <Trans i18nKey="globalPreferences.title" />
        </PreferencesHeader>
      )}

      {items.map(({ label, component }, index) => (
        <Pref key={`${label}_${index}`}>
          <Text variant="body2" color="$neutral2" textAlign="left">
            {label}
          </Text>
          {component}
        </Pref>
      ))}
    </>
  )
}
