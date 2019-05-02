import { danger, peril } from "danger"
import { PRReviewMetadata } from "../tasks/prReviewReminder"

// Remind reviewers if a review hasn't been received in 1 business day. Does not support teams, only individual users
// https://github.com/artsy/README/issues/177
export const rfc177_2 = () => {
  const now = new Date()
  if (danger.github.requested_reviewers.users && danger.github.requested_reviewers.users.length > 0) {
    scheduleReviewReminders(now)
  }
}

export const scheduleReviewReminders = (now: Date) => {
  // Get the day of the week & make it more human-readable
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const day = days[now.getDay()]

  const metadata: PRReviewMetadata = {
    repoName: danger.github.pr.base.repo.name,
    prNumber: danger.github.pr.number,
    reviewers: danger.github.requested_reviewers.users.map(user => user.login),
    owner: danger.github.pr.base.repo.owner.login,
  }

  // Runs the review reminder task on each user assigned to review a PR
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
