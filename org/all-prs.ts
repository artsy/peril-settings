import { schedule, danger, warn, fail } from "danger"
const pr = danger.github.pr

const isJest = typeof jest !== "undefined"

const rfc = isJest ? require("./utils").rfc : (id: string, reason: string, closure: any) => closure()

import yarn from "danger-plugin-yarn"
rfc("1", "Highlight package dependencies on Node projects", () => {
  schedule(yarn())
})

import spellcheck from "danger-plugin-spellcheck"
rfc("2", "Keep our Markdown documents awesome", () => {
  schedule(spellcheck({ settings: "artsy/artsy-danger@spellcheck.json" }))
})

// https://github.com/artsy/artsy-danger/issues/5
rfc("5", "No PR is too small to warrant a paragraph or two of summary", () => {
  if (pr.body.length === 0) {
    fail("Please add a description to your PR.")
  }
})

// https://github.com/artsy/artsy-danger/issues/13
rfc("13", "Always ensure we assign someone, so that our Slackbot work correctly", () => {
  const wipPR = pr.title.includes("WIP ") || pr.title.includes("[WIP]")
  if (!wipPR && pr.assignee === null) {
    warn("Please assign someone to merge this PR, and optionally include people who should review.")
  }
})
