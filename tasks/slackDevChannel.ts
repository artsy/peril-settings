import { peril } from "danger"
import { IncomingWebhook } from "@slack/client"

/**
 * A task that accepts Slack incoming webhook data
 * and sends a message into the Artsy Dev chat room.
 *
 * The full API docs for the syntax of the expected data
 * can be found: https://slackapi.github.io/node-slack-sdk/reference/IncomingWebhook
 * 
 * Usage in a Dangerfile:
 * 
    const message = {
      unfurl_links: false,
      attachments: [
        {
          pretext: "We can throw words around like two hundred million galaxies",
          color: "good",
          title: issue.title,
          title_link: issue.html_url,
          author_name: issue.user.login,
          author_icon: issue.user.avatar_url,
        },
      ],
    }

    peril.runTask("slack-dev-channel", "in 5 minutes", message)
 */

export default async (data: any) => {
  if (!data) {
    console.log("No data was passed to slack-dev-channel, so a message will not be sent.")
  } else {
    const url = peril.env.SLACK_RFC_WEBHOOK_URL || ""
    const webhook = new IncomingWebhook(url)
    console.log("Sending webhook", data)
    await webhook.send(data)
  }
}
