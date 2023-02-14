import { describe, it, before } from 'mocha'
import { expect } from 'chai'

import { setup as setupClient } from './helper/client.js'
import clock from './helper/clock.js'
import data from './helper/data.js'

const { mockClock, restoreClock } = clock
const { userLoginCreds } = data

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
