jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import closedSourceRationaleCheck, {
  artsyOrg,
  issueContent,
  issueTitle,
  targetText,
} from "../tasks/closedSourceRationaleCheck"

beforeEach(() => {
  dm.danger = {
    github: {
      api: {
        repos: {
          getForOrg: jest.fn(),
        },
      },
      utils: {
        createUpdatedIssueWithID: jest.fn(),
        fileContents: jest.fn(),
      },
    },
  }
})

describe("rationale checks", () => {
  it("creates an issue when a private repo does not include a rationale", async () => {
    const readme = "No rationale here!"

    const repo = { name: "private-repo" }

    dm.danger.github.api.repos.getForOrg = () => Promise.resolve({ data: [repo] })

    const createUpdatedIssueWithID = dm.danger.github.utils.createUpdatedIssueWithID
    dm.danger.github.utils.fileContents = () => Promise.resolve(readme)

    await closedSourceRationaleCheck().then(() => {
      expect(createUpdatedIssueWithID).toHaveBeenCalledWith(repo.name, issueContent, {
        open: true,
        owner: artsyOrg,
        repo: repo.name,
        title: issueTitle,
      })
    })
  })

  it("does nothing when a private repo includes a rationale", async () => {
    const readme = `blah blah ${targetText} blah`

    const repo = { name: "private-repo" }

    dm.danger.github.api.repos.getForOrg = () => Promise.resolve({ data: [repo] })
    dm.danger.github.utils.fileContents = () => Promise.resolve(readme)

    const createUpdatedIssueWithID = dm.danger.github.utils.createUpdatedIssueWithID

    await closedSourceRationaleCheck().then(() => {
      expect(createUpdatedIssueWithID).not.toHaveBeenCalled()
    })
  })
})
