import { schedule, danger, warn, fail, peril } from "danger"
import { IncomingWebhook } from "@slack/client"
import { Create } from "github-webhook-event-types"

const isJest = typeof jest !== "undefined"

// Stores the parameter in a closure that can be invoked in tests.
const storeRFC = (reason: string, closure: () => void | Promise<any>) =>
  // We return a closure here so that the (promise is resolved|closure is invoked)
  // during test time and not when we call rfc().
  () => (closure instanceof Promise ? closure : Promise.resolve(closure()))

// Either schedules the promise for execution via Danger, or invokes closure.
const runRFC = (reason: string, closure: () => void | Promise<any>) =>
  closure instanceof Promise ? schedule(closure) : closure()

const rfc: any = isJest ? storeRFC : runRFC

// https://github.com/artsy/artsy-danger/issues/33
export const rfc53 = rfc("Note new tags inside a releases channel", async () => {
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
})
