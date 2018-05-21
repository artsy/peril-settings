import { schedule, danger, warn, fail, peril } from "danger"
import { IncomingWebhook } from "@slack/client"
import { PullRequest, Issues } from "github-webhook-event-types"

// Ping slack channels for related labels
// https://github.com/artsy/artsy-danger/issues/33
export default async () => {
  const pr = danger.github.pr
  // You can get the channel ID by opening slack in
  // the web inspector and looking at the channel name
  const labelsMap = {
    consignments: "C52403S10",
    auctions: "C0C4AJ1PF",
  } as any

  // Find the labels in both the map above, and in the PR's labels
  const allWantedLabels = Object.keys(labelsMap)
  const labelsToAlert: string[] = danger.github.issue.labels
    .map(l => l.name.toLowerCase())
    .filter((l: string) => allWantedLabels.includes(l))

  // Loop through and send out Slack messages
  for (const label of labelsToAlert) {
    var url = peril.env.SLACK_RFC_WEBHOOK_URL || ""
    var webhook = new IncomingWebhook(url)

    await webhook.send({
      unfurl_links: false,
      channel: labelsMap[label],
      attachments: [
        {
          color: "good",
          title: `PR merged on ${pr.base.repo.name} - ${pr.title}`,
          title_link: `${pr.base.repo.html_url}/pull/${pr.number}`,
          author_name: pr.user.login,
          author_icon: pr.user.avatar_url,
        },
      ],
    })
  }
}
