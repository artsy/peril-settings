jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = (danger as any)

import { rfc5 } from "../org/all-prs"

beforeEach(() => {
  dm.fail = jest.fn()
  dm.schedule = () => { }
})

afterEach(() => {
  dm.fail = undefined
  dm.schedule = undefined
})

it("fails when there's no PR body", () => {
  dm.danger = { github: { pr: { body: "" } } }
  return rfc5().then(() => {
    expect(dm.fail).toHaveBeenCalledWith("Please add a description to your PR.")
  })
})

it("does nothing when there's a PR body", () => {
  dm.danger = { github: { pr: { body: "Hello world" } } }
  return rfc5().then(() => {
    expect(dm.fail).not.toHaveBeenCalled()
  })
})
