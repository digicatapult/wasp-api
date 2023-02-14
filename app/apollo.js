import { ApolloServer } from '@apollo/server'

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
    playground: env.ENABLE_GRAPHQL_PLAYGROUND,
    tracing: env.ENABLE_GRAPHQL_PLAYGROUND,
    plugins: [typeValidationPlugin({ schema, directives: [arrayLengthDirective(), boundedIntegerDirective()] })],
  })

  return server
}

export default createApolloServer
