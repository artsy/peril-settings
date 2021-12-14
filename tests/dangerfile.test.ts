jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import rule from "../dangerfile"

beforeEach(() => {
  dm.warn = jest.fn()
})

it("warns on rule change", async () => {
  dm.danger = { git: { JSONDiffForFile: () => Promise.resolve({ rules: "not-empty" }) } }
  await rule()
  expect(dm.warn).toHaveBeenCalledWith(
    "New rules detected, you probably need to update [this document](https://github.com/artsy/README/blob/main/culture/peril.md)."
  )
})

it("warns on scheduler change", async () => {
  dm.danger = { git: { JSONDiffForFile: () => Promise.resolve({ scheduler: "not-empty" }) } }
  await rule()
  expect(dm.warn).toHaveBeenCalledWith(
    "New rules detected, you probably need to update [this document](https://github.com/artsy/README/blob/main/culture/peril.md)."
  )
})

it("has nothing to say in absence of rules or scheduler changes", async () => {
  dm.danger = { git: { JSONDiffForFile: () => Promise.resolve({ something_else: "foobar" }) } }
  await rule()
  expect(dm.warn).not.toHaveBeenCalled()
})
