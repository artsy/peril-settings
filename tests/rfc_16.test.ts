jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = (danger as any)

import { rfc16 } from "../org/all-prs"

beforeEach(() => {
  dm.danger = {}
  dm.warn = jest.fn()
})

afterEach(() => {
  dm.warn = undefined
  dm.schedule = undefined
})

it("warns when code has changed but no changelog entry was made", () => {
  dm.danger.github = {
    utils: {
      fileContents: () => Promise.resolve("some changes")
    }
  }
  dm.danger.git = {
    modified_files: ["src/index.html"],
    created_files: []
  }
  return rfc16().then(() => {
    expect(dm.warn).toBeCalled()
  })
})

it("does nothing when there is no changelog file", () => {
  dm.danger.github = {
    utils: {
      fileContents: () => Promise.resolve(null)
    }
  }
  dm.danger.git = {
    modified_files: [],
    created_files: []
  }
  return rfc16().then(() => {
    expect(dm.warn).not.toBeCalled()
  })
})

it("does nothing when only `test` files were changed", () => {
  dm.danger.github = {
    utils: {
      fileContents: () => Promise.resolve("some changes")
    }
  }
  dm.danger.git = {
    modified_files: ["tests/AuctionCalculatorSpec.scala"],
    created_files: []
  }
  return rfc16().then(() => {
    expect(dm.warn).not.toBeCalled()
  })
})

it("does nothing when the changelog was changed", () => {
  dm.danger.github = {
    utils: {
      fileContents: () => Promise.resolve("some changes")
    }
  }
  dm.danger.git = {
    modified_files: ["src/index.html", "CHANGELOG.md"],
    created_files: []
  }
  return rfc16().then(() => {
    expect(dm.warn).not.toBeCalled()
  })
})
