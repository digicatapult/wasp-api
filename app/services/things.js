import fetch from 'node-fetch'

import env from '../env.js'
import logger from '../logger.js'

const { THINGS_SERVICE_HOST, THINGS_SERVICE_PORT } = env

class ThingsServiceError extends Error {
  constructor({ code, message }) {
    super(message)
    this.code = code
  }
}

const apiPrefix = `http://${THINGS_SERVICE_HOST}:${THINGS_SERVICE_PORT}/v1`

const getThings = async () => {
  const url = `${apiPrefix}/thing`
  const response = await fetch(url)

  if (!response.ok) {
    logger.warn(
      `Error fetching things from things service (${url}). Error was (${response.status}) ${response.statusText}`
    )
    throw new ThingsServiceError({ code: response.status, message: response.statusText })
  }

  const responseText = await response.text()
  if (responseText) {
    return JSON.parse(responseText)
  }
}

const getThing = async ({ id: thingId }) => {
  logger.debug(`Getting thing ${thingId} from thing service`)

  const handleError = (response) => {
    logger.trace(`Response from thing service: ${response.status}`)
    if (!response.ok) {
      if (response.status === 404) {
        throw new ThingsServiceError({ code: response.status, message: `Invalid thing ${thingId}` })
      } else {
        logger.warn(
          `Error fetching thing ${thingId} from things service (${thingUrl}). Error was (${response.status}) ${response.statusText}`
        )
        throw new ThingsServiceError({ code: response.status, message: response.statusText })
      }
    }
  }

  const thingUrl = `${apiPrefix}/thing/${thingId}`
  const thingResponse = await fetch(thingUrl)
  handleError(thingResponse)

  const thingResponseText = await thingResponse.text()
  const thing = thingResponseText ? JSON.parse(thingResponseText) : null

  logger.trace(`Getting ingests for thing ${thingId}`)

  const ingestsUrl = `${apiPrefix}/thing/${thing.id}/ingest`
  const ingestsResponse = await fetch(ingestsUrl)
  handleError(ingestsResponse)

  const ingestsResponseText = await ingestsResponse.text()
  const ingests = thingResponseText ? JSON.parse(ingestsResponseText) : null

  logger.trace(`Got thing ${thingId} from thing service`)

  return {
    ...thing,
    ingests,
  }
}

const deleteThing = async ({ id }) => {
  const url = `${apiPrefix}/thing/${id}`
  const response = await fetch(url, {
    method: 'delete',
  })
  if (!response.ok) {
    logger.warn(
      `Error deleting thing ${id} with things service (${url}). Error was (${response.status}) ${response.statusText}`
    )
    throw new ThingsServiceError({ code: response.status, message: response.statusText })
  }
}

const createThing = async ({ type, metadata, ingests }) => {
  const handleError = (response) => {
    if (!response.ok) {
      logger.warn(
        `Error creating thing ${JSON.stringify({ type, metadata, ingests })} with things service (${url}). Error was (${
          response.status
        }) ${response.statusText}`
      )
      throw new ThingsServiceError({ code: response.status, message: response.statusText })
    }
  }

  const url = `${apiPrefix}/thing`
  const response = await fetch(url, {
    method: 'post',
    body: JSON.stringify({ type, metadata }),
    headers: { 'Content-Type': 'application/json' },
  })
  handleError(response)

  const responseText = await response.text()
  const thing = responseText ? JSON.parse(responseText) : null

  try {
    for (const ingest of ingests) {
      const url = `${apiPrefix}/thing/${thing.id}/ingest`
      const response = await fetch(url, {
        method: 'post',
        body: JSON.stringify({
          ingest: ingest.ingest,
          ingestId: ingest.ingestId === null ? thing.id : ingest.ingestId,
          configuration: ingest.configuration,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      handleError(response)
    }
  } catch (err) {
    logger.warn(`Attempting to delete thing ${thing.id}`)
    try {
      await deleteThing({ id: thing.id })
    } catch (delErr) {
      throw err
    }
    throw err
  }

  return thing
}

const updateThing = async ({ id: thingId, ...thingDesc }) => {
  const url = `${apiPrefix}/thing/${thingId}`
  const response = await fetch(url, {
    method: 'put',
    body: JSON.stringify(thingDesc),
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    logger.warn(
      `Error updating thing ${JSON.stringify({ id: thingId, ...thingDesc })} with things service (${url}). Error was (${
        response.status
      }) ${response.statusText}`
    )
    throw new ThingsServiceError({ code: response.status, message: response.statusText })
  }

  const responseText = await response.text()
  if (responseText) {
    return JSON.parse(responseText)
  }
}

export default {
  Errors: {
    ThingsServiceError,
  },
  getThings,
  getThing,
  createThing,
  updateThing,
}
