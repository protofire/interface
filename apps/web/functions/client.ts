import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

// TODO: Remove Apollo implementation
// Disabled GraphQL client - no longer making calls to interface.gateway.uniswap.org
const noOpLink = new HttpLink({
  uri: '/graphql',
  fetch: () => {
    // No-op: prevent any GraphQL calls
    return Promise.reject(new Error('GraphQL client disabled'))
  },
})

export default new ApolloClient({
  connectToDevTools: false,
  link: noOpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first',
    },
  },
})
