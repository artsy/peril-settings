import { schedule, danger, warn, fail, peril } from "danger"
import { IncomingWebhook } from "@slack/client"
import { Create } from "github-webhook-event-types"

// Note new tags inside a releases channel
// https://github.com/artsy/peril-settings/issues/40
//
export default async (create: Create) => {
  if (create.ref_type !== "tag") {
    return console.log("Skipping because it's not a tag")
  }

  if (!peril.env.SLACK_RFC_WEBHOOK_URL) {
    throw new Error("There is no slack webhook env var set up")
  }

  var webhook = new IncomingWebhook(peril.env.SLACK_RFC_WEBHOOK_URL)
  await webhook.send({
    unfurl_links: false,
    channel: "CA3LTRT0T",
    attachments: [
      {
        color: "good",
        title: `Deployed ${create.repository.name} - ${create.ref}`,
        title_link: create.repository.html_url,
        author_name: create.sender.login,
        author_icon: create.sender.avatar_url,
      },
    ],
  })
}
