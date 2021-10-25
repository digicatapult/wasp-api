const { GraphQLScalarType } = require('graphql')
const { GraphQLJSON } = require('graphql-scalars')
const { Kind } = require('graphql/language')
const { UserInputError } = require('apollo-server-express')
const { withCaching } = require('@digicatapult/resolver-cache-datasource')
const { setResolverDefault, asAdmin, asUserOrAdmin } = require('./authUtils')

const { things: thingsService, readings: readingsService, users: usersService } = require('../services')

const customTypes = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value) // value from the client
    },
    serialize(value) {
      // dates are stored in cache as strings so need to be reconstructed
      return new Date(value).getTime() // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(parseInt(ast.value)) // ast value is always in string format
      }
      return null
    },
  }),
  JSON: GraphQLJSON,
}

const resolvers = {
  Query: {
    things: async (_, __, { loaders: { thing } }) => {
      const things = await thingsService.getThings()
      return Promise.all(things.map(({ id }) => thing.load(id)))
    },
    thing: (_, { uuid }, { loaders: { thing } }) => thing.load(uuid),
    user: (_, __, { user }) => user,
    users: asAdmin((_, __, { user }) => usersService.getUsers(user.id)),
  },
  Thing: {
    uuid: ({ id: uuid }) => uuid,
    ingests: ({ ingests }) => Object.values(ingests),
    datasets: async ({ id: thingId }, { filter }) => {
      const datasets = await readingsService.getThingDatasets({ thingId, ...filter })
      const dataSetsWithCount = await Promise.all(
        datasets.map(async (ds) => {
          const totalReadingsCount = await readingsService.getDatasetReadingsCount({ thingId, datasetId: ds.id }, {})
          return { ...ds, ...totalReadingsCount }
        })
      )

      return dataSetsWithCount.map((ds) => ({
        id: ds.id,
        type: ds.type,
        label: ds.label,
        thingId,
        totalReadingsCount: ds.count,
      }))
    },
    status: withCaching({
      resolve: async ({ id: thingId }) => {
        const datasets = await readingsService.getThingDatasets({ thingId })
        const datasetCounts = await Promise.all(
          datasets.map(async (ds) => {
            const totalReadingsCount = await readingsService.getDatasetReadingsCount({ thingId, datasetId: ds.id }, {})
            return totalReadingsCount.count
          })
        )
        const hasUpdated = datasetCounts.some((count) => count > 0)
        if (!hasUpdated) return 'neverConnected'
        else return 'online'
      },
      cacheKeyItems: () => [],
      ttl: 30,
    }),
  },
  Reading: {
    thing: ({ thingId }, _, { loaders: { thing } }) => thing.load(thingId),
  },
  ThingDataset: {
    thing: async ({ thingId }, _, { loaders: { thing } }) => thing.load(thingId),
    readings: withCaching({
      resolve: async ({ id: datasetId, thingId }, { filter }) => {
        const res = await readingsService.getDatasetReadings(
          { thingId, datasetId },
          { ...filter, sortByTimestamp: 'DESC' }
        )

        for (const row of res) {
          row.thingId = thingId
        }

        return res
      },
      cacheKeyItems: ({ id, totalReadingsCount }, { filter }) => {
        const { limit, startTimestamp, endTimestamp } = filter || {}
        return [id || '', limit || '', startTimestamp || '', endTimestamp || '', totalReadingsCount || '0']
      },
    }),
    count: withCaching({
      resolve: async ({ id: datasetId, thingId }, { filter }) => {
        const res = await readingsService.getDatasetReadingsCount(
          { thingId, datasetId },
          { ...filter, sortByTimestamp: 'DESC' }
        )

        return res && res.count >= 0 ? res.count : 0
      },
      cacheKeyItems: ({ id, totalReadingsCount }, { filter }) => {
        const { startTimestamp, endTimestamp } = filter || {}
        return [id || '', startTimestamp || '', endTimestamp || '', totalReadingsCount || '']
      },
    }),
  },
  User: {
    username: ({ name }) => name,
    type: ({ role }) => role,
    createdAt: ({ createdAt }) => new Date(createdAt).getTime(),
    createdBy: asAdmin(({ createdBy }, _, { user }) => usersService.getUser(user.id, { userId: createdBy })),
  },
  NewUser: {
    username: ({ name }) => name,
    type: ({ role }) => role,
    createdAt: ({ createdAt }) => new Date(createdAt).getTime(),
    createdBy: asAdmin(({ createdBy }, _, { user }) => usersService.getUser(user.id, { userId: createdBy })),
  },
  Mutation: {
    createThing: async (_, { thing: { type, metadata, ingests } }, { loaders: { thing } }) => {
      const { id } = await thingsService.createThing({
        type,
        metadata: metadata || {},
        ingests,
      })
      return thing.load(id)
    },
    updateThing: async (_, { uuid, thing: { metadata } }, { loaders: { thing } }) => {
      const currentThing = await thing.load(uuid)
      await thingsService.updateThing({ ...currentThing, metadata })
      return true
    },
    createUser: asAdmin(async (_, { username: name, isAdmin }, { user: createdBy }) => {
      try {
        const user = await usersService.createUser(createdBy.id, {
          name,
          role: isAdmin ? 'admin' : 'user',
        })
        return user
      } catch (err) {
        if (err instanceof usersService.Errors.UsersServiceError && err.code === 409) {
          throw new UserInputError('Username exists')
        }
        throw err
      }
    }),
    updateUserPassword: async (_, { password }, { user }) => {
      try {
        await usersService.updateUserPassword(user.id, { password })
      } catch (err) {
        if (err instanceof usersService.Errors.UsersServiceError && err.code === 400) {
          throw new UserInputError(err.message)
        }
        throw err
      }
      return true
    },
    resetUserPassword: asAdmin(async (_, { username }, { user }) => {
      const users = await usersService.getUsers(user.id)
      const userToReset = users.find(({ name }) => name === username)
      if (!userToReset) {
        throw new UserInputError(`User ${username} does not exist`)
      }
      const { password } = await usersService.resetUserPassword(user.id, { userId: userToReset.id })
      return password
    }),
    updateUserType: asAdmin(async (_, { username, type }, { user }) => {
      const users = await usersService.getUsers(user.id)
      const userToUpdate = users.find(({ name }) => name === username)
      if (!userToUpdate) {
        throw new UserInputError(`User ${username} does not exist`)
      }
      await usersService.updateUser(user.id, { userId: userToUpdate.id, role: type })
      return true
    }),
  },
}

module.exports = [customTypes, setResolverDefault(resolvers)(asUserOrAdmin)]
