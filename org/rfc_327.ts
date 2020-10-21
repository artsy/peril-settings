import { danger, markdown } from "danger"

const semanticFormat = /^(fix|feat|build|chore|ci|docs|style|refactor|perf|test)(?:\(.+\))?!?:.+$/
const enabledRepos = ["peril-settings", "volt"]

// Nudge PR authors to use semantic commit formatting
// https://github.com/artsy/README/issues/327
export const rfc327 = () => {
  const pr = danger.github.pr
  const repoName = pr.base.repo.name

  if (enabledRepos.includes(repoName) && !semanticFormat.test(pr.title)) {
    return markdown(
      "Hi there! :wave:\n\nWe're trialing semantic commit formatting which has not been detected in your PR title.\n\nRefer to [this RFC](https://github.com/artsy/README/issues/327#issuecomment-698842527) and [Conventional Commits](https://www.conventionalcommits.org) for PR/commit formatting guidelines."
    )
  }
}

export default rfc327
