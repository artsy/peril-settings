jest.mock("danger", () => jest.fn())
import * as danger from "danger"
const dm = danger as any

import { check } from "../danger/new-rfc"

it("ignores issues which aren't RFCs", () => {
  dm.danger = {
    github: {
      issue: {
        title: "This awesome PR",
        html_url: "123",
        user: {
          login: "orta",
          avatar_url: "https://123.com",
        },
      },
    },
  }

  dm.peril = {
    runTask: jest.fn(),
  }

  check()

  expect(dm.peril.runTask).not.toBeCalled()
})

it("Triggers tasks when RFC is in the title", () => {
  dm.danger = {
    github: {
      issue: {
        title: "[RFC] Let's make a change",
        html_url: "123",
        user: {
          login: "orta",
          avatar_url: "https://123.com",
        },
      },
    },
  }

  dm.peril = {
    runTask: jest.fn(),
  }

  check()

  expect(dm.peril.runTask).toHaveBeenCalledWith("slack-dev-channel", "in 5 minutes", expect.anything())
  expect(dm.peril.runTask).toHaveBeenCalledWith("slack-dev-channel", "in 3 days", expect.anything())
  expect(dm.peril.runTask).toHaveBeenCalledWith("slack-dev-channel", "in 7 days", expect.anything())
})
