const runtime: any = global

jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = (danger as any) as jest.Mock<any>

import { rfc5 } from "../org/all-prs"

it("fails when there's no PR body", async () => {
  dm.mockImplementationOnce(() => ({
    fail: jest.fn(),
    danger: { github: { pr: { body: "" } } },
    schedule: () => {},
  }))

  const a = await rfc5
  a.closure()

  expect(fail).toHaveBeenCalledWith("Please add a description to your PR.")
})

it("does nothing when there's a PR body", async () => {
  dm.mockImplementationOnce(() => ({
    fail: jest.fn(),
    danger: { github: { pr: { body: "Hello world" } } },
    schedule: () => {},
  }))

  const a = await rfc5
  a.closure()

  expect(fail).not.toBeCalled()
})
