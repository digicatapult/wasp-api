import { ApolloServer } from '@apollo/server'
//const { RedisCache } = require('apollo-server-cache-redis')
import { makeExecutableSchema } from '@graphql-tools/schema'
import cors from 'cors'
import { ResolverCacheDataSource } from '@digicatapult/resolver-cache-datasource'
import validationPlugin from '@digicatapult/apollo-type-validation-plugin'

const {
  plugin: typeValidationPlugin,
  directives: { arrayLengthDirective, boundedIntegerDirective },
} = validationPlugin

import typeDefs from './graphql/typeDefs.js'
import resolvers from './graphql/resolvers.js'
import env from './env.js'
import logger from './logger.js'
import buildDataLoaders from './loaders/index.js'
import { users as usersService } from './services/index.js'

function createApolloServer() {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
    inheritResolversFromInterfaces: true,
  })

  const server = new ApolloServer({
    schema,
    cors: cors(),
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
    dataSources: () => {
      return {
        autoResolver: new ResolverCacheDataSource({
          defaultTTL: env.CACHE_MAX_TTL,
        }),
      }
    },
    context: async ({ req }) => {
      let user = null
      try {
        const userId = req.headers['user-id']
        user = await usersService.getCurrentUser(userId)
      } catch (err) {
        user = null
      }

      const loaders = buildDataLoaders()

      return { logger, user, loaders }
    },
  })

  return server
}

export default createApolloServer
