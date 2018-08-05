// This is RFC 74

import { danger } from "danger"
import { PullRequest } from "github-webhook-event-types"
import JiraApi from "jira-client"

const companyPrefix = "artsyproduct"
const statusToUpdateTo = "In Progress"

// https://stackoverflow.com/questions/19322669/regular-expression-for-a-jira-identifier#30518972
const jiraTicketRegex = /\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g
const urlSuffix = `.atlassian.net\/browse\/\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g`
const jiraURLRegex = new RegExp("https://" + companyPrefix + urlSuffix)

export default async (webhook: PullRequest) => {
  // Grab some util functions for Jira manipulation
  const { getJiraTicketIDsFromCommits, getJiraTicketIDsFromText, uniq, makeJiraTransition } = await import("./utils")
  const prBody = danger.github.pr.body

  // Grab tickets from the PR body, and the commit messages
  const tickets = uniq([...getJiraTicketIDsFromText(prBody), ...getJiraTicketIDsFromCommits(danger.git.commits)])

  if (!tickets.length) {
    return
  }

  // So we have ticket references, will need to check each ticket
  // for whether it's in the right state.

  const jira = new JiraApi({
    protocol: "https",
    host: `https://${companyPrefix}.atlassian.net`,
    apiVersion: "2",
    strictSSL: true,
  })

  tickets.forEach(async ticketID => {
    try {
      // https://developer.atlassian.com/cloud/jira/platform/rest/#api-api-2-issue-issueIdOrKey-get
      const issue = await jira.findIssue(ticketID)
      console.log(`Status: ${issue.fields.status.name}`)
      console.log(`Type: ${issue.fields.status.name}`)

      // Bail if already set
      if (issue.status.name === statusToUpdateTo) {
        return
      }

      // Get all the potential statuses
      const statuses = await jira.getDevStatusSummary(ticketID)
      const newStatus = statuses.transitions.find((t: any) => t.name === statusToUpdateTo)

      // Switch to the new status, e.g. Ready - and leave a comment
      const message = `PR been submitted: ${(danger.github.pr as any).html_url}`
      await jira.transitionIssue(ticketID, makeJiraTransition(message, newStatus))
    } catch (err) {
      console.error(`Had an issue changing the status of ${ticketID}`)
      console.error(err)
    }
  })
}
