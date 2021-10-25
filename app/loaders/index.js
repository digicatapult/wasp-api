const things = require('./things')

const buildDataLoaders = () => {
  return {
    thing: things.buildThingLoader(),
  }
}

module.exports = buildDataLoaders
