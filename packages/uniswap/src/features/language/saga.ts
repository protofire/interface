// eslint-disable-next-line no-restricted-imports
import { I18nManager } from 'react-native'
// eslint-disable-next-line no-restricted-imports
import RNRestart from 'react-native-restart'
import { call, put, select, takeLatest } from 'typed-redux-saga'
import { Language, Locale } from 'uniswap/src/features/language/constants'
import { getLocale } from 'uniswap/src/features/language/hooks'
import { selectCurrentLanguage } from 'uniswap/src/features/settings/selectors'
import { setCurrentLanguage, updateLanguage } from 'uniswap/src/features/settings/slice'
import i18n from 'uniswap/src/i18n/i18n'
import { logger } from 'utilities/src/logger/logger'
import { isMobileApp } from 'utilities/src/platform'

export function* appLanguageWatcherSaga() {
  yield* takeLatest(updateLanguage.type, appLanguageSaga)
}

function* appLanguageSaga(action: ReturnType<typeof updateLanguage>) {
  const { payload: preferredLanguage } = action
  const currentAppLanguage = yield* select(selectCurrentLanguage)

  const languageToSet = !preferredLanguage ? Language.English : preferredLanguage
  const localeToSet = getLocale(languageToSet)

  // Syncs language with Firestore every app start to make sure language is up to date
  yield* put(setCurrentLanguage(languageToSet))

  if (currentAppLanguage === languageToSet && localeToSet === i18n.language) {
    return
  }

  try {
    yield* call([i18n, i18n.changeLanguage], localeToSet)
  } catch (error) {
    logger.warn('language/saga', 'appLanguageSaga', 'Sync of language setting state and i18n instance failed')
  }

  if (isMobileApp) {
    yield* call(restartAppIfRTL, localeToSet)
  }
}

function restartAppIfRTL(currentLocale: Locale) {
  const isRtl = i18n.dir(currentLocale) === 'rtl'
  if (isRtl !== I18nManager.isRTL) {
    logger.debug('saga.ts', 'restartAppIfRTL', `Changing RTL to ${isRtl} for locale ${currentLocale}`)
    I18nManager.forceRTL(isRtl)

    // Need to restart to apply RTL changes
    // RNRestart requires timeout to work properly with reanimated
    setTimeout(() => {
      RNRestart.restart()
    }, 1000)
  }
}
