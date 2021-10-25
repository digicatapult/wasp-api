const { describe, it } = require('mocha')
const { expect } = require('chai')
const { setup: setupClient } = require('./helper/client')
const { setup: setupUsers, makeDefaultUsersMock } = require('./helper/usersMock')

const {
  userLoginCreds,
  getUsers,
  updateUserPassword,
  updateUserType,
  assertUpdatedUserPassword,
  assertError,
  createUserQuery,
  assertUpdatedUserType,
  resetUserPassword,
} = require('./helper/data')

describe('update user tests', () => {
  describe('valid password update', () => {
    const context = {
      usersMock: {
        users: makeDefaultUsersMock().users,
        updatePasswordError: null,
      },
    }

    setupClient(context)
    setupUsers(context)

    it('as a user I want to update my password', async () => {
      const expectedResultOne = { updateUserPassword: true }
      const updatedPassword = 'iloveW4$p'

      await updateUserPassword(context, userLoginCreds[0], updatedPassword)
      assertUpdatedUserPassword(context.actualResult, expectedResultOne)

      // this is a little messy and assumes behaviour of the mock
      const user = context.usersMock.users.find(({ id }) => id === userLoginCreds[0].id)
      expect(user.password).to.equal(updatedPassword)
    })
  })

  describe("invalid password update (doesn't meet some requirements)", () => {
    const context = {
      usersMock: {
        users: makeDefaultUsersMock().users,
        updatePasswordError: 'Password is just not good enough',
      },
    }

    setupClient(context)
    setupUsers(context)

    it('as a user I want to update my password', async () => {
      const expectedResult = [
        {
          message: 'Password is just not good enough',
        },
      ]
      const updatedPassword = '😢'

      await updateUserPassword(context, userLoginCreds[0], updatedPassword)
      assertError(context.actualResult, expectedResult)
    })
  })

  describe('valid update user type (user -> admin)', () => {
    const context = {}

    setupClient(context)
    setupUsers(context)

    it('as an admin I want to change the role of a user to admin', async () => {
      const expectedResultOne = { updateUserType: true }
      const expectedUserType = 'admin'

      await updateUserType(context, userLoginCreds[0], userLoginCreds[1].username, expectedUserType)
      expect(context.actualResult.data).to.deep.equal(expectedResultOne)

      await getUsers(context, userLoginCreds[0])
      const getUserResult = context.actualResult.users.find((user) => user.username === userLoginCreds[1].username)

      const getUserExpected = { type: expectedUserType }
      assertUpdatedUserType(getUserResult, getUserExpected)
    })
  })

  describe('valid update user type (user -> removed)', () => {
    const context = {}

    setupClient(context)
    setupUsers(context)

    it('as an admin I want to change the role of a user to removed', async () => {
      const expectedResultOne = { updateUserType: true }
      const expectedUserType = 'removed'

      await updateUserType(context, userLoginCreds[0], userLoginCreds[1].username, expectedUserType)
      expect(context.actualResult.data).to.deep.equal(expectedResultOne)

      await getUsers(context, userLoginCreds[0])
      const getUserResult = context.actualResult.users.find((user) => user.username === userLoginCreds[1].username)

      const getUserExpected = { type: expectedUserType }
      assertUpdatedUserType(getUserResult, getUserExpected)
    })
  })

  describe('valid update user type (admin -> user)', () => {
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

    it('as an admin I want to change the role of an admin to user', async () => {
      const expectedResultOne = { updateUserType: true }
      const expectedUserType = 'user'

      await createUserQuery(context, userLoginCreds[0], 'new_test_admin', true)

      await updateUserType(context, userLoginCreds[0], 'new_test_admin', expectedUserType)
      expect(context.actualResult.data).to.deep.equal(expectedResultOne)

      await getUsers(context, userLoginCreds[0])
      const getUserResult = context.actualResult.users.find((user) => user.username === 'new_test_admin')

      const getUserExpected = { type: expectedUserType }
      assertUpdatedUserType(getUserResult, getUserExpected)
    })
  })

  describe('invalid update user type as a user not an admin', () => {
    const context = {}

    setupClient(context)
    setupUsers(context)

    it('as a user I want to the role of a user', async () => {
      const expectedResult = [
        {
          message:
            'User has insufficient privileges to perform the requested action. User has role user. Action requires role to be one of {admin}',
        },
      ]
      const expectedUserType = 'admin'

      await updateUserType(context, userLoginCreds[1], userLoginCreds[1].username, expectedUserType)

      assertError(context.actualResult, expectedResult)
    })
  })

  describe('reset password as admin', () => {
    const context = {}

    setupClient(context)
    setupUsers(context)

    it("should reset a user's password", async () => {
      await resetUserPassword(context, userLoginCreds[0], userLoginCreds[1].username)
      let actualResult = context.actualResult
      expect(actualResult.resetUserPassword).to.equal('wibble')
    })
  })

  describe('reset password as non-admin', () => {
    const context = {}

    setupClient(context)
    setupUsers(context)

    it('should error with insufficient privileges', async () => {
      const expectedResult = [
        {
          message:
            'User has insufficient privileges to perform the requested action. User has role user. Action requires role to be one of {admin}',
        },
      ]
      await resetUserPassword(context, userLoginCreds[1], userLoginCreds[1].username)
      let actualResult = context.actualResult
      assertError(actualResult, expectedResult)
    })
  })
})
