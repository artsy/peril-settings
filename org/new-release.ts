import { schedule, danger, warn, fail, peril } from "danger"
import { IncomingWebhook } from "@slack/client"
import { Create } from "github-webhook-event-types"

// Note new tags inside a releases channel
// https://github.com/artsy/artsy-danger/issues/33
export default async () => {
  const api = danger.github.api
  const create = (danger.github as any) as Create

  // Only make announcements for tags
  if (create.ref_type !== "tag") {
    return
  }

  var url = peril.env.SLACK_RFC_WEBHOOK_URL || ""
  var webhook = new IncomingWebhook(url)

  await webhook.send({
    unfurl_links: false,
    channel: "CA3LTRT0T",
    attachments: [
      {
        color: "good",
        title: `Deployed ${create.repository.name} - ${create.ref}`,
        title_link: `${create.repository.html_url}}`,
        author_name: create.sender.login,
        author_icon: create.sender.avatar_url,
      },
    ],
  })
}
