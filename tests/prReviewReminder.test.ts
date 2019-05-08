jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import prReviewReminder from "../tasks/prReviewReminder"

beforeEach(() => {
  dm.danger = {
    github: {
      api: {
        pulls: {
          listReviews: jest.fn().mockReturnValue({
            data: [
              {
                user: {
                  login: "mdole",
                },
              },
            ],
          }),
          get: jest.fn().mockReturnValue({
            data: {
              requested_reviewers: [
                {
                  login: "artsy",
                },
              ],
              state: "open",
            },
          }),
        },
        issues: {
          createComment: jest.fn(),
        },
      },
    },
  }
})

describe("reviewer checks", () => {
  it("adds a comment to the PR when only one reviewer has been requested and a review by that user is not present", async () => {
    const createComment = dm.danger.github.api.issues.createComment

    const metadata = {
      repoName: "artsy",
      prNumber: 1,
      requestedReviewer: "artsy",
      owner: "artsy",
    }

    await prReviewReminder(metadata)
    expect(createComment).toHaveBeenCalledWith(
      expect.objectContaining({
        body: "@artsy it's been a full business day since your review was requested!\nPlease add your review.",
      })
    )
  })

  it("adds a comment to one reviewer when two reviewers are specified but one has already left a review", async () => {
    const createComment = dm.danger.github.api.issues.createComment
    const metadata = {
      repoName: "artsy",
      prNumber: 1,
      requestedReviewer: "artsy",
      owner: "artsy",
    }

    dm.danger.github.api.pulls.get = jest.fn().mockReturnValue({
      data: {
        requested_reviewers: [
          {
            login: "mdole",
          },
          {
            login: "artsy",
          },
        ],
        state: "open",
      },
    })
    await prReviewReminder(metadata)
    expect(createComment).toHaveBeenCalledTimes(1)
    expect(createComment).toHaveBeenCalledWith(
      expect.objectContaining({
        body: "@artsy it's been a full business day since your review was requested!\nPlease add your review.",
      })
    )
  })

  it("does not add a comment when reviewer has already reviewed", async () => {
    const createComment = dm.danger.github.api.issues.createComment
    const metadata = {
      repoName: "artsy",
      prNumber: 1,
      requestedReviewer: "artsy",
      owner: "artsy",
    }

    dm.danger.github.api.pulls = {
      get: jest.fn().mockReturnValue({
        data: {
          requested_reviewers: [
            {
              login: "mdole",
            },
            {
              login: "artsy",
            },
          ],
          state: "open",
        },
      }),
      listReviews: jest.fn().mockReturnValue({
        data: [
          {
            user: {
              login: "artsy",
            },
          },
        ],
      }),
    }

    await prReviewReminder(metadata)
    expect(createComment).not.toHaveBeenCalled()
  })
  it("does not add a comment when pr is closed", async () => {
    const createComment = dm.danger.github.api.issues.createComment
    const metadata = {
      repoName: "artsy",
      prNumber: 1,
      requestedReviewer: "artsy",
      owner: "artsy",
    }

    dm.danger.github.api.pulls.get = jest.fn().mockReturnValue({
      data: {
        requested_reviewers: [
          {
            login: "mdole",
          },
          {
            login: "artsy",
          },
        ],
        state: "closed",
      },
    })
    await prReviewReminder(metadata)
    expect(createComment).not.toHaveBeenCalled()
  })
})
