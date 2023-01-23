import request from 'supertest'
import { createHttpServer } from '../../../app/server.js'
import { mkQueries } from './queries.js'

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
export function setup(context) {
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
