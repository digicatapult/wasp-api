const { describe, it, before } = require('mocha')
const { expect } = require('chai')

const { setup: setupClient } = require('./helper/client')
const { mockClock, restoreClock } = require('./helper/clock')
const { userLoginCreds } = require('./helper/data')

const [adminLogin] = userLoginCreds

describe('graphql api security tests', function () {
  describe(`list all things - query too large`, function () {
    const context = {}
    setupClient(context)
    mockClock(context)

    before(async function () {
      const {
        queries: { getThingsQueryTooLarge },
      } = context

      const result = await getThingsQueryTooLarge(adminLogin.id)
      context.result = result
    })

    restoreClock(context)

    it('should return request entity too large error', function () {
      const actualResult = context.result

      expect(actualResult).to.deep.equal({
        error: {
          message: 'request entity too large',
        },
      })
    })
  })
})
