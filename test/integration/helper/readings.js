import { expect } from 'chai'

const assertReadingEqual = (readingA, readingB) => {
  expect(readingA.timestamp).to.equal(readingB.timestamp)
  expect(readingA.value).to.equal(readingB.value)
}

const assertReadingsEqual = (readingA, readingB) => {
  expect(readingA.length).to.equal(readingB.length)

  for (const index in readingA) {
    assertReadingEqual(readingA[index], readingB[index])
  }
}

export { assertReadingsEqual, assertReadingEqual }
