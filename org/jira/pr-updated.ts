import { danger } from "danger"
import { PullRequest } from "github-webhook-event-types"
import JiraApi from "jira-client"

const companyPrefix = "artsyproduct"

// https://stackoverflow.com/questions/19322669/regular-expression-for-a-jira-identifier#30518972
const jiraTicketRegex = /\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g
const urlSuffix = `.atlassian.net\/browse\/\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g`
const jiraURLRegex = new RegExp("https://" + companyPrefix + urlSuffix)

export default async (webhook: PullRequest) => {
  const prBody = danger.github.pr.body

  const tickets = getJiraTicketIDsFromText(prBody)
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
    } catch (err) {
      console.error(`Had an issue getting ${ticketID}`)
      console.error(err)
    }
  })
}

export const getJiraTicketIDsFromText = (body: string) => {
  // Look for jira ticket references like PLAT-123
  const shorthandReferences = reverse(body).match(jiraTicketRegex)
  const urlReferences = body.match(jiraURLRegex)

  return [
    ...((shorthandReferences && shorthandReferences.map(id => reverse(id))) || []),
    ...(urlReferences || []),
  ].reverse()
}

const reverse = (str: string) =>
  Array.from(str)
    .reverse()
    .join("")
