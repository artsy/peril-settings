import { danger } from "danger"

export default async (data: { prNumber: number }) => {
  danger.github.api.reactions.createForIssue({
    owner: "artsy",
    repo: "peril-settings",
    number: data.prNumber,
    content: "+1",
  })
}
