import { danger } from "danger"

export interface PRReviewMetadata {
  repoName: string
  prNumber: number
  reviewers: string[]
  owner: string
}

// TODO: We want to avoid looping through all reviewers every time a review is requested
// Check if the GH review_requested event includes the specific user whose review was requested
// If it does, we should just pass the single user and call runTask once per reviewer
export default async (metadata: PRReviewMetadata) => {
  const pullParams = {
    owner: metadata.owner,
    repo: metadata.repoName,
    number: metadata.prNumber,
  }
  // GH API to get to that PR
  const pr = await danger.github.api.pulls.get(pullParams)
  const reviews = await danger.github.api.pulls.listReviews(pullParams)
  const currentReviewers: string[] = pr.data.requested_reviewers.map(user => user.login)

  // Check all the reviewers against all the reviews
  for (let i = 0; i < metadata.reviewers.length; i++) {
    if (pr.data.state === "open" && currentReviewers.includes(metadata.reviewers[i])) {
      for (let j = 0; j < reviews.data.length; j++) {
        // If this reviewer has already reviewed, return
        if (reviews.data[j].user.login === metadata.reviewers[i]) {
          return
        }
        // If we've looped through all the reviews and didn't find one by our reviewer,
        // post a message in the pr and @ them. See https://octokit.github.io/rest.js/#octokit-routes-pulls for documentation
        const commentParams = {
          owner: metadata.owner,
          repo: metadata.repoName,
          number: metadata.prNumber,
          body: `@${metadata.reviewers[i]} it's been a full business day since your review was requested!\n
              Please add your review.`,
        }
        danger.github.api.issues.createComment(commentParams)
      }
    }
  }
}
