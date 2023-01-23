import { describe, before, it } from 'mocha'
import { expect } from 'chai'

import { setup as setupClient } from './helper/client.js'

describe('health', function () {
  const context = {}
  setupClient(context)

  before(async function () {
    context.response = await context.waspAPI.get('/health')
  })

  it('should return 200', function () {
    expect(context.response.status).to.equal(200)
  })

  it('should return success', function () {
    expect(context.response.body).to.deep.equal({ status: 'ok' })
  })
})
