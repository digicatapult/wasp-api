import { expect } from 'chai'

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

const assertThingEqual = (thingA, thingB) => {
  expect(thingA.type.name).to.equal(thingB.type.name)
  expect(thingA.uuid).to.equal(thingB.uuid)
  expect(thingA.ingests).to.deep.equal(thingB.ingests)
}

const assertThingsEqual = (thingA, thingB) => {
  expect(thingA.length).to.equal(thingB.length)

  // events are unsorted so sort by uuid
  const sortedA = sortByUUID(thingA)
  const sortedB = sortByUUID(thingB)

  for (const index in sortedA) {
    assertThingEqual(sortedA[index], sortedB[index])
  }
}

export { assertThingsEqual, assertThingEqual }
