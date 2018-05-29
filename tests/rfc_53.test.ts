jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any
jest.mock("@slack/client", () => ({
  IncomingWebhook: jest.fn(),
}))
import { IncomingWebhook } from "@slack/client"

import rfc53 from "../org/new-release"

it("sends a webhook for creates which are tags", async () => {
  IncomingWebhook.prototype.send = jest.fn()

  const webhook = {
    ref_type: "tag",
    ref: "v1.4.0",
    repository: {
      name: "eigen",
      html_url: "http://url.com",
    },
    sender: {
      login: "Yuki",
      avatar_url: "http://my.avatar.com",
    },
  }

  dm.peril = {
    env: { SLACK_RFC_WEBHOOK_URL: "https://123.com/api" },
  }

  await rfc53(webhook as any)

  expect(IncomingWebhook.prototype.send).toHaveBeenCalledWith({
    attachments: [
      {
        author_icon: "http://my.avatar.com",
        author_name: "Yuki",
        color: "good",
        title: "Deployed eigen - v1.4.0",
        title_link: "http://url.com",
      },
    ],
    channel: "CA3LTRT0T",
    unfurl_links: false,
  })
})
