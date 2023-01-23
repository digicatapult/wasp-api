import { describe, it } from 'mocha'
import { expect } from 'chai'
import { setup as setupClient } from './helper/client.js'
import { setup as setupUsers } from './helper/usersMock.js'
import data from './helper/data.js'

const { userLoginCreds, createUser, getUser, getUsers, assertUser, assertUsers } = data

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
