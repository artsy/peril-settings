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
    requested_reviewers: {
      users: [
        {
          login: "hello",
        },
        {
          login: "heyoo",
        },
      ],
    },
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
    scheduleReviewReminders(monday)
    expect(pm.runTask).toBeCalledWith(
      "pr-review-reminder",
      "in 1 day",
      expect.objectContaining({ repoName: "exampleRepo", prNumber: 10, owner: "artsy", reviewers: ["hello", "heyoo"] })
    )
  })

  it("calls runTask in 2 days when called on Saturday", () => {
    const saturday = new Date(2019, 3, 27)
    scheduleReviewReminders(saturday)
    expect(pm.runTask).toBeCalledWith(
      "pr-review-reminder",
      "in 2 days",
      expect.objectContaining({ repoName: "exampleRepo", prNumber: 10, owner: "artsy", reviewers: ["hello", "heyoo"] })
    )
  })

  it("calls runTask in 3 days when called on Friday", () => {
    const friday = new Date(2019, 3, 26)
    scheduleReviewReminders(friday)
    expect(pm.runTask).toBeCalledWith(
      "pr-review-reminder",
      "in 3 days",
      expect.objectContaining({ repoName: "exampleRepo", prNumber: 10, owner: "artsy", reviewers: ["hello", "heyoo"] })
    )
  })

  it("doesn't call runTask without reviewers", () => {
    dm.github.requested_reviewers.users = []
    rfc177_2()
    expect(pm.runTask).not.toBeCalled()
  })
})
