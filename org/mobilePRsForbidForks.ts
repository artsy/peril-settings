import { danger, warn, fail } from "danger"

// Mobile repos at Artsy have historically used PRs from branches on the repo,
// instead of PRs from forks. Our tooling still relies on this; PRs from forks
// won't even trigger CI builds on some of these projects, so we need to warn
// the authors via Peril.
const mobileRepos = ["eigen", "emission", "eidolon", "energy", "emergence"]

export default async () => {
  const pr = danger.github.pr
  const isMobileRepo = mobileRepos.filter(name => pr.base.repo.name.endsWith(name)).length > 0

  if (isMobileRepo && pr.head.repo.fork) {
    try {
      // Are they a member of the Artsy GitHub org? This will throw if not.
      await danger.github.api.orgs.checkMembership({ org: "artsy", username: pr.user.login })
      fail(
        "Artsy staff submitting PRs on this repo need to submit them from branches on the repo, and not from forks of the repo. This is a limitation of our CI infrastructure; please close this PR and re-open it from a branch."
      )
    } catch (error) {
      // They are not.
      warn(
        "This PR is on a repo with limited CI support for open source contributors; the reviewers may need to check out your code locally to run the tests."
      )
    }
  }
}
