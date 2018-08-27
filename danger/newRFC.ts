import { peril } from "danger"
import { Issues } from "github-webhook-event-types"

export default async (issues: Issues) => {
  const issue = issues.issue

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
    console.log("Triggering slack notifications")

    await peril.runTask("slack-dev-channel", "in 5 minutes", slackify("🎉: A new RFC has been published."))
    await peril.runTask("slack-dev-channel", "in 3 days", slackify("🕰: A new RFC was published 3 days ago."))
    await peril.runTask("slack-dev-channel", "in 7 days", slackify("🕰: A new RFC is ready to be resolved."))

    console.log("Triggered slack notifications")
  }
}
