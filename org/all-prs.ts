import { schedule, danger, warn, fail } from "danger"

const isJest = typeof jest !== "undefined"

// Stores the parameter in a closure that can be invoked in tests.
const storeRFC = (reason: string, closure: () => void | Promise<any>) =>
  // We return a closure here so that the (promise is resolved|closure is invoked)
  // during test time and not when we call rfc().
  () => (closure instanceof Promise ? closure : Promise.resolve(closure()))

// Either schedules the promise for execution via Danger, or invokes closure.
const runRFC = (reason: string, closure: () => void | Promise<any>) =>
  closure instanceof Promise ? schedule(closure) : closure()

const rfc: any = isJest ? storeRFC : runRFC

import yarn from "danger-plugin-yarn"
rfc("Highlight package dependencies on Node projects", async () => {
  await yarn()
})

import spellcheck from "danger-plugin-spellcheck"
rfc("Keep our Markdown documents awesome", async () => {
  await spellcheck({ settings: "artsy/artsy-danger@spellcheck.json" })
})

// https://github.com/artsy/artsy-danger/issues/5
export const rfc5 = rfc("No PR is too small to warrant a paragraph or two of summary", () => {
  const pr = danger.github.pr
  if (pr.body.length === 0) {
    fail("Please add a description to your PR.")
  }
})

// https://github.com/artsy/artsy-danger/issues/13
export const rfc13 = rfc("Always ensure we assign someone, so that our Slackbot work correctly", () => {
  const pr = danger.github.pr
  const wipPR = pr.title.includes("WIP ") || pr.title.includes("[WIP]")
  if (!wipPR && pr.assignee === null) {
    warn("Please assign someone to merge this PR, and optionally include people who should review.")
  }
})

// https://github.com/artsy/artsy-danger/issues/16
export const rfc16 = rfc("Require changelog entries on PRs with code changes", async () => {
  const pr = danger.github.pr
  const changelogs = ["CHANGELOG.md", "changelog.md", "CHANGELOG.yml"]

  const getContentParams = { path: "", owner: pr.head.user.login, repo: pr.head.repo.name }
  const rootContents: any = await danger.github.api.repos.getContent(getContentParams)

  const hasChangelog = rootContents.data.find(file => changelogs.includes(file.name))
  if (hasChangelog) {
    const files = [...danger.git.modified_files, ...danger.git.created_files]

    const hasCodeChanges = files.find(file => !file.match(/(test|spec)/i))
    const hasChangelogChanges = files.find(file => changelogs.includes(file))

    if (hasCodeChanges && !hasChangelogChanges) {
      warn("It looks like code was changed without adding anything to the Changelog")
    }
  }
})
