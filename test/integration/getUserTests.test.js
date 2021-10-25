const { describe, it } = require('mocha')
const { expect } = require('chai')
const { setup: setupClient } = require('./helper/client')
const { setup: setupUsers } = require('./helper/usersMock')

const { userLoginCreds, createUser, getUser, getUsers, assertUser, assertUsers } = require('./helper/data')

describe('get user tests', () => {
  describe('get user', () => {
    let context = {}

    setupClient(context)
    setupUsers(context)

    it('as an admin I want to get the logged in user', async () => {
      const expectedResult = createUser(userLoginCreds[0].username, 'admin')
      const { actualResult } = await getUser(context, userLoginCreds[0])
      assertUser(actualResult, expectedResult, 'user')
    })
  })

  describe('get users', () => {
    let context = {}

    setupClient(context)
    setupUsers(context)

    it('as an admin I want to get all the users', async () => {
      const userOne = createUser(userLoginCreds[0].username, userLoginCreds[0].type)
      const userTwo = createUser(userLoginCreds[1].username, userLoginCreds[1].type)
      const expectedResult = [userOne, userTwo]

      const { actualResult } = await getUsers(context, userLoginCreds[0])
      expect(actualResult).to.have.property('users')
      assertUsers(actualResult.users, expectedResult)
    })
  })
})
