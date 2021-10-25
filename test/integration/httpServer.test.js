const { describe, before, it } = require('mocha')
const { expect } = require('chai')

const { setup: setupClient } = require('./helper/client')

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
