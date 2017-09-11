import { schedule, danger, warn, fail } from "danger"
const pr = danger.github.pr

// Highlight package dependencies on Node projects.
import yarn from "danger-plugin-yarn"
schedule(yarn())

// Keep our Markdown documents awesome
import spellcheck from "danger-plugin-spellcheck"
schedule(spellcheck({ settings: "artsy/artsy-danger@spellcheck.json" }))

// RFC: #5 - No PR is too small to warrant a paragraph or two of summary
// https://github.com/artsy/artsy-danger/issues/5
if (pr.body.length === 0) {
  fail("Please add a description to your PR.")
}

// RFC: #13 - Always ensure we assign someone, so that our Slackbot work correctly
// https://github.com/artsy/artsy-danger/issues/13
const wipPR = pr.title.includes("WIP ") || pr.title.includes("[WIP]")
if (!wipPR && pr.assignee === null) {
  warn("Please assign someone to merge this PR, and optionally include people who should review.")
}
