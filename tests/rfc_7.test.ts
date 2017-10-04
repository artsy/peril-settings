jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import { rfc7 } from "../org/all-prs"

beforeEach(() => {
  dm.danger = {
    git: {},
    github: {
      api: {
        issues: {
          getLabels: jest.fn(),
          addLabels: jest.fn(),
        },
      },
      thisPR: {
        owner: "artsy",
        repo: "eigen",
        number: 1234,
      },
      issue: { labels: [] },
    },
  }
})

it("bails without commit labels", () => {
  dm.danger.git.commits = ["Implementing something", "Adding tests", "Changelog entry"].map(message => ({ message }))
  return rfc7().then(() => {
    expect(dm.danger.github.api.issues.getLabels).not.toHaveBeenCalled()
  })
})

describe("with commit labels", () => {
  beforeEach(() => {
    dm.danger.git.commits = [
      "[Auctions] Implementing something",
      "[Auctions] Adding tests",
      "[Oops] Changelog entry",
    ].map(message => ({ message }))
  })

  it("retrieves labels from the GitHub api", () => {
    dm.danger.github.api.issues.getLabels.mockImplementationOnce(() => ({ data: [] }))
    return rfc7().then(() => {
      expect(dm.danger.github.api.issues.getLabels).toHaveBeenCalledWith({
        owner: "artsy",
        repo: "eigen",
      })
    })
  })

  describe("with no matching GitHub labels", () => {
    it("does not add any labels", () => {
      dm.danger.github.api.issues.getLabels.mockImplementationOnce(() => ({
        data: [{ name: "wontfix" }, { name: "Messaging" }],
      }))
      return rfc7().then(() => {
        expect(dm.danger.github.api.issues.addLabels).not.toHaveBeenCalled()
      })
    })
  })

  describe("with matching GitHub labels", () => {
    it("adds GitHub labels that match commit labels", () => {
      dm.danger.github.api.issues.getLabels.mockImplementationOnce(() => ({
        data: [{ name: "wontfix" }, { name: "Messaging" }, { name: "Auctions" }],
      }))
      return rfc7().then(() => {
        expect(dm.danger.github.api.issues.addLabels).toHaveBeenCalledWith({
          owner: "artsy",
          repo: "eigen",
          number: 1234,
          labels: ["Auctions"],
        })
      })
    })

    it("doesn't add existing GitHub labels on the issue", async () => {
      dm.danger.github.issue.labels = [{ name: "Auctions" }]
      dm.danger.github.api.issues.getLabels.mockImplementationOnce(() => ({
        data: [{ name: "wontfix" }, { name: "Messaging" }, { name: "Auctions" }],
      }))

      return rfc7().then(() => {
        expect(dm.danger.github.api.issues.addLabels).not.toHaveBeenCalled()
      })
    })
  })
})
