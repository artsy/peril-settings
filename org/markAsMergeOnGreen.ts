import { danger } from "danger"
import { IssueComment } from "github-webhook-event-types"

// The shape of a label
interface Label {
  id: number
  url: string
  name: string
  description: string
  color: string
  default: boolean
}

/** If a comment to an issue contains "Merge on Green", apply a label for it to be merged when green. */
export const rfc10 = async (issueComment: IssueComment) => {
  const issue = issueComment.issue
  const comment = issueComment.comment
  const api = danger.github.api

  // Only look at PR issue comments, this isn't in the type system
  if (!(issue as any).pull_request) {
    return console.log("Not a Pull Request")
  }

  // Don't do any work unless we have to
  const keywords = ["merge on green", "merge on ci green"]
  const match = keywords.find(k => comment.body.toLowerCase().includes(k))
  if (!match) {
    return console.log(`Did not find any of the merging phrases in the comment.`)
  }

  // Check to see if the label has already been set
  if (issue.labels.find(l => l.name === "Merge On Green")) {
    return console.log("Already has Merge on Green")
  }

  const sender = comment.user
  const username = sender.login
  const org = issueComment.repository.owner.login

  // Check for org access, so that some rando doesn't
  // try to merge something without permission
  try {
    await api.orgs.checkMembership({ org, username })
  } catch (error) {
    // Someone does not have permission to force a merge
    return console.log("Sender does not have permission to merge")
  }

  // Let's people know that it will be merged
  const label = {
    name: "Merge On Green",
    color: "247A38",
    description: "A label to indicate that Peril should merge this PR when all statuses are green",
  }
  const repo = {
    owner: org,
    repo: issueComment.repository.name,
    id: issue.number,
  }

  console.log("Adding the label:", repo)
  await danger.github.utils.createOrAddLabel(label, repo)
  console.log("Updated the PR with a Merge on Green label")
}

export default rfc10
