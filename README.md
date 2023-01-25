# `wasp-api`

## Introduction

This service acts as the GraphQL API in the WASP for querying the status of the system and making state changes. `wasp-api` also contains a `docker-compose` file for bringing up WASP dependencies. See [Dependencies](#Dependencies) for details.

The GraphQL API is self-documented and best explored via the graphql playground. This can be found by running the service in developer mode, as described in [Getting started](#Getting-started), and then by visiting [http://localhost:3001/graphql](http://localhost:3001/graphql) (assuming a default `PORT` configuration)

## Getting started

Before running `wasp-api` the necessary dependencies must be started (see [Dependencies](#Dependencies)) and you must provide configuration (see [Configuration](#Configuration)). The `wasp-api` is then most straightforwardly run using a standard `npm` workflow:

```console
$ npm install
$ npm run dev
```

## Dependencies

The service is dependant on two external services: a PostgreSQL database and a Redis instance. These are most easily started using the `docker-compose` file which can be started using:

```console
$ docker-compose up
```

which will start the relevant containers attached to the current session or:

```console
$ docker-compose up -d
```

to run the services detached.

## Configuration

Configuration of `wasp-api` is done by setting environment variables at the service runtime. The service supports loading of environment variables from a `.env` file which is the recommended method for development. There are two broad categories of configuration; the general configuration and the network provider configuration.

### General Configuration

The following configuration settings apply regardless of network provider or the configured data forwarders.

| variable                  | required |        default         | description                                                                          |
| :------------------------ | :------: | :--------------------: | :----------------------------------------------------------------------------------- |
| PORT                      |    N     |         `3001`         | Port on which the service will listen                                                |
| LOG_LEVEL                 |    N     |         `info`         | Logging level. Valid values are [`trace`, `debug`, `info`, `warn`, `error`, `fatal`] |
| MAX_QUERY_SIZE            |    N     |          1e5           | Maximum request body size in bytes                                                   |
| ENABLE_GRAPHQL_PLAYGROUND |    N     |         `true`         | Whether the GraphQL playground should be rendered                                    |
| CACHE_HOST                |    Y     |           -            | Redis host                                                                           |
| CACHE_PORT                |    N     |         `6379`         | Redis port                                                                           |
| CACHE_PREFIX              |    N     |   `WASP_API_CACHE\*`   | Cache prefix to when setting items in Redis                                          |
| CACHE_MAX_TTL             |    N     |         `600`          | Maximum TTL for cache entries                                                        |
| CACHE_ENABLE_TLS          |    Y     |           -            | Does Redis require TLS connections                                                   |
| THINGS_SERVICE_HOST       |    N     |  `wasp-thing-service`  | Hostname to connect to a deployed thing-service                                      |
| THINGS_SERVICE_PORT       |    N     |          `80`          | Port to connect to a deployed thing-service                                          |
| READINGS_SERVICE_HOST     |    N     | `wasp-reading-service` | Hostname to connect to a deployed reading-service                                    |
| READINGS_SERVICE_PORT     |    N     |          `80`          | Port to connect to a deployed reading-service                                        |
| USERS_SERVICE_HOST        |    N     |  `wasp-user-service`   | Hostname to connect to a deployed user-service                                       |
| USERS_SERVICE_PORT        |    N     |          `80`          | Port to connect to a deployed user-service                                           |
