const request = require('supertest')
const { createHttpServer } = require('../../../app/server')
const { mkQueries } = require('./queries')

function createApolloClient(waspAPI) {
  const client = async ({ userId, data }) => {
    let req = waspAPI.post('/graphql')

    if (userId) {
      req = req.set('user-id', userId)
    }

    req = req.set('Content-Type', 'application/json').send(data)
    const res = await req

    if (res.body.errors) {
      throw res.body.errors
    }

    return res.body
  }
  return {
    query: ({ userId, query, variables }) => client({ userId, data: { query, variables } }),
  }
}

let apiObj = null
module.exports.setup = function (context) {
  before(async function () {
    if (apiObj === null) {
      apiObj = {}
      apiObj.server = (await createHttpServer()).app
      apiObj.waspAPI = request(apiObj.server)
      apiObj.client = createApolloClient(apiObj.waspAPI)
      apiObj.queries = mkQueries(apiObj.client)
    }
    Object.assign(context, apiObj)
  })
}
