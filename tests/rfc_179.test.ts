jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import { rfc179 } from "../org/allPRs"

jest.spyOn(console, "log").mockImplementation()

const warnMock = jest.fn()
beforeEach(() => {
  dm.danger = {}
  dm.warn = warnMock
  console.log = jest.fn()
})

describe("RFC: 179", () => {
  it("bails when it's not running on eigen", () => {
    dm.danger.github = { pr: { base: { repo: { name: "force" } } } }
    rfc179()
    expect(console.log).toHaveBeenCalledWith("Skipping this check because the active repo is not Eigen")
  })

  it("bails when the PR is not open", () => {
    dm.danger.github = { pr: { base: { repo: { name: "eigen" } }, state: "closed" } }
    rfc179()
    expect(console.log).toHaveBeenCalledWith("Skipping this check because the PR is not open")

    dm.danger.github = { pr: { base: { repo: { name: "eigen" } }, state: "locked" } }
    rfc179()
    expect(console.log).toHaveBeenCalledWith("Skipping this check because the PR is not open")

    dm.danger.github = { pr: { base: { repo: { name: "eigen" } }, state: "merged" } }
    rfc179()
    expect(console.log).toHaveBeenCalledWith("Skipping this check because the PR is not open")
  })

  it("warns the author when the PR body is invalid", () => {
    dm.danger.github = { pr: { body: "invalid body", base: { repo: { name: "eigen" } }, state: "open" } }
    rfc179()
    expect(dm.warn).toHaveBeenCalledWith(
      "❌ **An error occurred while validating your changelog, please make sure you provided a valid changelog.**"
    )
  })

  it("warns the author when no changelog changes were detected", () => {
    dm.danger.github = { pr: { body: "#nochangelog", base: { repo: { name: "eigen" } }, state: "open" } }
    rfc179()
    expect(dm.warn).toHaveBeenCalledWith("✅ **No changelog changes**")
  })
})