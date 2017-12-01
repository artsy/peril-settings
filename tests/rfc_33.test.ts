jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

declare const global: any

jest.mock("@slack/client", () => ({
  IncomingWebhook: jest.fn(),
}))

import { IncomingWebhook } from "@slack/client"

import { rfc33 } from "../org/closed-prs"

it("calls the issues API to get labels", () => {
  dm.danger = {
    github: {
      issue: {
        labels: [
          {
            name: "Consignments",
          },
          {
            name: "12345",
          },
        ],
      },
      pr: {
        title: "This awesome PR",
        user: {
          login: "orta",
          avatar_url: "https://123.com/image",
        },

        body: "",
        base: {
          user: {
            login: "orta",
          },
          repo: {
            name: "danger-js",
            html_url: "http://my_url.com",
          },
        },
        number: 23,
      },
      api: {
        issues: { get: jest.fn() },
      },
    },
  }

  global.peril = {
    env: {
      SLACK_RFC_WEBHOOK_URL: "123",
    },
  }

  IncomingWebhook.prototype.send = jest.fn()

  return rfc33().then(() => {
    expect(IncomingWebhook.prototype.send).toHaveBeenCalledWith({
      attachments: [
        {
          author_name: "orta",
          color: "good",
          title: "Merged: <http://my_url.com|This awesome PR> from orta",
          title_link: "http://my_url.com",
        },
      ],
      channel: "C52403S10",
      unfurl_links: false,
    })
  })
})
