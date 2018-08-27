jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import { rfc13 } from "../org/allPRs"

beforeEach(() => {
  dm.danger = {}
  dm.warn = jest.fn()
})

it("warns when there's there's no assignee and no WIP in the title", () => {
  dm.danger.github = { pr: { title: "My Thing", assignee: null } }
  rfc13()
  expect(dm.warn).toHaveBeenCalledWith(
    "Please assign someone to merge this PR, and optionally include people who should review."
  )
})

it("does not warn when there's there's no assignee and WIP in the title", () => {
  dm.danger.github = { pr: { title: "[WIP] My thing", assignee: null } }
  rfc13()
  expect(dm.warn).not.toBeCalled()
})

it("does not warn when there's there's an assignee", () => {
  dm.danger.github = { pr: { title: "My thing", assignee: {} } }
  rfc13()
  expect(dm.warn).not.toBeCalled()
})
