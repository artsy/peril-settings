import { danger } from "danger"

export interface PRReviewMetadata {
  repoName: string
  prNumber: number
  reviewer: string
  owner: string
}

export default async (metadata: PRReviewMetadata) => {
  const pullParams = {
    owner: metadata.owner,
    repo: metadata.repoName,
    number: metadata.prNumber,
  }
  // Get the PR we want to add a comment to
  const pr = await danger.github.api.pulls.get(pullParams)
  const reviews = await danger.github.api.pulls.listReviews(pullParams)
  const currentReviewers: string[] = pr.data.requested_reviewers.map(user => user.login)

  // Confirm that the PR is still open and the initially requested reviewer is still requested
  if (pr.data.state === "open" && currentReviewers.includes(metadata.reviewer)) {
    // Loop through the reviews and see if this reviewer has already reviewed
    for (let i = 0; i < reviews.data.length; i++) {
      // If they have, just return
      if (reviews.data[i].user.login === metadata.reviewer) {
        return
      }
      // If we've looped through all the reviews and didn't find one by our reviewer,
      // post a message in the pr and @ them. See https://octokit.github.io/rest.js/#octokit-routes-pulls for documentation
      const commentParams = {
        owner: metadata.owner,
        repo: metadata.repoName,
        number: metadata.prNumber,
        body: `@${
          metadata.reviewer
        } it's been a full business day since your review was requested!\nPlease add your review.`,
      }
      danger.github.api.issues.createComment(commentParams)
    }
  }
}
