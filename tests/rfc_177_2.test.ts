jest.mock("danger", () => ({
  peril: { runTask: jest.fn() },
  danger: jest.fn(),
}))
import { peril, danger } from "danger"

const dm = danger as any

import { rfc177_2 } from "../org/addReviewer"

beforeEach(() => {
  dm.danger = {}
})

afterEach(() => {
  // @ts-ignore
  peril.runTask.mockReset()
})
// Things I want to test:
// This test should be only for rfc177_2, not for prReviewReminder
// runTask is called with all users requested to review after with 1 day when it's not Friday/Saturday
// runTask is called with all users requested to review with 2 days when Saturday
// "" 3 days Friday
// calls nothing when there's no reviewers
// can I test that it gets called when someone new is asked to review the PR?
// gotta figure out how to test on a specific day...I could add it as a parameter for the func?

it("calls runTask and passes 1 day when called on a Sunday - Thurs on a single reviewer", async () => {
  dm.danger.github = {
    requested_reviewers: { users: ["mdole"] },
  }
  await rfc177_2()
  // How do I check that it's being called with a full GitHubUser object?
  expect(peril.runTask).toHaveBeenCalledWith("pr-review-reminder", "in 1 day", dm.danger.github.pr.reviewers[0])
})

it("calls runTask and passes 1 day when called on a Sunday - Thurs on multiple reviewers", async () => {
  dm.danger.github = {
    requested_reviewers: { users: ["mdole", "user"] },
  }
  await rfc177_2()
  expect(peril.runTask).toHaveBeenCalledWith("pr-review-reminder", "in 1 day", dm.danger.github.pr.reviewers[0])
  expect(peril.runTask).toHaveBeenCalledWith("pr-review-reminder", "in 1 day", dm.danger.github.pr.reviewers[1])
})
