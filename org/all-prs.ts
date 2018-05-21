import { schedule, danger, warn, fail } from "danger"

import yarn from "danger-plugin-yarn"

// "Highlight package dependencies on Node projects"
const rfc1 = async () => {
  await yarn()
}

import spellcheck from "danger-plugin-spellcheck"
// "Keep our Markdown documents awesome",
const rfc2 = async () => {
  await spellcheck({ settings: "artsy/artsy-danger@spellcheck.json" })
}

// "No PR is too small to warrant a paragraph or two of summary"
// https://github.com/artsy/artsy-danger/issues/5
export const rfc5 = () => {
  const pr = danger.github.pr
  if (pr.body === null || pr.body.length === 0) {
    fail("Please add a description to your PR.")
  }
}

// "Hook commit contexts to GitHub PR/Issue labels"
// https://github.com/artsy/artsy-danger/issues/7
export const rfc7 = async () => {
  const pr = danger.github.thisPR
  const commitLabels: string[] = danger.git.commits
    .map(c => c.message)
    .filter(m => m.startsWith("[") && m.includes("]"))
    .map(m => (m.match(/\[(.*)\]/) as any)[1]) // Guaranteed to match based on filter above.

  if (commitLabels.length > 0) {
    const api = danger.github.api
    const githubLabels = await api.issues.getLabels({ owner: pr.owner, repo: pr.repo })
    const matchingLabels = (githubLabels.data as { name: string }[])
      .map(l => l.name)
      .filter(l => commitLabels.find(cl => l === cl))
      .filter(l => !danger.github.issue.labels.find(label => label.name === l))

    if (matchingLabels.length > 0) {
      await api.issues.addLabels({ owner: pr.owner, repo: pr.repo, number: pr.number, labels: matchingLabels })
    }
  }
}

// Always ensure we assign someone, so that our Slackbot work correctly
// https://github.com/artsy/artsy-danger/issues/13
export const rfc13 = () => {
  const pr = danger.github.pr
  const wipPR = pr.title.includes("WIP ") || pr.title.includes("[WIP]")
  if (!wipPR && pr.assignee === null) {
    warn("Please assign someone to merge this PR, and optionally include people who should review.")
  }
}

// Require changelog entries on PRs with code changes
// https://github.com/artsy/artsy-danger/issues/16
export const rfc16 = async () => {
  const pr = danger.github.pr
  const changelogs = ["CHANGELOG.md", "changelog.md", "CHANGELOG.yml"]
  const isOpen = danger.github.pr.state === "open"

  // Get all the files in the root folder of the repo
  // e.g. https://api.github.com/repos/artsy/eigen/git/trees/master
  const getContentParams = { owner: pr.head.user.login, repo: pr.head.repo.name, sha: "master" }
  const rootContents: any = await danger.github.api.gitdata.getTree(getContentParams)

  const hasChangelog = rootContents.data.tree.find((file: { path: string }) => changelogs.includes(file.path))
  if (isOpen && hasChangelog) {
    const files = [...danger.git.modified_files, ...danger.git.created_files]

    const hasCodeChanges = files.find(file => !file.match(/(test|spec)/i))
    const hasChangelogChanges = files.find(file => changelogs.includes(file))

    if (hasCodeChanges && !hasChangelogChanges) {
      warn("It looks like code was changed without adding anything to the Changelog")
    }
  }
}

// The default run
export default async () => {
  rfc1()
  await rfc2()
  rfc5()
  await rfc7()
  rfc13()
  await rfc16()
}
