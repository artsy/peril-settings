jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import mergeOnGreen from "../org/mergeOnGreen"
import markAsMergeOnGreen from "../org/markAsMergeOnGreen"

beforeEach(() => {
  dm.danger = {
    github: {
      api: {
        repos: {
          getCombinedStatusForRef: jest.fn(),
        },
        search: {
          issues: jest.fn(),
        },
        issues: {
          get: jest.fn(),
          getLabels: jest.fn(),
          createLabel: jest.fn(),
          addLabels: jest.fn(),
        },
        pullRequests: {
          merge: jest.fn(),
        },
        orgs: {
          checkMembership: jest.fn(),
        },
      },
    },
  }
  ;(global as any).console = {
    error: jest.fn(),
    log: jest.fn(),
  }
})

describe("for adding the label", () => {
  it("bails when the comment is not on a pr", async () => {
    await markAsMergeOnGreen({ issue: {} } as any)
    expect(console.error).toBeCalledWith("Not a Pull Request")
  })

  it("bails when the issue body doesn't contain the key words", async () => {
    await markAsMergeOnGreen({ comment: { body: "Hi" }, issue: { pull_request: {} } } as any)
    expect(console.error).toBeCalledWith(expect.stringMatching("Did not find"))
  })

  it("bails when the issue already has merge on green", async () => {
    await markAsMergeOnGreen({
      comment: { body: "Merge on green" },
      issue: { labels: [{ name: "Merge On Green" }], pull_request: {} },
    } as any)
    expect(console.error).toBeCalledWith("Already has Merge on Green")
  })

  it("creates the label when the label doesn't exist on the repo", async () => {
    dm.danger.github.api.orgs.checkMembership.mockReturnValueOnce(Promise.resolve({ data: {} }))

    dm.danger.github.api.issues.getLabels.mockReturnValueOnce(Promise.resolve({ data: [] }))

    await markAsMergeOnGreen({
      comment: {
        body: "Merge on green",
        user: { sender: { login: "orta" } },
      },
      issue: { labels: [], pull_request: {} },
      repository: { owner: { login: "danger" } },
    } as any)

    expect(dm.danger.github.api.issues.createLabel).toBeCalled()
    expect(dm.danger.github.api.issues.addLabels).toBeCalled()
  })

  it("use the existing label when the label is on the repo", async () => {
    dm.danger.github.api.orgs.checkMembership.mockReturnValueOnce(Promise.resolve({ data: {} }))

    // When we ask for labels, it returns the the merge on green one
    dm.danger.github.api.issues.getLabels.mockReturnValueOnce(Promise.resolve({ data: [{ name: "Merge On Green" }] }))

    await markAsMergeOnGreen({
      comment: {
        body: "Merge on green",
        user: { sender: { login: "orta" } },
      },
      issue: { labels: [], pull_request: {} },
      repository: { owner: { login: "danger" } },
    } as any)

    expect(dm.danger.github.api.issues.createLabel).not.toBeCalled()
    expect(dm.danger.github.api.issues.addLabels).toBeCalled()
  })
})

describe("for handling merging when green", () => {
  it("bails when its not a success", async () => {
    await mergeOnGreen({ state: "fail" } as any)
    expect(console.error).toBeCalled()
  })

  it("bails when the whole status is not a success", async () => {
    dm.danger.github.api.repos.getCombinedStatusForRef.mockReturnValueOnce(
      Promise.resolve({ data: { state: "failed " } })
    )

    await mergeOnGreen({
      state: "success",
      repository: { owner: { login: "danger" }, name: "doggo" },
      commit: { sha: "123abc" },
    } as any)

    expect(console.error).toBeCalledWith("Not all statuses are green")
  })

  it("does nothing when the PR does not have merge on green ", async () => {
    // Has the right status
    dm.danger.github.api.repos.getCombinedStatusForRef.mockReturnValueOnce(
      Promise.resolve({ data: { state: "success" } })
    )

    // Gets a corresponding issue
    dm.danger.github.api.search.issues.mockReturnValueOnce(Promise.resolve({ data: { items: [{ number: 1 }] } }))

    // Returns an issue without the merge on green label
    dm.danger.github.api.issues.get.mockReturnValueOnce(
      Promise.resolve({ data: { labels: [{ name: "Dog Snoozer" }] } })
    )

    await mergeOnGreen({
      state: "success",
      repository: { owner: { login: "danger" }, name: "doggo" },
      commit: { sha: "123abc" },
    } as any)

    expect(console.error).toBeCalledWith("PR does not have Merge on Green")
  })

  it("triggers a PR merge when there is a merge on green label ", async () => {
    // Has the right status
    dm.danger.github.api.repos.getCombinedStatusForRef.mockReturnValueOnce(
      Promise.resolve({ data: { state: "success" } })
    )

    // Gets a corresponding issue
    dm.danger.github.api.search.issues.mockReturnValueOnce(Promise.resolve({ data: { items: [{ number: 1 }] } }))

    // Returns an issue without the merge on green label
    dm.danger.github.api.issues.get.mockReturnValueOnce(
      Promise.resolve({ data: { labels: [{ name: "Merge On Green" }] } })
    )

    await mergeOnGreen({
      state: "success",
      repository: { owner: { login: "danger" }, name: "doggo" },
      commit: { sha: "123abc" },
    } as any)

    expect(dm.danger.github.api.pullRequests.merge).toBeCalledWith({
      commit_title: "Merged by Peril",
      number: 1,
      owner: "danger",
      repo: "doggo",
    })
  })
})
