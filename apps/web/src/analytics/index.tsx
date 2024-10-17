import {
  TraceEvent as AnalyticsEvent,
  Trace as AnalyticsTrace,
  sendAnalyticsEvent as sendAnalyticsTraceEvent,
} from '@uniswap/analytics'
import { atomWithStorage /*, useAtomValue */ } from 'jotai/utils'
import { memo } from 'react'

// TODO: manage unused declarations
// eslint-disable-next-line
export {
  OriginApplication,
  getDeviceId,
  initializeAnalytics,
  useTrace,
  user,
  type ITraceContext,
} from '@uniswap/analytics'

const allowAnalyticsAtomKey = 'allow_analytics'

//False positive error
//eslint-disable-next-line
export const allowAnalyticsAtom = atomWithStorage<boolean>(allowAnalyticsAtomKey, false)

export const Trace = memo((props: React.ComponentProps<typeof AnalyticsTrace>) => {
  // const allowAnalytics = useAtomValue(allowAnalyticsAtom)
  const allowAnalytics = false
  const shouldLogImpression = allowAnalytics ? props.shouldLogImpression : false

  return <AnalyticsTrace {...props} shouldLogImpression={shouldLogImpression} />
})

Trace.displayName = 'Trace'

export const TraceEvent = memo((props: React.ComponentProps<typeof AnalyticsEvent>) => {
  // const allowAnalytics = useAtomValue(allowAnalyticsAtom)
  const allowAnalytics = false
  const shouldLogImpression = allowAnalytics ? props.shouldLogImpression : false

  return <AnalyticsEvent {...props} shouldLogImpression={shouldLogImpression} />
})

TraceEvent.displayName = 'TraceEvent'

export const sendAnalyticsEvent: typeof sendAnalyticsTraceEvent = (event, properties) => {
  const allowAnalytics = false

  // try {
  //   const value = localStorage.getItem(allowAnalyticsAtomKey)

  //   if (typeof value === 'string') {
  //     allowAnalytics = JSON.parse(value)
  //     allowAnalytics = false
  //   }
  //   // eslint-disable-next-line no-empty
  // } catch {}

  if (allowAnalytics) {
    sendAnalyticsTraceEvent(event, properties)
  }
}

// This is only used for initial page load so we can get the user's country
//eslint-disable-next-line
export const sendInitializationEvent: typeof sendAnalyticsTraceEvent = (event, properties) => {
  // TODO: disable all analytics
  // sendAnalyticsTraceEvent(event, properties)
}