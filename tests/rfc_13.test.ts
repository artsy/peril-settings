jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import { rfc13 } from "../org/allPRs"

beforeEach(() => {
  dm.danger = {}
  dm.warn = jest.fn()
})

it("warns when there's no assignee and no WIP in the title", async () => {
  // When the check membership API call does not raise
  const api = { orgs: { checkMembership: () => {} } }
  dm.danger.github = { pr: { title: "My Thing", assignee: null, user: { login: "someone" } }, api }
  await rfc13()
  expect(dm.warn).toHaveBeenCalledWith(
    "Please assign someone to merge this PR, and optionally include people who should review."
  )
})

it("does not warns when someone does not have access to the org", async () => {
  // When the check membership API call does not raise
  const api = {
    orgs: {
      checkMembership: () => {
        throw new Error()
      },
    },
  }
  dm.danger.github = { pr: { title: "My Thing", assignee: null, user: { login: "someone" } }, api }
  await rfc13()
  expect(dm.warn).not.toBeCalled()
})

it("does not warn when there's there's no assignee and WIP in the title", async () => {
  dm.danger.github = { pr: { title: "[WIP] My thing", assignee: null, user: { login: "someone" } } }
  await rfc13()
  expect(dm.warn).not.toBeCalled()
})

it("does not warn when there's there's an assignee", async () => {
  dm.danger.github = { pr: { title: "My thing", assignee: {}, user: { login: "someone" } } }
  await rfc13()
  expect(dm.warn).not.toBeCalled()
})

it("does not warn when the PR is created by renovate", async () => {
  dm.danger.github = { pr: { title: "My thing", assignee: null, user: { login: "renovate" } } }
  await rfc13()
  expect(dm.warn).not.toBeCalled()
})
