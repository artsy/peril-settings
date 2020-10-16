import { danger, markdown } from "danger"

const semanticFormat = /^(fix|feat|build|chore|ci|docs|style|refactor|perf|test)(?:\(.+\))?!?:.+$/

// Nudge PR authors to use semantic commit formatting
// https://github.com/artsy/README/issues/327
export const rfc327 = () => {
  const pr = danger.github.pr

  if (!semanticFormat.test(pr.title)) {
    return markdown(
      "Hi there! :wave:\n\nWe're trialing semantic commit formatting which has not been detected in your PR title\n\nRefer to [this RFC](https://github.com/artsy/README/issues/327#issuecomment-698842527) and [Conventional Commits](https://www.conventionalcommits.org)for PR/commit formatting guidelines."
    )
  }
}
