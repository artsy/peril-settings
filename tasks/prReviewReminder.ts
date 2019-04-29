import { peril, GitHubUser } from "danger"

export default async (reviewer: GitHubUser) => {
  // If user is no longer assigned to PR, return
  // If user has completed review, return
  // If user is still assigned and has not completed review, post message in PR and @ them
}
