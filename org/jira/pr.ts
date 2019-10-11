// This is RFC 74

const companyPrefix = "artsyproduct"
const wipLabels = ["in review", "in progress", "review"]
const mergedLabels = ["merged", "monitor/qa", "monitoring/qa"]
const ignoredStatuses = ["done"]

import { danger, peril } from "danger"
import { PullRequest } from "github-webhook-event-types"
import * as JiraApi from "jira-client"

import * as IssueJSON from "../../fixtures/jira_issue_example.json"
type Issue = typeof IssueJSON

import * as TransitionsJSON from "../../fixtures/jira_examples_transitions.json"
type Transition = typeof TransitionsJSON

const { sentence } = danger.utils

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

  // We know we have something to work with now
  const jira: JiraApi.default = new (JiraApi as any)({
    protocol: "https",
    host: `${companyPrefix}.atlassian.net`,
    apiVersion: "2",
    strictSSL: true,
    username: peril.env.JIRA_EMAIL,
    password: peril.env.JIRA_ACCESS_TOKEN,
  })

  console.log(`Looking at ${sentence(tickets)}.`)
  tickets.forEach(async ticketID => {
    try {
      // So we have ticket references, will need to check each ticket
      // for whether it's in the right state.
      //
      // https://developer.atlassian.com/cloud/jira/platform/rest/#api-api-2-issue-issueIdOrKey-get

      const issue: Issue = (await jira.findIssue(ticketID)) as any

      const currentStatusName = issue.fields.status.name

      if (ignoredStatuses.includes(currentStatusName.toLowerCase())) {
        // This Jira ticket is already in status that we don't want to move
        console.log(`Ignored moving ${issue.key}, its in ${currentStatusName}`)
        return
      }

      // Figure out what we want to move it to
      const labelsToLookFor = danger.github.pr.merged ? mergedLabels : wipLabels

      // Get all the potential statuses, see if any are in our list
      const transitions: Transition = (await jira.listTransitions(issue.id)) as any
      console.log(`Found: ${sentence(transitions.transitions.map(t => t.name))}`)

      const newStatus = transitions.transitions.find(t => labelsToLookFor.includes(t.name.toLowerCase()))
      const currentStatus = transitions.transitions.find(t => issue.fields.status.name === t.name)
      if (!newStatus) {
        const labels = sentence(labelsToLookFor)
        console.log(`Could not find a transition status with one of these names: ${labels}`)
        return
      }

      if (!currentStatus) {
        const status = issue.fields.status.name
        const foundTransitions = sentence(transitions.transitions.map(t => t.name))
        console.log(`Could not find a transition status for the current status: ${status}, found ${foundTransitions}`)
        return
      }

      // Get the order of their indexes, our status options usually look like
      // Define, Ready, In Progress, Merged, Monitoring/QA, Done, Closed and In Review
      //
      const newStatusOrder = transitions.transitions.indexOf(newStatus)
      const currentStatusOrder = transitions.transitions.indexOf(currentStatus)

      if (newStatusOrder <= currentStatusOrder) {
        console.log(`Skipping making a transition because issue is already at the same state or further along`)
        return
      }

      // Switch to the new status, e.g. Ready - and leave a comment
      const type = danger.github.pr.merged ? "merged" : "submitted"
      const message = `PR has been ${type}: ${(danger.github.pr as any).html_url}`
      console.log(`Converting ${ticketID} to ${newStatus.name}`)
      await jira.transitionIssue(issue.id, makeJiraTransition(message, newStatus))

      console.log("Leaving a comment")
      await jira.addComment(issue.id, message)
    } catch (err) {
      console.log(`Had an issue changing the status of ${ticketID}`)
      console.log(err.message)
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
