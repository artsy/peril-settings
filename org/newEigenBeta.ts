import { Create } from "github-webhook-event-types"
import { danger } from "danger"

import * as semverSort from "semver-sort"
import * as JiraApi from "jira-client"
import { flatten } from "lodash"

import * as IssueJSON from "../fixtures/jira_issue_example.json"
type Issue = typeof IssueJSON

const companyPrefix = "artsyproduct"

// Implementation borrowed from https://github.com/danger/peril-settings/blob/b306662628f1a4c5c4ebc5f0531e15561fe60fa5/org/new_tag.ts#L12-L64
export default async (create: Create) => {
  if (create.ref_type !== "tag") {
    return console.log("Skipping because it's not a tag")
  }
  const api = danger.github.api

  const tag = create.ref
  const thisRepo = { owner: create.repository.owner.login, repo: create.repository.name }

  // Grab all tags, should be latest ~20
  const allTagsResponse = await api.repos.getTags(thisRepo)
  const allTags: Tag[] = allTagsResponse.data

  // Sort the tags in semver, so we can know specifically what range to
  // work out the commits
  const semverStrings: string[] = semverSort.desc(allTags.map(tag => tag.name))
  const versionIndex = semverStrings.findIndex(version => version === tag)
  const releaseMinusOne = semverStrings[versionIndex + 1]

  // Bail if we can't find a release
  if (!releaseMinusOne) {
    return console.log(`Couldn't locate release for ${tag} tag.`)
  }
  // Ask for the commits
  const compareResults = await api.repos.compareCommits({ ...thisRepo, base: releaseMinusOne, head: tag })
  compareResults.data
  const compareData: CompareResults = compareResults.data

  // Pull out all the GH crafted merge commits on a repo
  const numberExtractor = /Merge pull request #(\d*)/
  const commitMessages = compareData.commits.map(c => c.commit.message)
  const prMerges = commitMessages.filter(message => message && message.startsWith("Merge pull request #"))

  // This is now a number array of PR ids
  // e.g. [ 930, 934, 937, 932, 938 ]
  const prs = prMerges
    .map(msg => msg.match(numberExtractor) && msg.match(numberExtractor)![1])
    .filter(pr => pr)
    .map((pr: any) => parseInt(pr))

  const { getJiraTicketIDsFromCommits, getJiraTicketIDsFromText, uniq } = await import("./jira/utils")

  // We know we have something to work with now
  const jira: JiraApi.default = new (JiraApi as any)({
    protocol: "https",
    host: `${companyPrefix}.atlassian.net`,
    apiVersion: "2",
    strictSSL: true,
    username: process.env.JIRA_EMAIL,
    password: process.env.JIRA_ACCESS_TOKEN,
  })

  const prBodies = await Promise.all(
    prs.map(async pr => {
      const prResponse = await api.pullRequests.get({ ...thisRepo, number: pr })
      const prData = prResponse.data
      return prData.body
    })
  )

  const tickets = uniq([
    ...flatten(prBodies.map(b => getJiraTicketIDsFromText(b))),
    ...getJiraTicketIDsFromCommits(compareData.commits.map(c => c.commit)),
  ])

  // Bail if we have no work to do
  if (!tickets.length) {
    return console.log("No Jira ticket references found")
  }

  tickets.forEach(async ticketID => {
    try {
      const message = `Changes related to this issue have been released in the latest Eigen beta, ${tag}. You can download it in TestFlight; contact the #front-end-ios Slack channel for answers to any questions.`
      console.log(`Leaving a comment on ${ticketID}`)
      await jira.addComment(ticketID, message)
    } catch (err) {
      console.log(`Had an issue changing the status of ${ticketID}`)
      console.log(err.message)
      console.log(err)
    }
  })
}

interface Tag {
  name: string
  commit: {
    sha: string
    url: string
  }
}

interface Commit {
  commit: {
    message: string
  }
}

interface CompareResults {
  commits: Commit[]
}
