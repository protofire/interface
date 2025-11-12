// TODO: Remove Statsig implementation
import { createContext } from 'react'
import type { ReactNode } from 'react'

const mockStatsig = {
  checkGate: () => false,
  checkGateWithExposureLoggingDisabled: () => false,
  getExperiment: (name: string) => ({
    get: <T>(key: string, defaultValue: T) => defaultValue,
    getGroupName: () => null,
  }),
  getExperimentWithExposureLoggingDisabled: (name: string) => ({
    get: <T>(key: string, defaultValue: T) => defaultValue,
    getGroupName: () => null,
  }),
  getConfig: (name: string) => ({
    get: <T>(key: string, defaultValue: T) => defaultValue,
  }),
  overrideGate: () => {},
  overrideConfig: () => {},
  removeGateOverride: () => {},
  removeConfigOverride: () => {},
  getAllOverrides: () => ({ gates: {}, configs: {} }),
  initializeCalled: () => false,
}

export type StatsigUser = { userID?: string; customIDs?: Record<string, string>; custom?: Record<string, any>; appVersion?: string }
export type StatsigOptions = any
export type StatsigOverrides = any
export type DynamicConfig = ReturnType<typeof mockStatsig.getConfig>

interface StatsigContextValue {
  initialized: boolean
  user: StatsigUser
}

const mockStatsigContext = createContext<StatsigContextValue>({
  initialized: true,
  user: {} as StatsigUser,
})

export const Statsig = mockStatsig as any
export const StatsigContext = mockStatsigContext

const useGate = (name: string) => ({ value: false, isLoading: false })
const useGateWithExposureLoggingDisabled = (name: string) => ({ value: false })
const useConfig = (name: string) => ({ config: mockStatsig.getConfig(name) })
const useExperiment = (name: string) => ({ config: mockStatsig.getExperiment(name), isLoading: false })
const useExperimentWithExposureLoggingDisabled = (name: string) => ({ config: mockStatsig.getExperiment(name) })

export function StatsigProvider({ children }: { children: ReactNode }): ReactNode {
  return children
}

export { useGate, useGateWithExposureLoggingDisabled, useConfig, useExperiment, useExperimentWithExposureLoggingDisabled }
