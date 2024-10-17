import { ApolloClient, InMemoryCache } from '@apollo/client'

// TODO: reenable GQL once supported
const GRAPHQL_URL = process.env.REACT_APP_AWS_API_ENDPOINT
if (!GRAPHQL_URL) {
  // throw new Error('AWS URL MISSING FROM ENVIRONMENT')
}

export const apolloClient = new ApolloClient({
  connectToDevTools: true,
  uri: '',
  headers: {
    'Content-Type': 'application/json',
    Origin: '',
  },
  cache: new InMemoryCache(),
  // cache: new InMemoryCache({
  //   typePolicies: {
  //     Query: {
  //       fields: {
  //         nftBalances: relayStylePagination(['ownerAddress', 'filter']),
  //         nftAssets: relayStylePagination(),
  //         nftActivity: relayStylePagination(),
  //         // tell apollo client how to reference Token items in the cache after being fetched by queries that return Token[]
  //         token: {
  //           read(_, { args, toReference }): Reference | undefined {
  //             return toReference({
  //               __typename: 'Token',
  //               chain: args?.chain,
  //               address: args?.address,
  //             })
  //           },
  //         },
  //       },
  //     },
  //     Token: {
  //       // key by chain, address combination so that Token(chain, address) endpoint can read from cache
  //       /**
  //        * NOTE: In any query for `token` or `tokens`, you must include the `chain` and `address` fields
  //        * in order for result to normalize properly in the cache.
  //        */
  //       keyFields: ['chain', 'address'],
  //       fields: {
  //         address: {
  //           read(address: string | null): string | null {
  //             // backend endpoint sometimes returns checksummed, sometimes lowercased addresses
  //             // always use lowercased addresses in our app for consistency
  //             return address?.toLowerCase() ?? null
  //           },
  //         },
  //       },
  //     },
  //     TokenProject: {
  //       fields: {
  //         tokens: {
  //           // cache data may be lost when replacing the tokens array
  //           merge(existing, incoming) {
  //             if (!existing) {
  //               return incoming
  //             } else if (Array.isArray(existing)) {
  //               return [...existing, ...incoming]
  //             } else {
  //               return [existing, ...incoming]
  //             }
  //           },
  //         },
  //       },
  //     },
  //   },
  // }),
  defaultOptions: {
    // watchQuery: {
    //   fetchPolicy: 'cache-and-network',
    // },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
    mutate: {
      errorPolicy: 'ignore',
    },
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
  },
})