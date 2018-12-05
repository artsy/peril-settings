import { danger, warn } from "danger"

export default async () => {
  const exchangeSchema = "src/data/exchange.graphql"
  const exchange = {
    owner: "artsy",
    repo: "exchange",
  }

  if (danger.git.modified_files.includes(exchangeSchema)) {
    const release = await danger.github.api.repos.getTags(exchange)
    const production = release.data.find(r => r.name === "production")
    const head = await danger.github.api.repos.getBranch({ ...exchange, branch: "master" })

    if (!production) {
      return fail("Exchange has no 'production' tag. Failing the PR until it can be found.")
    }

    if (head.data.commit.sha !== production.commit.sha) {
      warn("This PR introduces changes to Exchange which are not yet available in production.")
    }
  }
}
