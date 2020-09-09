import { danger } from "danger"
import { IssueComment, PullRequestReview } from "github-webhook-event-types"
import { IssueCommentIssue } from "github-webhook-event-types/source/IssueComment"

export const labelMap = {
  "#mergeongreen": {
    name: "Merge On Green",
    color: "247A38",
    description: "A label to indicate that Peril should merge this PR when all statuses are green",
    mergeMethod: "merge",
  },
  "#squashongreen": {
    name: "Squash On Green",
    color: "247A38",
    description: "A label to indicate that Peril should squash-merge this PR when all statuses are green",
    mergeMethod: "squash",
  },
} as const

/** If a comment to an issue contains "Merge on Green", apply a label for it to be merged when green. */
export const rfc10 = async (issueCommentOrPrReview: IssueComment | PullRequestReview) => {
  const api = danger.github.api
  const org = issueCommentOrPrReview.repository.owner.login

  let issue: IssueCommentIssue = null!
  let text: string = null!
  let userLogin: string = ""

  if ("issue" in issueCommentOrPrReview) {
    issue = issueCommentOrPrReview.issue
    text = issueCommentOrPrReview.comment.body
    userLogin = issueCommentOrPrReview.comment.user.login

    // Only look at PR issue comments, this isn't in the type system
    if (!(issue as any).pull_request) {
      return console.log("Not a Pull Request")
    }
  }

  if ("review" in issueCommentOrPrReview) {
    const repo = issueCommentOrPrReview.repository
    const response = await api.issues.get({
      owner: repo.owner.login,
      repo: repo.name,
      number: issueCommentOrPrReview.pull_request.number,
    })

    issue = response.data as any
    text = issueCommentOrPrReview.review.body
    userLogin = issueCommentOrPrReview.review.user.login
  }

  // Bail if there's no text from the review
  if (!text) {
    console.log("Could not find text for the webhook to look for the merge on green message")
    return
  }

  // Don't do any work unless we have to
  const keywords = Object.keys(labelMap)
  const match = keywords.find(k => text.toLowerCase().includes(k)) as keyof typeof labelMap | undefined
  if (!match) {
    return console.log(`Did not find any of the merging phrases in the comment beginning ${text.substring(0, 12)}.`)
  }

  const label = labelMap[match]

  // Check to see if the label has already been set
  if (issue.labels.find(l => l.name === label.name)) {
    return console.log("Already has Merge on Green-type label")
  }

  // Check for org access, so that some rando doesn't
  // try to merge something without permission
  try {
    if (userLogin !== org) {
      await api.orgs.checkMembership({ org, username: userLogin })
    }
  } catch (error) {
    // Someone does not have permission to force a merge
    return console.log("Sender does not have permission to merge")
  }

  const repo = {
    owner: org,
    repo: issueCommentOrPrReview.repository.name,
    id: issue.number,
  }

  console.log("Adding the label:", repo)
  await danger.github.utils.createOrAddLabel(label, repo)
  console.log("Updated the PR with a Merge on Green-type label")
}

export default rfc10
