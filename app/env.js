import envalid from 'envalid'
import dotenv from 'dotenv'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: 'test/test.env' })
} else {
  dotenv.config()
}

const vars = envalid.cleanEnv(
  process.env,
  {
    PORT: envalid.port({ default: 3001 }),
    LOG_LEVEL: envalid.str({ default: 'info', devDefault: 'debug' }),
    MAX_QUERY_SIZE: envalid.num({ default: 1e5 }),
    ENABLE_GRAPHQL_PLAYGROUND: envalid.bool({ default: false, devDefault: true }),
    CACHE_HOST: envalid.host({ devDefault: 'localhost' }),
    CACHE_PORT: envalid.port({ default: 6379 }),
    CACHE_USERNAME: envalid.str({ devDefault: 'default' }),
    CACHE_PASSWORD: envalid.str({ devDefault: 'password' }),
    CACHE_PREFIX: envalid.str({ default: 'WASP_API_CACHE' }),
    CACHE_MAX_TTL: envalid.num({ default: 600 }),
    CACHE_ENABLE_TLS: envalid.bool({ devDefault: false }),
    THINGS_SERVICE_HOST: envalid.host({ default: 'wasp-thing-service' }),
    THINGS_SERVICE_PORT: envalid.port({ default: 80 }),
    READINGS_SERVICE_HOST: envalid.host({ default: 'wasp-reading-service' }),
    READINGS_SERVICE_PORT: envalid.port({ default: 80 }),
    USERS_SERVICE_HOST: envalid.host({ default: 'wasp-user-service' }),
    USERS_SERVICE_PORT: envalid.port({ default: 80 }),
  },
  {
    strict: true,
  }
)

export default vars
