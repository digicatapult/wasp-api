const dataLoader = require('dataloader')

const logger = require('../logger')

const {
  things: { getThing },
} = require('../services')

const buildThingLoader = () => {
  return new dataLoader(async (thingIds) => {
    return await Promise.all(
      thingIds.map(async (id) => {
        logger.debug(`Loading thing ${id}`)
        try {
          return await getThing({ id })
        } catch (err) {
          return err
        }
      })
    )
  })
}

module.exports = {
  buildThingLoader,
}
