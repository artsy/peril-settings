import { danger } from "danger"

export const labels = {
  Patch: {
    color: "E0E4CC",
    description: "Indicates that this PR should have a patch deploy, usually for bug fixes",
  },
  Minor: {
    color: "A7DBD8",
    description: "Indicates that this PR should have a minor deploy, usually for new features",
  },
  Major: {
    color: "FA6900",
    description: "Indicates that this PR should have a major deploy, usually for larger-breaking changes for clients",
  },
  Trivial: {
    color: "A7DBD8",
    description: "This indicates that the PR does not need a deploy",
  },
}

// Adds a patch label to PRs that don't already have a version indicator
// https://github.com/artsy/reaction/issues/1095
//
export default async () => {
  const pr = danger.github.pr

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
