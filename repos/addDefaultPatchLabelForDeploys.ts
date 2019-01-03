import { danger } from "danger"
import { PullRequest } from "github-webhook-event-types"

// Re: https://github.com/artsy/reaction/issues/1095

export const rfcReaction1095 = async (status: PullRequest) => {
  const api = danger.github.api
  const issue = (await api.issues.get({ ...danger.github.thisPR })).data
}

export default rfcReaction1095
