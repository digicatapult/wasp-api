const { ApolloServer } = require('apollo-server-express')
const { RedisCache } = require('apollo-server-cache-redis')
const { makeExecutableSchema } = require('graphql-tools')
const cors = require('cors')
const { ResolverCacheDataSource } = require('@digicatapult/resolver-cache-datasource')
const {
  plugin: typeValidationPlugin,
  directives: { arrayLengthDirective, boundedIntegerDirective },
} = require('@digicatapult/apollo-type-validation-plugin')

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')
const env = require('./env')
const logger = require('./logger')
const buildDataLoaders = require('./loaders')

const { users: usersService } = require('./services')

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
    cache: new RedisCache({
      host: env.CACHE_HOST,
      port: env.CACHE_PORT,
      keyPrefix: `${env.CACHE_PREFIX}_APOLLO_`,
      ...(env.CACHE_PASSWORD !== null ? { password: env.CACHE_PASSWORD } : {}),
      ...(env.CACHE_ENABLE_TLS ? { tls: {} } : {}),
    }),
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

module.exports = createApolloServer
