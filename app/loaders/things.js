import dataLoader from 'dataloader'

import logger from '../logger.js'
import { things } from '../services/index.js'

const { getThing } = things

export const buildThingLoader = () => {
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
