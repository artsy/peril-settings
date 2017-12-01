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
      pull_request: {
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
          },
        },
        number: 23,
      },
      api: {
        issues: { get: jest.fn() },
      },
    },
  }

  const issue = {
    labels: ["12345", "consignments"],
  }

  const issuesMock = dm.danger.github.api.issues.get
  issuesMock.mockImplementationOnce(() => Promise.resolve(issue))

  global.peril = {
    env: {
      SLACK_RFC_WEBHOOK_URL: "123",
    },
  }

  IncomingWebhook.prototype.send = jest.fn()

  return rfc33().then(() => {
    expect(issuesMock).toHaveBeenCalledWith({ number: 23, owner: "orta", repo: "danger-js" })

    expect(IncomingWebhook.prototype.send).toHaveBeenCalledWith({
      attachments: [
        {
          author_icon: "https://123.com/image",
          author_name: "orta",
          color: "good",
          title: "Merged: <undefined|undefined> from orta",
          title_link: undefined,
        },
      ],
      channel: "C52403S10",
      unfurl_links: false,
    })
  })
})
