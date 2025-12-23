import { ColumnCenter } from 'components/Column'
import forkConfig from 'forkConfig'
import { useCurrency } from 'hooks/Tokens'
import { TokenCloud } from 'pages/Landing/components/TokenCloud'
import { Hover, RiseIn } from 'pages/Landing/components/animations'
import { Swap } from 'pages/Swap'
import { ChevronDown } from 'react-feather'
import { NAV_HEIGHT } from 'theme'
import { Flex, Text } from 'ui/src'
import { FeatureFlags } from 'uniswap/src/features/gating/flags'
import { useFeatureFlag } from 'uniswap/src/features/gating/hooks'
import { Trans } from 'uniswap/src/i18n'
import { UniverseChainId } from 'uniswap/src/types/chains'

interface HeroProps {
  scrollToRef: () => void
  transition?: boolean
}

export function Hero({ scrollToRef, transition }: HeroProps) {
  const multichainUXEnabled = useFeatureFlag(FeatureFlags.MultichainUX)
  const initialInputCurrency = useCurrency('ETH')

  return (
    <Flex
      position="relative"
      justifyContent="center"
      minWidth="100%"
      height="min-content"
      minHeight="calc(100vh - 290px)"
      pt={NAV_HEIGHT + 10}
      pointerEvents="none"
    >
      {forkConfig.approvedTokens && <TokenCloud transition={transition} />}

      <Flex
        alignSelf="center"
        maxWidth="85vw"
        pointerEvents="none"
        pt={48}
        gap="$gap20"
        $lg={{ pt: 24 }}
        $sm={{ pt: 8 }}
        $platform-web={{
          transition: transition ? 'shrinkAndFade 1s ease-in-out forwards' : undefined,
        }}
      >
        <Flex maxWidth={920} alignItems="center" pointerEvents="none">
          <Text
            variant="heading1"
            fontSize={64}
            lineHeight={76}
            textAlign="center"
            fontWeight="$book"
            $md={{ fontSize: 52 }}
            $sm={{ variant: 'heading2', fontSize: 36 }}
            $short={{ variant: 'heading2', fontSize: 36 }}
          >
            <Trans i18nKey="hero.swap.title" />
          </Text>
        </Flex>

        <Flex
          pointerEvents="auto"
          width={480}
          p="$padding8"
          borderRadius="$rounded24"
          backgroundColor="$surface1"
          maxWidth="100%"
        >
          <Swap
            syncTabToUrl={false}
            hideHeader
            chainId={initialInputCurrency?.chainId ?? UniverseChainId.Mainnet}
            initialInputCurrency={initialInputCurrency}
            multichainUXEnabled={multichainUXEnabled}
          />
        </Flex>

        <Text variant="body1" textAlign="center" maxWidth={430} color="$neutral2" mb={30}>
          <Trans i18nKey="hero.subtitle" />
        </Text>
      </Flex>

      <Flex flex={1} />

      {forkConfig.scrollToRefEnabled && (
        <Flex
          position="absolute"
          width="100%"
          centered
          pointerEvents="none"
          bottom={48}
          // style={{ transform: `translate(0px, ${translateY}px)`, opacity: opacityY }}
          $midHeight={{ display: 'none' }}
        >
          <RiseIn delay={0.3}>
            <Flex
              alignItems="center"
              justifyContent="flex-start"
              onPress={() => scrollToRef()}
              cursor="pointer"
              width={500}
            >
              <Hover>
                <ColumnCenter>
                  <Text variant="body2">
                    <Trans i18nKey="hero.scroll" />
                  </Text>
                  <ChevronDown />
                </ColumnCenter>
              </Hover>
            </Flex>
          </RiseIn>
        </Flex>
      )}
    </Flex>
  )
}
