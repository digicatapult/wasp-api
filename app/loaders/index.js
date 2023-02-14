import { buildThingLoader } from './things.js'

const buildDataLoaders = () => {
  return {
    thing: buildThingLoader(),
  }
}

export default buildDataLoaders
