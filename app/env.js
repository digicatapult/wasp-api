import envalid from 'envalid'
import dotenv from 'dotenv'

const nullSymbol = Symbol('null match')
const allowNullDefaults = (validator, opts) => {
  return envalid.makeValidator((input) => {
    if (input === null) return nullSymbol
    else return validator._parse(input)
  }, `optional_${validator.type}`)(opts)
}

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
    CACHE_PASSWORD: allowNullDefaults(envalid.str(), { devDefault: null }),
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

export default Object.entries({
  ...vars,
}).reduce((acc, [key, val]) => {
  return {
    ...acc,
    [key]: val === nullSymbol ? null : val,
  }
}, {})
