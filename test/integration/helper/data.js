import { expect } from 'chai'

const sortUsers = (a, b) => {
  if (a.username < b.username) {
    return -1
  } else if (a.username > b.username) {
    return 1
  }
}

const that = {
  userLoginCreds: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'test_admin',
      password: 'ilovewasps',
      type: 'admin',
      createdAt: new Date('2021-10-01T00:00:00.000Z').getTime(),
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      username: 'test_user',
      password: 'ilikewasps',
      type: 'user',
      createdAt: new Date('2021-10-01T00:00:00.000Z').getTime(),
    },
  ],
  createUserQuery: async (context, loginCreds, username, isAdmin) => {
    const {
      queries: { createUser },
    } = context

    try {
      const { data: userData } = await createUser(loginCreds.id, username, isAdmin)
      context.actualResult = userData
    } catch (err) {
      context.actualResult = err
    }

    return context
  },
  createUser: (username, type) => {
    return {
      username,
      type,
    }
  },
  getUser: async (context, loginCreds) => {
    const {
      queries: { getUser },
    } = context

    try {
      const { data: userData } = await getUser(loginCreds.id)
      context.actualResult = userData
    } catch (err) {
      context.actualResult = err
    }

    return context
  },
  getUsers: async (context, loginCreds) => {
    const {
      queries: { getUsers },
    } = context

    try {
      const { data: usersData } = await getUsers(loginCreds.id)
      context.actualResult = usersData
    } catch (err) {
      context.actualResult = err
    }

    return context
  },
  updateUserPassword: async (context, loginCreds, password) => {
    const {
      queries: { updateUserPassword },
    } = context

    try {
      const { data: updatedPassword } = await updateUserPassword(loginCreds.id, password)
      context.actualResult = updatedPassword
    } catch (err) {
      context.actualResult = err
    }

    return context
  },
  updateUserType: async (context, loginCreds, username, type) => {
    const {
      queries: { updateUserType },
    } = context

    try {
      context.actualResult = await updateUserType(loginCreds.id, username, type)
    } catch (err) {
      context.actualResult = err
    }

    return context
  },
  resetUserPassword: async (context, loginCreds, username) => {
    const {
      queries: { resetUserPassword },
    } = context

    try {
      const { data } = await resetUserPassword(loginCreds.id, username)
      context.actualResult = data
    } catch (err) {
      context.actualResult = err
    }

    return context
  },
  assertUser: (actualResult, expectedResult, responseType) => {
    expect(actualResult).to.have.property(responseType)
    expect(actualResult[responseType].username).to.equal(expectedResult.username)
    expect(actualResult[responseType].type).to.equal(expectedResult.type)
    expect(actualResult[responseType].createdAt).is.a('number')
    expect(actualResult[responseType].createdAt).is.above(0)

    expect(actualResult.error).to.equal(undefined)
  },
  assertCoreUser: (actualResult, expectedResult) => {
    expect(actualResult.username).to.equal(expectedResult.username)
    expect(actualResult.type).to.equal(expectedResult.type)
    expect(actualResult.createdAt).is.a('number')
    expect(actualResult.createdAt).is.above(0)
  },
  assertCreatedUser: (actualResult, expectedResult, responseType) => {
    that.assertUser(actualResult, expectedResult, responseType)
    expect(actualResult[responseType].password).is.a('string')
  },
  assertUsers: (actualResult, expectedResult) => {
    expect(actualResult).to.have.length(expectedResult.length)

    const sortedActualResult = actualResult.sort(sortUsers)
    const sortedExpectedResult = expectedResult.sort(sortUsers)

    for (let counter = 0; counter < sortedActualResult.length; counter++) {
      that.assertCoreUser(sortedActualResult[counter], sortedExpectedResult[counter])
    }
  },
  assertCreatedUserError: (actualResult, expectedResult) => {
    expect(actualResult).to.have.length(1)
    expect(actualResult[0]).to.have.property('message')
    expect(actualResult[0].message).to.equal(expectedResult[0].message)
  },
  assertUpdatedUserPassword: (actualResult) => {
    expect(actualResult).to.have.property('updateUserPassword')
    expect(actualResult.updateUserPassword).to.equal(true)

    expect(actualResult.error).to.equal(undefined)
  },
  assertError: (actualResult, expectedResult) => {
    expect(actualResult).to.have.length(1)
    expect(actualResult[0]).to.have.property('message')
    expect(actualResult[0].message).to.equal(expectedResult[0].message)
  },
  assertUpdatedUserType: (actualResult, expectedResult) => {
    expect(actualResult.type).to.equal(expectedResult.type)
  },
}

export default that
