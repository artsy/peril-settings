jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import { rfc177 } from "../org/allPRs"

beforeEach(() => {
  dm.danger = {}
  dm.warn = jest.fn()
})

it("warns when more than one person is assigned to a PR", async () => {
  dm.danger.github = { pr: { title: "A PR with lots of assignees", assignees: ["mdole", "orta", "someotherpeeps"] } }
  await rfc177()
  expect(dm.warn).toHaveBeenCalledWith("Please only assign one person to a PR")
})

it("doesn't warn if one person is assigned to a PR", async () => {
  dm.danger.github = { pr: { title: "A PR with one assignee in an array", assignees: ["mdole"] } }
  await rfc177()
  expect(dm.warn).not.toHaveBeenCalled()
})

it("doesn't warn if one person is assigned to a PR (using assignee instead of assignees)", async () => {
  dm.danger.github = { pr: { title: "A PR with one solo assignee", assignee: "mdole" } }
  await rfc177()
  expect(dm.warn).not.toHaveBeenCalled()
})

it("doesn't warn if nobody is assigned to a pr", async () => {
  dm.danger.github = { pr: { title: "A PR with no assignees" } }
  await rfc177()
  expect(dm.warn).not.toHaveBeenCalled()
})
