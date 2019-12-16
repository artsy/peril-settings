import { flatten } from "lodash"

// https://stackoverflow.com/questions/19322669/regular-expression-for-a-jira-identifier#30518972
const jiraTicketRegex = /[\]\)](?<ticketID>\d+-[A-Z]+(?!-?[a-zA-Z]{1,10}))[\[\(]/g

export const getJiraTicketIDsFromText = (body: string) => {
  // Look for jira ticket references in brackets like (PLAT-123)
  const reverseBody = reverse(body)
  const shorthandReferences: string[] = []
  let match: RegExpExecArray | null
  while ((match = jiraTicketRegex.exec(reverseBody)) !== null) {
    if (match.groups) {
      shorthandReferences.push(match.groups.ticketID)
    }
  }
  return shorthandReferences.map(id => reverse(id)).reverse()
}

export const getJiraTicketIDsFromCommits = (commits: Array<{ message: string }>) => {
  const commitMessages = commits.map(m => m.message)
  return flatten(commitMessages.map(getJiraTicketIDsFromText))
}

export const makeJiraTransition = (comment: string, status: any) => ({
  update: {
    comment: [
      {
        add: {
          body: comment,
        },
      },
    ],
  },
  transition: {
    id: status.id,
  },
})

export const uniq = (a: any[]) => Array.from(new Set(a))

const reverse = (str: string) =>
  Array.from(str)
    .reverse()
    .join("")
