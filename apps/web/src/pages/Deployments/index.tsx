import { permit2Address } from '@uniswap/permit2-sdk'
import {
  MIXED_ROUTE_QUOTER_V1_ADDRESSES,
  MULTICALL_ADDRESSES,
  NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
  QUOTER_ADDRESSES,
  SWAP_ROUTER_02_ADDRESSES,
  TICK_LENS_ADDRESSES,
  V3_CORE_FACTORY_ADDRESSES,
  V3_MIGRATOR_ADDRESSES,
} from '@uniswap/sdk-core'
import { UNIVERSAL_ROUTER_ADDRESS, UniversalRouterVersion } from '@uniswap/universal-router-sdk'
import daoDarkMode from 'assets/png/DAO-dark-mode.png'
import daoLightMode from 'assets/png/DAO-light-mode.png'
import { LightCard } from 'components/Card'
import Column from 'components/Column'
import Expand from 'components/Expand'
import { ChainLogo } from 'components/Logo/ChainLogo'
import Row from 'components/Row'
import { SearchInput as SearchInputStyled } from 'components/SearchModal/styled'
import { getChain } from 'constants/chains'
import styled from 'lib/styled-components'
import { DAO_LINKS } from 'pages/Deployments/constants'
import { useMemo, useState } from 'react'
import { CopyLinkIcon, ExternalLink, ThemedText } from 'theme/components'
import { useIsDarkMode } from 'theme/components/ThemeToggle'
import { InterfaceChainId, WEB_SUPPORTED_CHAIN_IDS } from 'uniswap/src/types/chains'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  max-width: 900px;
  margin: 0 auto;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;

  @media screen and (min-width: ${({ theme }) => theme.breakpoint.md}px) {
    padding: 24px;
    gap: 20px;
  }
`

const SearchContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
`

const SearchInput = styled(SearchInputStyled)`
  height: 48px;

  :focus {
    border: 1px solid ${({ theme }) => theme.accent1};
  }
`

const ChainList = styled(Column)`
  width: 100%;
  gap: 16px;
`

const ChainItem = styled(LightCard)`
  padding: 20px;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background-color: ${({ theme }) => theme.surface2};
  }

  @media screen and (max-width: ${({ theme }) => theme.breakpoint.sm}px) {
    padding: 16px;
  }
`

const ChainHeader = styled(Row)`
  align-items: center;
  gap: 12px;
  width: 100%;
`

const ChainName = styled(ThemedText.SubHeader)`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.neutral1};
`

const ChainId = styled(ThemedText.BodySmall)`
  color: ${({ theme }) => theme.neutral2};
  font-size: 14px;
`

const DaoIcon = styled.img`
  width: 160px;
  cursor: pointer;
  margin-right: 12px;
`

const ContractList = styled(Column)`
  gap: 12px;
  padding-top: 16px;
`

const ContractRow = styled(Row)`
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.surface3};
  gap: 16px;
  flex-wrap: wrap;

  &:last-child {
    border-bottom: none;
  }

  @media screen and (max-width: ${({ theme }) => theme.breakpoint.sm}px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`

const ContractLabel = styled(ThemedText.BodySmall)`
  color: ${({ theme }) => theme.neutral1};
  font-weight: 500;
  flex-shrink: 0;
  min-width: 200px;

  @media screen and (max-width: ${({ theme }) => theme.breakpoint.sm}px) {
    min-width: auto;
  }
`

const ContractAddressWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  justify-content: flex-end;

  @media screen and (max-width: ${({ theme }) => theme.breakpoint.sm}px) {
    width: 100%;
    justify-content: flex-start;
  }
`

const ContractAddress = styled(ThemedText.BodySmall)`
  color: ${({ theme }) => theme.accent1};
  font-family: 'Courier New', monospace;
  font-size: 13px;
  word-break: break-all;
  cursor: pointer;
  user-select: all;
  flex: 1;
  min-width: 0;

  &:hover {
    opacity: 0.8;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${({ theme }) => theme.neutral2};
`

interface ContractAddresses {
  v3CoreFactory?: string
  universalRouter?: string
  proxyAdmin?: string
  tickLens?: string
  nftDescriptorLibrary?: string
  nonfungibleTokenPositionDescriptor?: string
  descriptorProxy?: string
  nonfungibleTokenPositionManager?: string
  v3Migrator?: string
  v3Staker?: string
  quoter?: string
  quoterV2?: string
  swapRouter02?: string
  mixedRouteQuoterV1?: string
  permit2?: string
  multicall2?: string
}

const getContractAddresses = (chainId: InterfaceChainId): ContractAddresses => {
  const addresses: ContractAddresses = {}

  addresses.v3CoreFactory = V3_CORE_FACTORY_ADDRESSES[chainId]
  addresses.nonfungibleTokenPositionManager = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId]
  addresses.v3Migrator = V3_MIGRATOR_ADDRESSES[chainId]
  addresses.multicall2 = MULTICALL_ADDRESSES[chainId]
  addresses.tickLens = TICK_LENS_ADDRESSES[chainId]
  addresses.quoter = QUOTER_ADDRESSES[chainId]
  addresses.mixedRouteQuoterV1 = MIXED_ROUTE_QUOTER_V1_ADDRESSES[chainId]
  addresses.swapRouter02 = SWAP_ROUTER_02_ADDRESSES(chainId) || 'not-found'
  addresses.universalRouter = UNIVERSAL_ROUTER_ADDRESS(UniversalRouterVersion.V1_2, chainId) || 'not-found'
  addresses.permit2 = permit2Address(chainId) || 'not-found'

  return addresses
}

const contractLabels = {
  v3CoreFactory: 'V3 Core Factory',
  universalRouter: 'Universal Router',
  proxyAdmin: 'Proxy Admin',
  tickLens: 'Tick Lens',
  nftDescriptorLibrary: 'NFT Descriptor Library Address V1.3.0',
  nonfungibleTokenPositionDescriptor: 'Nonfungible Token Position Descriptor V1.3.0',
  descriptorProxy: 'Descriptor Proxy',
  nonfungibleTokenPositionManager: 'Nonfungible Token Position Manager',
  v3Migrator: 'V3 Migrator',
  v3Staker: 'V3 Staker',
  quoter: 'Quoter',
  quoterV2: 'Quoter V2',
  swapRouter02: 'Swap Router 02',
  mixedRouteQuoterV1: 'Mixed Route Quoter V1',
  permit2: 'Permit2',
  multicall2: 'Multicall2',
}

export default function DeploymentsPage() {
  const isDarkMode = useIsDarkMode()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedChains, setExpandedChains] = useState<Set<InterfaceChainId>>(new Set())

  const chains = useMemo(() => {
    return WEB_SUPPORTED_CHAIN_IDS.map((chainId) => {
      const chainInfo = getChain({ chainId })
      return {
        chainId,
        name: chainInfo?.label || 'Unknown',
        addresses: getContractAddresses(chainId),
      }
    })
  }, [])

  const filteredChains = useMemo(() => {
    if (!searchQuery.trim()) {
      return chains
    }

    const query = searchQuery.toLowerCase().trim()
    return chains.filter((chain) => {
      const chainIdStr = chain.chainId.toString()
      const chainName = chain.name.toLowerCase()
      return chainIdStr.includes(query) || chainName.includes(query)
    })
  }, [chains, searchQuery])

  const toggleChain = (chainId: InterfaceChainId) => {
    setExpandedChains((prev) => {
      const next = new Set(prev)
      if (next.has(chainId)) {
        next.delete(chainId)
      } else {
        next.add(chainId)
      }
      return next
    })
  }

  return (
    <>
      <PageWrapper>
        <ThemedText.HeadlineLarge style={{ alignSelf: 'flex-start', marginBottom: '4px' }}>
          Deployed Contracts
        </ThemedText.HeadlineLarge>
        <ThemedText.BodySecondary style={{ alignSelf: 'flex-start', marginBottom: '0' }}>
          View contract addresses for the supported networks
        </ThemedText.BodySecondary>

        <SearchContainer>
          <SearchInput
            type="search"
            placeholder="Search by chain ID or chain name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>

        <ChainList>
          {filteredChains.length === 0 ? (
            <EmptyState>
              <ThemedText.BodyPrimary>No chains found matching your search</ThemedText.BodyPrimary>
            </EmptyState>
          ) : (
            filteredChains.map((chain) => {
              const isExpanded = expandedChains.has(chain.chainId)
              const daoLink = DAO_LINKS[chain.chainId as keyof typeof DAO_LINKS]
              return (
                <ChainItem key={chain.chainId}>
                  <Expand
                    header={
                      <ChainHeader>
                        <ChainLogo chainId={chain.chainId} size={32} />
                        <Column gap="4px" style={{ flex: 1 }}>
                          <ChainName>{chain.name}</ChainName>
                          <ChainId>Chain ID: {chain.chainId}</ChainId>
                        </Column>
                        {daoLink && (
                          <ExternalLink
                            href={daoLink}
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <DaoIcon src={isDarkMode ? daoDarkMode : daoLightMode} alt="DAO" />
                          </ExternalLink>
                        )}
                      </ChainHeader>
                    }
                    button={<div />}
                    isOpen={isExpanded}
                    onToggle={() => toggleChain(chain.chainId)}
                    padding="0"
                  >
                    <ContractList>
                      {Object.entries(contractLabels)
                        .filter(([key]) => {
                          const address = chain.addresses[key as keyof ContractAddresses]
                          return (
                            address !== undefined &&
                            address !== '0x0000000000000000000000000000000000000000' &&
                            address !== 'not-found'
                          )
                        })
                        .map(([key, label]) => {
                          const address = chain.addresses[key as keyof ContractAddresses]

                          return (
                            <ContractRow key={key}>
                              <ContractLabel>{label}:</ContractLabel>
                              <ContractAddressWrapper
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                              >
                                <ExternalLink
                                  href={getExplorerLink(chain.chainId, address!, ExplorerDataType.ADDRESS)}
                                  style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ContractAddress>{address}</ContractAddress>
                                </ExternalLink>
                                <CopyLinkIcon toCopy={address!} />
                              </ContractAddressWrapper>
                            </ContractRow>
                          )
                        })}
                    </ContractList>
                  </Expand>
                </ChainItem>
              )
            })
          )}
        </ChainList>
      </PageWrapper>
    </>
  )
}
