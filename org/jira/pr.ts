// This is RFC 74

const companyPrefix = "artsyproduct"
const wipLabels = ["in review", "in progress"]
const mergedLabels = ["merged", "monitor/qa"]

import { danger } from "danger"
import { PullRequest } from "github-webhook-event-types"
import * as JiraApi from "jira-client"

export default async (webhook: PullRequest) => {
  // Grab some util functions for Jira manipulation
  const { getJiraTicketIDsFromCommits, getJiraTicketIDsFromText, uniq, makeJiraTransition } = await import("./utils")
  const prBody = danger.github.pr.body

  // Grab tickets from the PR body, and the commit messages
  const tickets = uniq([...getJiraTicketIDsFromText(prBody), ...getJiraTicketIDsFromCommits(danger.git.commits)])

  // Bail if we have no work to do
  if (!tickets.length) {
    console.log("No Jira ticket references found")
    return
  }

  // Figure out what we want to move it to
  const labelsToLookFor = danger.github.pr.merged ? mergedLabels : wipLabels

  // We know we have something to work with now
  const jira: JiraApi.default = new (JiraApi as any)({
    protocol: "https",
    host: `${companyPrefix}.atlassian.net`,
    apiVersion: "2",
    strictSSL: true,
    username: process.env.JIRA_EMAIL,
    password: process.env.JIRA_ACCESS_TOKEN,
  })

  tickets.forEach(async ticketID => {
    try {
      // So we have ticket references, will need to check each ticket
      // for whether it's in the right state.
      //
      // https://developer.atlassian.com/cloud/jira/platform/rest/#api-api-2-issue-issueIdOrKey-get

      const issue = await jira.findIssue(ticketID)
      console.log(`issue: ${JSON.stringify(issue)}`)

      // Bail if already set to what we want
      if (labelsToLookFor.includes(issue.status.name.toLowerCase())) {
        console.log("The issue is already set")
        return
      }

      // Get all the potential statuses, see if any are in our list
      const statuses = await jira.getDevStatusSummary(ticketID)
      console.log("Found potential statuses: " + statuses.join(", "))
      const newStatus = statuses.transitions.find((t: any) => labelsToLookFor.includes(t.name.toLowerCase()))

      // Switch to the new status, e.g. Ready - and leave a comment
      const type = danger.github.pr.merged ? "submitted" : "merged"
      const message = `PR has been ${type}: ${(danger.github.pr as any).html_url}`

      console.log(`Converting ${ticketID} to ${newStatus}`)
      await jira.transitionIssue(ticketID, makeJiraTransition(message, newStatus))
    } catch (err) {
      console.log(`Had an issue changing the status of ${ticketID}`)
      console.log(err)
    }
  })

  // Let's people know that Peril's done some work
  await danger.github.utils.createOrAddLabel(
    {
      name: "Jira Synced",
      color: "0366d6",
      description: "Indicates that Peril has connected this PR to Jira",
    },
    {
      owner: danger.github.pr.base.repo.owner.login,
      repo: danger.github.pr.base.repo.name,
      id: danger.github.pr.number,
    }
  )
}
