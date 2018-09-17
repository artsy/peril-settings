import { danger } from "danger"
import { Issues } from "github-webhook-event-types"

/**
 * When an an issue/PR is created, check to see if the title includes
 * RFC, if it does - then add (or create) the label "RFC".
 */
export default async (issues: Issues) => {
  const issue = issues.issue

  if (issue.title.includes("RFC:") || issue.title.includes("[RFC]")) {
    // Marks it as an RFC
    console.log("Adding label to the issue")
    await danger.github.utils.createOrAddLabel(
      {
        name: "RFC",
        color: "053a68",
        description: "Indicates that this PR is a Request For Comments",
      },
      {
        owner: issues.repository.owner.login,
        repo: issues.repository.name,
        id: issue.number,
      }
    )
  }
}
