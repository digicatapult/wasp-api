const { describe, it } = require('mocha')
const { setup: setupClient } = require('./helper/client')
const { setup: setupUsers, makeDefaultUsersMock } = require('./helper/usersMock')

const {
  createUserQuery,
  userLoginCreds,
  getUser,
  createUser,
  assertUser,
  assertCreatedUser,
  assertCreatedUserError,
} = require('./helper/data')

describe('create user tests', () => {
  describe('create user', () => {
    let context = {
      usersMock: {
        users: makeDefaultUsersMock().users,
        newUser: {
          id: '00000000-0000-0000-0000-000000000003',
          createdAt: '2021-01-01T00:00:00.000Z',
          password: 'new_password',
        },
      },
    }

    setupClient(context)
    setupUsers(context)

    it('as an admin I want to create a user', async () => {
      const expectedResult = createUser('new_test_user', 'user')

      await createUserQuery(context, userLoginCreds[0], expectedResult.username, false)
      let actualResult = context.actualResult
      assertCreatedUser(actualResult, expectedResult, 'createUser')

      await getUser(context, {
        id: context.usersMock.newUser.id,
      })
      actualResult = context.actualResult

      assertUser(actualResult, expectedResult, 'user')
    })
  })

  describe('create duplicated user', () => {
    let context = {
      usersMock: {
        users: makeDefaultUsersMock().users,
        newUserError: {
          code: 409,
        },
      },
    }

    setupClient(context)
    setupUsers(context)

    it('as an admin I want to create a user with duplicated username', async () => {
      const user = createUser('new_test_user', 'user')
      const expectedResult = [
        {
          message: 'Username exists',
        },
      ]

      await createUserQuery(context, userLoginCreds[0], user, false)

      const { actualResult } = await createUserQuery(context, userLoginCreds[0], user.username, false)
      assertCreatedUserError(actualResult, expectedResult)
    })
  })

  describe('create admin user', () => {
    let context = {
      usersMock: {
        users: makeDefaultUsersMock().users,
        newUser: {
          id: '00000000-0000-0000-0000-000000000003',
          name: 'new_test_admin',
          role: 'admin',
          createdAt: '2021-01-01T00:00:00.000Z',
          password: 'new_password',
        },
      },
    }

    setupClient(context)
    setupUsers(context)

    it('as an admin I want to create a user', async () => {
      const expectedResult = createUser('new_test_admin', 'admin')

      await createUserQuery(context, userLoginCreds[0], expectedResult.username, false)
      let actualResult = context.actualResult
      assertCreatedUser(actualResult, expectedResult, 'createUser')

      await getUser(context, {
        id: context.usersMock.newUser.id,
      })
      actualResult = context.actualResult

      assertUser(actualResult, expectedResult, 'user')
    })
  })

  describe('create user with insufficient privileges', () => {
    let context = {
      usersMock: {
        users: makeDefaultUsersMock().users,
        newUser: {
          id: '00000000-0000-0000-0000-000000000003',
          createdAt: '2021-01-01T00:00:00.000Z',
          password: 'new_password',
        },
      },
    }

    setupClient(context)
    setupUsers(context)

    it('as a user I want to create a user', async () => {
      const user = createUser('new_test_user', 'user')
      const expectedResult = [
        {
          message:
            'User has insufficient privileges to perform the requested action. User has role user. Action requires role to be one of {admin}',
        },
      ]

      const { actualResult } = await createUserQuery(context, userLoginCreds[1], user.username, false)
      assertCreatedUserError(actualResult, expectedResult, 'createUser')
    })
  })
})
