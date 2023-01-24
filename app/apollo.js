import { ApolloServer } from '@apollo/server'
//const { RedisCache } = require('apollo-server-cache-redis')
import { makeExecutableSchema } from '@graphql-tools/schema'
import validationPlugin from '@digicatapult/apollo-type-validation-plugin'

const {
  plugin: typeValidationPlugin,
  directives: { arrayLengthDirective, boundedIntegerDirective },
} = validationPlugin

import typeDefs from './graphql/typeDefs.js'
import resolvers from './graphql/resolvers.js'
import env from './env.js'

function createApolloServer() {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
    inheritResolversFromInterfaces: true,
  })

  const server = new ApolloServer({
    schema,
    validationRules: [],
    playground: env.ENABLE_GRAPHQL_PLAYGROUND,
    tracing: env.ENABLE_GRAPHQL_PLAYGROUND,
    plugins: [typeValidationPlugin({ schema, directives: [arrayLengthDirective(), boundedIntegerDirective()] })],
    // cache: new RedisCache({
    //   host: env.CACHE_HOST,
    //   port: env.CACHE_PORT,
    //   keyPrefix: `${env.CACHE_PREFIX}_APOLLO_`,
    //   ...(env.CACHE_PASSWORD !== null ? { password: env.CACHE_PASSWORD } : {}),
    //   ...(env.CACHE_ENABLE_TLS ? { tls: {} } : {}),
    // }),
  })

  return server
}

export default createApolloServer
