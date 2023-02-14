function getThingsQueryGenerator(multiplier = 0) {
  const thingQuery = `things {
          uuid
          type
        `

  let query = thingQuery

  for (let counter = 0; counter < multiplier; counter++) {
    query = query.concat(thingQuery)
  }

  return query
}

const mkQueries = (client) => {
  const getUser = async (userId) => {
    return client.query({
      userId,
      query: `
      query {
        user {
          username
          type
          createdAt
        }
      }
    `,
    })
  }

  const getUsers = async (userId) => {
    return client.query({
      userId,
      query: `
      query {
        users {
          username
          type
          createdAt
        }
      }
    `,
    })
  }

  const createUser = async (userId, username, isAdmin) => {
    return client.query({
      userId,
      query: `
      mutation($username: String!, $isAdmin: Boolean!) {
        createUser (username: $username, isAdmin: $isAdmin) {
          username
          type
          createdAt
          password
        }
      }
    `,
      variables: {
        username,
        isAdmin,
      },
    })
  }

  const updateUserPassword = async (userId, password) => {
    return client.query({
      userId,
      query: `
      mutation UpdateUserPassword($password: String!) {
        updateUserPassword(password: $password)
      }
      `,
      variables: {
        password: password,
      },
    })
  }

  const updateUserType = async (userId, username, type) => {
    return client.query({
      userId,
      query: `
      mutation UpdateUserType($username: String!, $type: UserType!) {
        updateUserType(username: $username, type: $type)
      }
      `,
      variables: {
        username: username,
        type: type,
      },
    })
  }

  const resetUserPassword = async (userId, username) => {
    return client.query({
      userId,
      query: `
      mutation ResetUserPassword($username: String!) {
        resetUserPassword(username: $username)
      }
      `,
      variables: {
        username: username,
      },
    })
  }

  const createThing = async (userId, { thingType, ingests }) => {
    return client.query({
      userId,
      query: `
      mutation CreateThing($thingType: String!, $ingests: [IngestConfigurationInput!]!) {
        createThing(thing: {
          type: $thingType, ingests: $ingests
        }) {
          uuid
        }
      }
      `,
      variables: {
        thingType,
        ingests,
      },
    })
  }

  const getThings = async (userId) => {
    return client.query({
      userId,
      query: `
      query getThings {
        things {
          uuid
          type
          ingests {
            ingestId
            ingest
            configuration
          }
        }
      }
    `,
    })
  }

  const getThing = async (userId, { uuid }) => {
    return client.query({
      userId,
      query: `
      query getThing (
        $uuid: String!
      ) {
        thing(uuid: $uuid) {
          uuid
          type
          ingests {
            ingestId
            ingest
            configuration
          }
        }
      }
    `,
      variables: {
        uuid,
      },
    })
  }

  const getThingsQueryTooLarge = async (userId) => {
    return client.query({
      userId,
      query: `
        query getThingsUser {
          ${getThingsQueryGenerator(100)},
        }
        `,
      variables: {},
    })
  }

  const getDatasets = async (userId, { filter }) => {
    return client.query({
      userId,
      query: `
      query getThings($filter: DatasetsFilterInput) {
        things {
          uuid
          datasets(filter: $filter) {
            type
            label
          }
        }
      }
    `,
      variables: {
        filter,
      },
    })
  }

  const getReadings = async (userId, { thingId, filter }) => {
    return client.query({
      userId,
      query: `
      query getThings($thingId: String!, $filter: ReadingsFilterInput) {
        thing(uuid: $thingId) {
          uuid
          datasets {
            readings(filter: $filter) {
              timestamp
              value
            }
          }
        }
      }
    `,
      variables: {
        thingId,
        filter,
      },
    })
  }

  const getReadingsCount = async (userId, { thingId, filter }) => {
    return client.query({
      userId,
      query: `
      query getReadingsCount($thingId: String!, $filter: ReadingsFilterInput) {
        thing(uuid: $thingId) {
          datasets(filter: { types: ["active_power_total"] }) {
            label
            count(filter: $filter)
          }
        }
      }
    `,
      variables: {
        thingId,
        filter,
      },
    })
  }

  return {
    getUser,
    getUsers,
    createUser,
    updateUserPassword,
    updateUserType,
    resetUserPassword,
    createThing,
    getThing,
    getThings,
    getThingsQueryTooLarge,
    getDatasets,
    getReadings,
    getReadingsCount,
  }
}

export { mkQueries }
