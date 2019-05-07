jest.mock("danger", () => ({
  peril: { runTask: jest.fn() },
  danger: jest.fn(),
}))
import { peril, danger } from "danger"
const dm = danger as any
const pm = peril as any

import { scheduleReviewReminders, rfc177_2 } from "../org/addReviewer"

beforeEach(() => {
  dm.github = {
    pr: {
      number: 10,
      base: {
        repo: {
          name: "exampleRepo",
          owner: {
            login: "artsy",
          },
        },
      },
    },
  }
})

afterEach(() => {
  // @ts-ignore
  peril.runTask.mockReset()
})

describe("scheduling reminder tasks", () => {
  it("calls runTask in 1 day when called on Monday", () => {
    const monday = new Date(2019, 3, 29)
    scheduleReviewReminders(monday, "you")
    expect(pm.runTask).toBeCalledWith("pr-review-reminder", "in 1 day", expect.objectContaining({ reviewer: "you" }))
  })

  it("calls runTask in 2 days when called on Saturday", () => {
    const saturday = new Date(2019, 3, 27)
    scheduleReviewReminders(saturday, "your cat")
    expect(pm.runTask).toBeCalledWith(
      "pr-review-reminder",
      "in 2 days",
      expect.objectContaining({ reviewer: "your cat" })
    )
  })

  it("calls runTask in 3 days when called on Friday", () => {
    const friday = new Date(2019, 3, 26)
    scheduleReviewReminders(friday, "your dog")
    expect(pm.runTask).toBeCalledWith(
      "pr-review-reminder",
      "in 3 days",
      expect.objectContaining({ reviewer: "your dog" })
    )
  })

  it("doesn't call runTask without a reviewer", () => {
    const reviewEvent = {
      action: "review_requested",
      number: 1,
      pull_request: {} as any,
      repository: {} as any,
      sender: {} as any,
      requested_reviewer: undefined as any,
    }
    rfc177_2(reviewEvent)
    expect(pm.runTask).not.toBeCalled()
  })
})
