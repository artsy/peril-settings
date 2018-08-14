const companyPrefix = "artsyproduct"

// https://stackoverflow.com/questions/19322669/regular-expression-for-a-jira-identifier#30518972
const jiraTicketRegex = /\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g
const urlSuffix = `.atlassian.net\/browse\/\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g`
const jiraURLRegex = new RegExp("https://" + companyPrefix + urlSuffix)

export const getJiraTicketIDsFromText = (body: string) => {
  // Look for jira ticket references like PLAT-123
  const shorthandReferences = reverse(body).match(jiraTicketRegex)
  const urlReferences = body.match(jiraURLRegex)

  return [
    ...((shorthandReferences && shorthandReferences.map(id => reverse(id))) || []),
    ...(urlReferences || []),
  ].reverse()
}

export const getJiraTicketIDsFromCommits = (commits: Array<{ message: string }>) => {
  const commitMessages = commits.map(m => m.message)
  var ids: string[] = []
  commitMessages.forEach(message => {
    const shorthandReferences = reverse(message).match(jiraTicketRegex)
    ids = [...ids, ...((shorthandReferences && shorthandReferences.map(id => reverse(id))) || [])]
  })
  return ids
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
