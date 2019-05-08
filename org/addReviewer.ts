import { danger, peril } from "danger"
import { PRReviewMetadata } from "../tasks/prReviewReminder"
import { PullRequest } from "github-webhook-event-types"
import { PullRequestPullRequestPullRequestUser as User } from "github-webhook-event-types/source/PullRequest"

// This interface gets around the fact that github-webhook-event-types doesn't include a requested_reviewer field
// on pull_request.review_requested event types (requested_reviewer only exists on certain events).
// See the GitHub API documentation here: https://developer.github.com/v3/activity/events/types/#webhook-payload-example-28
export interface RequestedReview extends PullRequest {
  requested_reviewer: User
}

// Remind reviewers if a review hasn't been received in 1 business day
// https://github.com/artsy/README/issues/177
export const rfc177_2 = (reviewRequestEvent: RequestedReview) => {
  const now = new Date()
  if (reviewRequestEvent.requested_reviewer) {
    scheduleReviewReminders(now, reviewRequestEvent.requested_reviewer.login)
  }
}

export const scheduleReviewReminders = (now: Date, requestedReviewer: string) => {
  // Get the day of the week & make it more human-readable
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const day = days[now.getDay()]

  const pr = danger.github.pr

  const metadata: PRReviewMetadata = {
    repoName: pr.base.repo.name,
    prNumber: pr.number,
    requestedReviewer,
    owner: pr.base.repo.owner.login,
  }

  const runReviewReminder = (time: string, metadata: PRReviewMetadata) =>
    peril.runTask("pr-review-reminder", time, metadata)

  // Send review reminders on the next business day
  if (day === "Friday") {
    runReviewReminder("in 3 days", metadata)
  } else if (day === "Saturday") {
    runReviewReminder("in 2 days", metadata)
  } else {
    runReviewReminder("in 1 day", metadata)
  }
}

export default rfc177_2
