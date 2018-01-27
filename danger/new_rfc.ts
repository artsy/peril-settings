import { danger, peril } from "danger"
import { Issues } from "github-webhook-event-types"

export const check = () => {
  const gh = (danger.github as any) as Issues
  const issue = gh.issue

  const slackify = (text: string) => ({
    unfurl_links: false,
    attachments: [
      {
        pretext: text,
        color: "good",
        title: issue.title,
        title_link: issue.html_url,
        author_name: issue.user.login,
        author_icon: issue.user.avatar_url,
      },
    ],
  })

  if (issue.title.includes("RFC:") || issue.title.includes("[RFC]")) {
    peril.runTask("slack-dev-channel", "in 5 minutes", slackify("🎉: A new RFC has been published."))
    peril.runTask("slack-dev-channel", "in 3 days", slackify("🕰: A new RFC was published 3 days ago."))
    peril.runTask("slack-dev-channel", "in 7 days", slackify("🕰: A new RFC is ready to be resolved."))
  }
}

const isJest = typeof jest !== "undefined"
if (!isJest) {
  check()
}
