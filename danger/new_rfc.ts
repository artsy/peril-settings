import { schedule, danger } from "danger"
import { IncomingWebhook } from "@slack/client"
import { Issues } from "github-webhook-event-types"

declare const peril: any // danger/danger#351

const gh = (danger.github as any) as Issues
const issue = gh.issue

if (issue.title.includes("RFC:") || issue.title.includes("[RFC]")) {
  var url = peril.env.SLACK_RFC_WEBHOOK_URL || ""
  var webhook = new IncomingWebhook(url)

  schedule(async () => {
    await webhook.send({
      unfurl_links: false,
      attachments: [
        {
          pretext: "🎉 A new RFC has been published.",
          color: "good",
          title: issue.title,
          title_link: issue.html_url,
          author_name: issue.user.login,
          author_icon: issue.user.avatar_url,
        },
      ],
    })
  })
}
