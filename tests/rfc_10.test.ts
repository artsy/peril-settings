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
        pulls: {
          merge: jest.fn(),
        },
        orgs: {
          checkMembership: jest.fn(),
        },
      },
      utils: {
        createOrAddLabel: jest.fn(),
      },
    },
  }
  ;(global as any).console = {
    log: jest.fn(),
  }
})

const repo = { repository: { owner: { login: "danger" } } }

describe("for adding the label", () => {
  describe("in response to an issue comment", () => {
    it("bails when the comment is not on a pr", async () => {
      await markAsMergeOnGreen({
        comment: { body: "Hi", user: { login: "danger" } },
        issue: {},
        ...repo,
      } as any)
      expect(console.log).toBeCalledWith("Not a Pull Request")
    })

    it("bails when the issue body doesn't contain the key words", async () => {
      await markAsMergeOnGreen({
        comment: { body: "Hi", user: { login: "danger" } },
        issue: { pull_request: {} },
        ...repo,
      } as any)

      expect(console.log).toBeCalledWith(expect.stringMatching("Did not find"))
    })

    it("bails when the issue already has merge on green", async () => {
      await markAsMergeOnGreen({
        comment: { body: "#mergeongreen", user: { login: "danger" } },
        issue: { labels: [{ name: "Merge On Green" }], pull_request: {} },
        ...repo,
      } as any)
      expect(console.log).toBeCalledWith("Already has Merge on Green-type label")
    })

    it("bails when the issue already has merge on green", async () => {
      await markAsMergeOnGreen({
        comment: { body: "#squashongreen", user: { login: "danger" } },
        issue: { labels: [{ name: "Squash On Green" }], pull_request: {} },
        ...repo,
      } as any)
      expect(console.log).toBeCalledWith("Already has Merge on Green-type label")
    })
  })

  describe("in response to a review", () => {
    const pull_request = { number: 1 }

    it("bails when the issue body doesn't contain the key words", async () => {
      dm.danger.github.api.issues.get.mockReturnValueOnce(Promise.resolve({ data: { labels: [] } }))

      await markAsMergeOnGreen({
        review: { body: "Hi", user: { login: "danger" } },
        pull_request: pull_request,
        ...repo,
      } as any)

      expect(console.log).toBeCalledWith(expect.stringMatching("Did not find"))
    })

    it("bails when the issue already has merge on green", async () => {
      dm.danger.github.api.issues.get.mockReturnValueOnce(
        Promise.resolve({ data: { labels: [{ name: "Merge On Green" }] } })
      )

      await markAsMergeOnGreen({
        review: { body: "Looks great! #MergeOnGreen", user: { login: "danger" } },
        pull_request: pull_request,
        ...repo,
      } as any)
      expect(console.log).toBeCalledWith("Already has Merge on Green-type label")
    })
  })

  it("creates the label when the label doesn't exist on the repo", async () => {
    dm.danger.github.api.orgs.checkMembership.mockReturnValueOnce(Promise.resolve({ data: {} }))
    dm.danger.github.api.issues.getLabels.mockReturnValueOnce(Promise.resolve({ data: [] }))

    await markAsMergeOnGreen({
      comment: {
        body: "#squashongreen",
        user: { sender: { login: "orta" } },
      },
      issue: { labels: [], pull_request: {} },
      ...repo,
    } as any)

    expect(dm.danger.github.utils.createOrAddLabel).toBeCalled()
  })

  it("creates the label when the label doesn't exist on the repo", async () => {
    dm.danger.github.api.orgs.checkMembership.mockReturnValueOnce(Promise.resolve({ data: {} }))
    dm.danger.github.api.issues.getLabels.mockReturnValueOnce(Promise.resolve({ data: [] }))

    await markAsMergeOnGreen({
      comment: {
        body: "#mergeongreen",
        user: { sender: { login: "orta" } },
      },
      issue: { labels: [], pull_request: {} },
      ...repo,
    } as any)

    expect(dm.danger.github.utils.createOrAddLabel).toBeCalled()
  })
})

describe("for handling merging when green", () => {
  it("bails when its not a success", async () => {
    await mergeOnGreen({ state: "fail" } as any)
    expect(console.log).toBeCalled()
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

    expect(console.log).toBeCalledWith("Not all statuses are green")
  })

  it("does nothing when the PR does not have merge on green", async () => {
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

    expect(console.log).toBeCalledWith("PR does not have Merge on Green-type label")
  })

  it("triggers a PR merge when there is a Merge on Green label", async () => {
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

    expect(dm.danger.github.api.pulls.merge).toBeCalledWith({
      commit_title: "Merge pull request #1 by Peril",
      number: 1,
      owner: "danger",
      repo: "doggo",
      merge_method: "merge",
    })
  })

  it("triggers a PR squash when there is a Squash on Green label", async () => {
    // Has the right status
    dm.danger.github.api.repos.getCombinedStatusForRef.mockReturnValueOnce(
      Promise.resolve({ data: { state: "success" } })
    )

    // Gets a corresponding issue
    dm.danger.github.api.search.issues.mockReturnValueOnce(Promise.resolve({ data: { items: [{ number: 1 }] } }))

    // Returns an issue without the merge on green label
    dm.danger.github.api.issues.get.mockReturnValueOnce(
      Promise.resolve({ data: { labels: [{ name: "Squash On Green" }] } })
    )

    await mergeOnGreen({
      state: "success",
      repository: { owner: { login: "danger" }, name: "doggo" },
      commit: { sha: "123abc" },
    } as any)

    expect(dm.danger.github.api.pulls.merge).toBeCalledWith({
      commit_title: "Squash pull request #1 by Peril",
      number: 1,
      owner: "danger",
      repo: "doggo",
      merge_method: "squash",
    })
  })
})
