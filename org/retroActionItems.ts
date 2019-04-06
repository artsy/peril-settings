import { peril } from "danger"
import { Issues } from "github-webhook-event-types"
import { IncomingWebhookSendArguments, MessageAttachment } from "@slack/client"

/**
 * When an issue has been labelled RFC, then trigger the scheduler
 * to send reminders about the issue into our slack.
 */

export default async (issues: Issues) => {
  const issue = issues.issue

  const slackify = (text: string, attachment: MessageAttachment = {}): IncomingWebhookSendArguments => ({
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
      attachment,
    ],
  })

  const retroActionItem = issue.labels.find(l => l.name === "Retro Action Item")
  if (retroActionItem) {
    console.log("Triggering slack notifications")

    await peril.runTask("slack-dev-channel", "in 5 minutes", slackify("🎉: A new Retro Action Item is shared."))

    console.log("Triggered slack notifications")
  }
}
