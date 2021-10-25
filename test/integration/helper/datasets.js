const { expect } = require('chai')

const uuidSortFn = (a, b) => {
  if (a.uuid < b.uuid) {
    return -1
  } else {
    return 1
  }
}

const sortByUUID = (items) => {
  return items.sort(uuidSortFn)
}

const datasetSortFn = (a, b) => {
  if (a.type < b.type) {
    return -1
  } else if (a.type > b.type) {
    return 1
  } else {
    if (a.label < b.label) {
      return -1
    } else if (a.label > b.label) {
      return 1
    } else {
      return 0
    }
  }
}

const sortDatasets = (datasets) => {
  return datasets.sort(datasetSortFn)
}

const assertThingDatasetsEqual = (thingA, thingB) => {
  expect(thingA.uuid).to.equal(thingB.uuid)

  const sortedA = sortDatasets(thingA.datasets)
  const sortedB = sortDatasets(thingB.datasets)

  expect(sortedA.length).to.equal(sortedB.length)
  for (let i = 0; i < sortedA.length; i++) {
    expect(sortedA[i].type).to.deep.equal(sortedB[i].type)
    expect(sortedA[i].label).to.deep.equal(sortedB[i].label)
  }
}

const assertThingsDatasetsEqual = (thingA, thingB) => {
  expect(thingA.length).to.equal(thingB.length)

  // events are unsorted so sort by uuid
  const sortedA = sortByUUID(thingA)
  const sortedB = sortByUUID(thingB)

  for (const index in sortedA) {
    assertThingDatasetsEqual(sortedA[index], sortedB[index])
  }
}

module.exports = {
  assertThingsDatasetsEqual,
  assertThingDatasetsEqual,
}
