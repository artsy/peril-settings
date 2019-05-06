jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import prReviewReminder from "../tasks/prReviewReminder"

beforeEach(() => {
  dm.danger = {
    github: {
      api: {
        issues: {
          createComment: jest.fn(),
        },
      },
    },
  }
})

describe("reviewer checks", () => {
  it("adds a comment to the PR when a review by the reviewer is not present", async () => {
    const createComment = dm.danger.github.api.issues.createComment

    //TODO: flesh this out
    await prReviewReminder(expect.objectContaining({ owner: "artsy" })).then(() => {
      // TODO: flesh this out
      expect(createComment).toHaveBeenCalledWith()
    })
  })

  it("does not add a comment when reviewer has already reviewed", async () => {})

  it("does not add a comment to the PR when it has already added a comment to this reviewer", async () => {})

  it("adds a comment to one reviewer when two reviewers are specified but one has already left a review", async () => {})
})
