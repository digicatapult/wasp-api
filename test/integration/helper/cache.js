const redis = require('redis')
const { CACHE_HOST, CACHE_PORT, CACHE_PASSWORD } = require('../../../app/env')

const redisClient = redis.createClient({
  host: CACHE_HOST,
  port: CACHE_PORT,
  ...(CACHE_PASSWORD !== null ? { password: CACHE_PASSWORD } : {}),
})

const setupCacheClearer = () => {
  before(async function () {
    return new Promise((resolve) => {
      redisClient.flushall(() => resolve())
    })
  })

  after(async function () {
    return new Promise((resolve) => {
      redisClient.flushall(() => resolve())
    })
  })
}

module.exports = {
  setup: setupCacheClearer,
}
