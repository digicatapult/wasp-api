import fetch from 'node-fetch'

import env from '../env.js'
import logger from '../logger.js'

const { READINGS_SERVICE_HOST, READINGS_SERVICE_PORT } = env

class ReadingsServiceError extends Error {
  constructor({ code, message }) {
    super(message)
    this.code = code
  }
}

const apiPrefix = `http://${READINGS_SERVICE_HOST}:${READINGS_SERVICE_PORT}/v1`

const getThingDatasets = async ({ thingId, ...filter }) => {
  const url = `${apiPrefix}/thing/${thingId}/dataset`

  logger.debug(`Fetching datasets for ${thingId} using GET ${url}`)

  const response = await fetch(url)

  logger.debug(`Fetch ${url} returned response ${response.status}`)

  if (!response.ok) {
    logger.warn(
      `Error fetching datasets from readings service (${url}). Error was (${response.status}) ${response.statusText}`
    )
    throw new ReadingsServiceError({ code: response.status, message: response.statusText })
  }

  const responseText = await response.text()
  if (responseText) {
    let result = null
    try {
      result = JSON.parse(responseText)
    } catch (err) {
      logger.error('Error parsing result from readings service %j', err)
      throw new ReadingsServiceError({ code: 500, message: 'Internal server error' })
    }
    logger.trace(`Datasets for ${thingId} were:\n%j`, result)

    if (filter.types) {
      const typeSet = new Set(filter.types)
      result = result.filter(({ type }) => typeSet.has(type))
    }

    if (filter.labels) {
      const labelSet = new Set(filter.labels)
      result = result.filter(({ label }) => labelSet.has(label))
    }

    return result
  }
}

const getDatasetReadingsSearch = ({ query, limit, offset }) => {
  const search = { offset, limit }

  if (query.startTimestamp) {
    search.startDate = new Date(query.startTimestamp).toISOString()
  }

  if (query.endTimestamp) {
    search.endDate = new Date(query.endTimestamp).toISOString()
  }

  if (query.sortByTimestamp) {
    search.sortByTimestamp = query.sortByTimestamp
  }

  return new URLSearchParams(search).toString()
}

const getDatasetReadings = async ({ thingId, datasetId }, query) => {
  const totalLimit = query.limit
  const readings = []

  for (let offset = 0, hasMore = true, safety = 0; hasMore && readings.length < totalLimit && safety < 100; safety++) {
    const url = new URL(`${apiPrefix}/thing/${thingId}/dataset/${datasetId}/reading`)
    url.search = getDatasetReadingsSearch({ query, limit: totalLimit - readings.length, offset })

    logger.debug(`Fetching readings using GET ${url}`)

    const response = await fetch(url)

    logger.debug(`Fetch ${url} returned response ${response.status}`)

    if (!response.ok) {
      logger.warn(
        `Error fetching readings from readings service (${url}). Error was (${response.status}) ${response.statusText}`
      )
      throw new ReadingsServiceError({ code: response.status, message: response.statusText })
    }

    const responseText = await response.text()
    if (responseText) {
      try {
        const result = JSON.parse(responseText)
        logger.trace(`Fetch ${url} result:\n%j`, result)
        Array.prototype.push.apply(readings, result)
        hasMore = Array.isArray(result) && result.length !== 0
        offset = readings.length
      } catch (err) {
        logger.error('Invalid OK response from readings service %j', responseText)
        throw new ReadingsServiceError({ code: 500, message: 'Internal server error' })
      }
    } else {
      logger.error('Invalid OK response from readings service %j', responseText)
      throw new ReadingsServiceError({ code: 500, message: 'Internal server error' })
    }
  }

  return readings
}

const getDatasetReadingsCount = async ({ thingId, datasetId }, query) => {
  let readingsCount = 0

  const url = new URL(`${apiPrefix}/thing/${thingId}/dataset/${datasetId}/reading_count`)
  url.search = getDatasetReadingsSearch({ query })

  logger.debug(`Fetching readings using GET ${url}`)

  const response = await fetch(url)

  logger.debug(`Fetch ${url} returned response ${response.status}`)

  if (!response.ok) {
    logger.warn(
      `Error fetching readings from readings service (${url}). Error was (${response.status}) ${response.statusText}`
    )
    throw new ReadingsServiceError({ code: response.status, message: response.statusText })
  }

  const responseText = await response.text()
  if (responseText) {
    try {
      const result = JSON.parse(responseText)
      logger.trace(`Fetch ${url} result:\n%j`, result)
      readingsCount = result
    } catch (err) {
      logger.error('Invalid OK response from readings service %j', responseText)
      throw new ReadingsServiceError({ code: 500, message: 'Internal server error' })
    }
  } else {
    logger.error('Invalid OK response from readings service %j', responseText)
    throw new ReadingsServiceError({ code: 500, message: 'Internal server error' })
  }
  return readingsCount
}

export default {
  Errors: {
    ReadingsServiceError,
  },
  getThingDatasets,
  getDatasetReadings,
  getDatasetReadingsCount,
}
