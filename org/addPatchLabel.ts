import { danger } from "danger"

export const labels = {
  Patch: {
    color: "E0E4CC",
    description: "A deploy for bug fixes or minor changes",
  },
  Minor: {
    color: "A7DBD8",
    description: "A deploy for new features",
  },
  Major: {
    color: "FA6900",
    description: "A deploy for breaking changes to clients",
  },
  Trivial: {
    color: "A7DBD8",
    description: "Skip a deploy for this PR",
  },
}

// Adds a patch label to PRs that don't already have a version indicator
// https://github.com/artsy/reaction/issues/1095
//
export default async () => {
  const pr = danger.github.pr

  const hasAutoRC = await danger.github.utils.fileContents(".autorc")
  if (!hasAutoRC) {
    console.log(`This repo not have an .autorc, so we're not adding a patch label .`)
    return
  }

  const patchLabelName = "Version: Patch"
  const requiredPrefix = "Version: "

  // Someone's already made a decision on the version
  const hasAlreadyGotLabel = danger.github.issue.labels.find(l => l.name.startsWith(requiredPrefix))
  if (hasAlreadyGotLabel) {
    console.log(`Skipping setting the patch label, because the PR author already set one.`)
    return
  }

  const config = {
    owner: pr.base.user.login,
    repo: pr.base.repo.name,
  }

  const api = danger.github.api
  const existingLabels = await api.issues.getLabels(config)
  const patchExists = existingLabels.data.find(l => l.name == patchLabelName)

  // Check to see if the label exists for this repo, if not - make the full set
  if (!patchExists) {
    console.log(`First time running on new repo, creating labels for release versions`)
    for (let [label, labelProperties] of Object.entries(labels)) {
      await api.issues.createLabel({
        name: `Version: ${label}`,
        ...config,
        ...labelProperties,
      })
    }
  }

  // Add the label
  console.log(`Adding the patch label to this PR`)
  await api.issues.addLabels({
    number: pr.number,
    ...config,
    labels: [patchLabelName],
  })
}
