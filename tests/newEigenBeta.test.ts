jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

const mockJiraAddComment = jest.fn()
jest.mock("jira-client", () =>
  jest.fn().mockImplementation(() => ({
    addComment: mockJiraAddComment,
  }))
)

import subject from "../org/newEigenBeta"
import { Create } from "github-webhook-event-types"

let mockGetTags: jest.Mock
let mockCompareCommits: jest.Mock
let mockGetPullRequests: jest.Mock
describe(subject, () => {
  beforeEach(() => {
    mockJiraAddComment.mockReset()
    dm.danger = {
      github: {
        api: {
          repos: {
            getTags: jest.fn(),
            compareCommits: jest.fn(),
          },
          pullRequests: {
            get: jest.fn(),
          },
        },
      },
    }
    mockGetTags = dm.danger.github.api.repos.getTags as any
    mockCompareCommits = dm.danger.github.api.repos.compareCommits as any
    mockGetPullRequests = dm.danger.github.api.pullRequests.get as any

    console.log = jest.fn() // To silence test subject.
  })

  it("skips non-tag refs", async () => {
    await subject(({ ref_type: "branch" } as any) as Create)
    expect(dm.danger.github.api.repos.getTags).not.toHaveBeenCalled()
  })

  it("skips when there is no previous release", async () => {
    mockGetTags.mockResolvedValue({
      data: [
        {
          name: "1.1.0",
        },
      ],
    })
    await subject(mockCreate)
    expect(dm.danger.github.api.repos.compareCommits).not.toHaveBeenCalled()
  })

  describe("with a previous release", () => {
    beforeEach(() => {
      mockGetTags.mockResolvedValue({
        data: [{ name: "1.0.0" }, { name: "1.1.0" }],
      })
    })

    it("comments based on ticket references in commit messages", async () => {
      mockCompareCommits.mockResolvedValue({
        data: {
          commits: [{ commit: { message: "Fixes GROW-123 ticket." } }],
        },
      })
      await subject(mockCreate)
      expect(mockJiraAddComment).toHaveBeenCalledWith("GROW-123", expect.stringContaining("1.1.0"))
    })

    it("comments based on ticket references in PR body", async () => {
      mockCompareCommits.mockResolvedValue({
        data: {
          commits: [{ commit: { message: "Merge pull request #1" } }],
        },
      })
      mockGetPullRequests.mockResolvedValue({
        data: {
          body: "This is a ticket for GROW-123.",
        },
      })
      await subject(mockCreate)
      expect(mockJiraAddComment).toHaveBeenCalledWith("GROW-123", expect.stringContaining("1.1.0"))
    })
  })
})

const mockCreate = {
  ref_type: "tag",
  ref: "1.1.0",
  repository: {
    owner: { login: "artsy" },
    name: "eigen",
  },
} as Create
