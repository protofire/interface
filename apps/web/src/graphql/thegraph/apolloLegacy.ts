import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, concat } from '@apollo/client'
import { AllV3TicksQuery } from 'graphql/thegraph/queriesLegacy'
import store from 'state/index'
import { UniverseChainId } from 'uniswap/src/types/chains'

export type Ticks = AllV3TicksQuery['ticks']
export type TickData = Ticks[number]

const GRAPH_NODE_URL = process.env.REACT_APP_GRAPH_NODE_URL ?? `https://graph-node.reservoir.tools`

const CHAIN_SUBGRAPH_URL: Record<number, string> = {
  [UniverseChainId.AbstractTestnet]: `${GRAPH_NODE_URL}/subgraphs/name/absctract-testnet/v3-subgraph`,
  [UniverseChainId.Zero]: `${GRAPH_NODE_URL}/subgraphs/name/zero/v3-subgraph`,
  [UniverseChainId.BOB]: `${GRAPH_NODE_URL}/subgraphs/name/bob/v3-subgraph`,
  [UniverseChainId.CYBER]: `${GRAPH_NODE_URL}/subgraphs/name/cyber/v3-subgraph`,
  [UniverseChainId.SHAPE]: `${GRAPH_NODE_URL}/subgraphs/name/shape/v3-subgraph`,
  [UniverseChainId.INK]: `${GRAPH_NODE_URL}/subgraphs/name/ink/v3-subgraph`,
  [UniverseChainId.REDSTONE]: `${GRAPH_NODE_URL}/subgraphs/name/redstone/v3-subgraph`,
  [UniverseChainId.REDSTONE_GARNET]: `${GRAPH_NODE_URL}/subgraphs/name/redstone-garnet/v3-subgraph`,
  [UniverseChainId.AbstractMainnet]: `${GRAPH_NODE_URL}/subgraphs/name/abstract/v3-subgraph`,
  [UniverseChainId.AnimeTestnet]: `${GRAPH_NODE_URL}/subgraphs/name/anime-testnet/v3-subgraph`,
  [UniverseChainId.Anime]: `${GRAPH_NODE_URL}/subgraphs/name/anime/v3-subgraph`,
  [UniverseChainId.Mode]: `${GRAPH_NODE_URL}/subgraphs/name/mode/v3-subgraph`,
}

const httpLink = new HttpLink({ uri: CHAIN_SUBGRAPH_URL[UniverseChainId.Zero] })

// This middleware will allow us to dynamically update the uri for the requests based off chainId
// For more information: https://www.apollographql.com/docs/react/networking/advanced-http-networking/
const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  const chainId = store.getState().application.chainId

  operation.setContext(() => ({
    uri: chainId && (CHAIN_SUBGRAPH_URL[chainId] ?? CHAIN_SUBGRAPH_URL[UniverseChainId.Zero]),
  }))

  return forward(operation)
})

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(authMiddleware, httpLink),
})

// export const chainToApolloClient: Record<number, ApolloClient<NormalizedCacheObject>> = {
//   [UniverseChainId.AbstractTestnet]: new ApolloClient({
//     cache: new InMemoryCache(),
//     uri: CHAIN_SUBGRAPH_URL[UniverseChainId.AbstractTestnet],
//   }),
// }
