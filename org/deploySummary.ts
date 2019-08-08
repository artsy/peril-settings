import { danger, GitHubCommit, markdown } from "danger"

// Returns `true` if this is a PR to the `release` branch.
const isRelease = () => {
  return danger.github.pr.base.ref === "release"
}

// Map of PR's included in the deploy.
// (will be outputted as a comment)
interface PRInfoMap {
  [prNumber: number]: PRInfo
}
// Info per PR that is included
interface PRInfo {
  title: string
  href: string
}
// Memoized map of PR's included, and their info.
const prMap: PRInfoMap = {}

// For a given commit, will attempt to retrieve the corresponding
// closed PR via the search API.
const dataForCommit = async (commit: GitHubCommit) => {
  const sha = commit.sha
  const repo = danger.github.thisPR.repo
  const owner = danger.github.thisPR.owner
  const searchResponse = await danger.github.api.search.issuesAndPullRequests({
    q: `${sha} type:pr is:closed repo:${owner}/${repo}`,
  })
  const prsWithCommit = searchResponse.data.items.map((i: any) => i.number) as number[]

  // Assume that the only PR containing the SHA is the corresponding PR.
  const prNumber = prsWithCommit.length && prsWithCommit[0]
  if (!prNumber) return

  // Already fetched this PR info (from an earlier commit).
  if (prMap[prNumber]) return

  const issue = await danger.github.api.issues.get({
    owner,
    repo,
    number: prNumber,
  })

  // Store memoized data.
  prMap[prNumber] = {
    title: issue.data.title,
    href: `https://github.com/${owner}/${repo}/${prNumber}`,
  }
}

export const deploySummary = async () => {
  if (!isRelease()) return

  await Promise.all(danger.github.commits.map(c => dataForCommit(c)))

  if (!Object.keys(prMap).length) return

  const message =
    "### This deploy contains the following PRs:\n\n" +
    Object.entries(prMap)
      .map(([_number, info]) => {
        return `${info.title} (${info.href})\n`
      })
      .join("")

  return markdown(message)
}
