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

  const rfc = issue.labels.find(l => l.name === "RFC")
  if (rfc) {
    console.log("Triggering slack notifications")

    await peril.runTask("slack-dev-channel", "in 5 minutes", slackify("🎉: A new RFC has been published."))
    await peril.runTask("slack-dev-channel", "in 3 days", slackify("🕰: A new RFC was published 3 days ago."))

    // When someone is resolving, you nearly always need the template, so add that incase
    const urlForDocumentationAttachment: MessageAttachment = {
      title: "How to resolve an RFC",
      title_link: "https://github.com/artsy/README/blob/main/playbooks/rfcs.md#resolution",
    }

    // Send the final message
    await peril.runTask(
      "slack-dev-channel",
      "in 7 days",
      slackify("🕰: A new RFC is ready to be resolved.", urlForDocumentationAttachment)
    )

    console.log("Triggered slack notifications")
  }
}
